'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, ChevronLeft, X, Check, CheckCheck, MapPin, 
  Shield, Loader2, Mic, Image as ImageIcon, FileText, 
  Paperclip, Pause, Square, Trash2, Play, Download
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, getDoc, writeBatch,
  increment 
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ChatPage() {
  const router = useRouter();
  const { chatId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // 1. Auth Listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Fetch Chat Participant Info
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const fetchParticipant = async () => {
      try {
        const chatSnap = await getDoc(doc(db, "chats", chatId));
        if (chatSnap.exists()) {
          const chatData = chatSnap.data();
          const otherUid = chatData.participants?.find(p => p !== currentUser.uid);
          
          if (otherUid) {
            const uSnap = await getDoc(doc(db, 'users', otherUid));
            if (uSnap.exists()) {
              setOtherUser({ id: otherUid, ...uSnap.data() });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching participant:", err);
      }
    };

    fetchParticipant();
  }, [chatId, currentUser]);

  // 3. Real-time Messages Listener
  useEffect(() => {
    if (!chatId) return;

    const msgsRef = collection(db, "chats", chatId, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgsData);
      setLoading(false);
      
      // Auto scroll
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);
  
  // 4. Mark messages as seen when they arrive
  useEffect(() => {
    if (!chatId || !currentUser || messages.length === 0) return;

    const markAsSeen = async () => {
      const unseenMessages = messages.filter(
        m => m.senderId !== currentUser.uid && m.status !== 'seen'
      );

      if (unseenMessages.length > 0) {
        const batch = writeBatch(db);
        unseenMessages.forEach((m) => {
          const msgRef = doc(db, "chats", chatId, "messages", m.id);
          batch.update(msgRef, { status: "seen" });
        });
        await batch.commit();
      }
    };

    markAsSeen();
  }, [chatId, currentUser, messages]);

  // 5. Reset unread count for current user
  useEffect(() => {
    if (!chatId || !currentUser) return;
    
    const resetUnread = async () => {
      try {
        await updateDoc(doc(db, "chats", chatId), {
          [`unreadCount.${currentUser.uid}`]: 0
        });
      } catch (err) {
        console.error("Error resetting unread:", err);
      }
    };

    resetUnread();
  }, [chatId, currentUser]);

  // 6. Universal Upload Function
  const uploadFile = async (file, userId) => {
    try {
      if (!file) throw new Error("No file provided");
      console.log("currentUser before upload:", userId);
      console.log("file before upload:", file);

      const fileRef = ref(
        storage,
        `chat/${userId}/${Date.now()}-${file.name || 'untitle.mp3'}`
      );

      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      console.log("Upload success:", url);
      return url;
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      throw error;
    }
  };

  const handleVoiceSend = async (audioBlob) => {
    if (!audioBlob || !currentUser) return;
    setIsUploading(true);
    
    try {
      const file = new File(
        [audioBlob],
        `voice-${Date.now()}.mp3`,
        { type: "audio/mpeg" }
      );

      const url = await uploadFile(file, currentUser.uid);

      await addDoc(collection(db, "chats", chatId, "messages"), {
        type: "audio",
        audioUrl: url,
        duration: recordingTime,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        status: "sent"
      });

      // Update parent chat
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: "🎤 Voice Note",
        updatedAt: serverTimestamp(),
        [`unreadCount.${otherUser?.id}`]: increment(1)
      });
    } catch (error) {
      console.error("VOICE SEND ERROR:", error);
      alert("Failed to send voice note.");
    } finally {
      setIsUploading(false);
      setRecordingTime(0);
    }
  };

  const handleImageSend = async (file) => {
    if (!file || !currentUser) return;
    if (!file.type.includes("image")) {
      alert("Please select an image file.");
      return;
    }
    
    setIsUploading(true);
    setShowAttachMenu(false);
    
    try {
      const url = await uploadFile(file, currentUser.uid);

      await addDoc(collection(db, "chats", chatId, "messages"), {
        type: "image",
        imageUrl: url,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        status: "sent"
      });

      // Update parent chat
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: "📷 Photo",
        updatedAt: serverTimestamp(),
        [`unreadCount.${otherUser?.id}`]: increment(1)
      });
    } catch (error) {
      console.error("IMAGE SEND ERROR:", error);
      alert("Failed to send image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSend = async (file) => {
    if (!file || !currentUser) return;
    setIsUploading(true);
    setShowAttachMenu(false);
    
    try {
      const url = await uploadFile(file, currentUser.uid);
      await addDoc(collection(db, "chats", chatId, "messages"), {
        type: "file",
        fileUrl: url,
        fileName: file.name,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        status: "sent"
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: `📄 ${file.name}`,
        updatedAt: serverTimestamp(),
        [`unreadCount.${otherUser?.id}`]: increment(1)
      });
    } catch (error) {
      console.error("FILE SEND ERROR:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendText = async (e) => {
    e?.preventDefault();
    if (!msg.trim() || !currentUser) return;
    const currentText = msg.trim();
    setMsg('');
    
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        type: "text",
        text: currentText,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        status: "sent"
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: currentText,
        updatedAt: serverTimestamp(),
        [`unreadCount.${otherUser?.id}`]: increment(1)
      });
    } catch (err) {
      console.error("TEXT SEND ERROR:", err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleVoiceSend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Audio permission denied:", err);
      alert("Microphone access is required for voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Important: prevent handleVoiceSend from firing
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
      audioChunksRef.current = [];
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-dvh bg-[#F8F9FA] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0B0B0B] border-b border-white/5 px-4 py-3 flex items-center gap-3 shrink-0 pt-safe mt-16 md:mt-20 shadow-lg">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        <div className="relative shrink-0">
          <Image unoptimized width={100} height={100} 
            src={otherUser?.profilePic || otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name || 'U'}`} 
            alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]/30 shadow-sm" 
          />
          {otherUser?.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B0B0B]" />}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm truncate">{otherUser?.name || 'Chat'}</h3>
          <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest opacity-80">
            {otherUser?.isOnline ? 'Online now' : 'Chat Session'}
          </p>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9FA]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 mb-4">👋</div>
            <h4 className="font-bold text-brand-dark mb-1">Say hello!</h4>
            <p className="text-xs text-brand-gray">Start the conversation by sending a message below.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUser?.uid;
            return (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-md relative group ${
                  isMe 
                    ? 'bg-[#D4AF37] text-black rounded-tr-none' 
                    : 'bg-[#0B0B0B] text-white border border-white/10 rounded-tl-none shadow-xl shadow-black/20'
                }`}>
                  
                  {/* Text Style (Fallback to text if type is missing) */}
                  {(!m.type || m.type === 'text') && <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.text}</p>}

                  {/* Image Style */}
                  {m.type === 'image' && (
                    <div className="space-y-2">
                       <Image 
                         unoptimized 
                         width={400} 
                         height={400} 
                         src={m.imageUrl || m.fileUrl} 
                         alt="Uploaded" 
                         className="rounded-xl object-cover max-h-64 md:max-h-96 w-full cursor-zoom-in" 
                       />
                       {m.text && m.text !== '📷 Photo' && <p className="leading-relaxed font-medium">{m.text}</p>}
                    </div>
                  )}

                  {/* Audio Style */}
                  {m.type === 'audio' && (
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-black/20' : 'bg-white/10'}`}>
                        <Mic size={18} className={isMe ? 'text-black' : 'text-[#D4AF37]'} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <audio controls src={m.audioUrl || m.fileUrl} className={`w-full h-8 ${isMe ? 'filter invert' : 'opacity-80'}`} />
                        <div className="flex justify-between text-[9px] px-1 opacity-60 font-bold">
                          <span>Voice Note</span>
                          <span>{m.duration ? `${Math.floor(m.duration / 60)}:${String(m.duration % 60).padStart(2, '0')}` : 'Voice Note'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Style */}
                  {m.type === 'file' && (
                    <a 
                      href={m.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all border ${isMe ? 'bg-black/10 border-black/10 hover:bg-black/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg">
                        <FileText size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className={`font-bold text-xs truncate ${isMe ? 'text-black' : 'text-white'}`}>{m.fileName || 'Document'}</p>
                        <p className={`text-[10px] opacity-60 ${isMe ? 'text-black' : 'text-white'}`}>View/Download</p>
                      </div>
                      <Download size={14} className="opacity-40" />
                    </a>
                  )}

                  <div className={`text-[9px] mt-1.5 flex items-center gap-1 font-bold ${isMe ? 'text-black/60 justify-end' : 'text-white/50'}`}>
                    {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    
                    {isMe && (
                      <div className="flex items-center ml-0.5">
                        {m.status === 'sent' && <Check size={12} className="text-black/50" />}
                        {m.status === 'delivered' && <CheckCheck size={12} className="text-black/50" />}
                        {m.status === 'seen' && <CheckCheck size={12} className="text-blue-700" />}
                        {!m.status && <Check size={12} className="text-black/50" />}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input area */}
      <div className="p-4 bg-[#0B0B0B] border-t border-white/5 shrink-0 pb-safe relative">
        {/* Hidden File Inputs */}
        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageSend(e.target.files?.[0])} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSend(e.target.files?.[0])} />

        {/* Attachment Menu */}
        <AnimatePresence>
          {showAttachMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 mb-4 bg-[#1A1A1A] rounded-2xl shadow-2xl border border-white/10 p-2 flex gap-4 z-50"
            >
              <button 
                onClick={() => imageInputRef.current.click()}
                className="flex flex-col items-center gap-1 p-3 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                  <ImageIcon size={22} />
                </div>
                <span className="text-[10px] font-bold text-white/60">Gallery</span>
              </button>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex flex-col items-center gap-1 p-3 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <FileText size={22} />
                </div>
                <span className="text-[10px] font-bold text-white/60">Document</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendText} className="flex gap-3 items-center">
          {isRecording ? (
            <div className="flex-1 bg-white/5 rounded-full flex items-center px-4 py-2 gap-3 border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-white flex-1">
                Recording... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
              </span>
              <button type="button" onClick={cancelRecording} className="p-2 text-white/40 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
              <button type="button" onClick={stopRecording} className="w-10 h-10 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-lg">
                <Square size={16} fill="black" />
              </button>
            </div>
          ) : (
            <>
              <button 
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${showAttachMenu ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-white/60 bg-white/5 hover:bg-white/10'}`}
              >
                <Paperclip size={20} />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D4AF37]/50 transition-all"
                />
              </div>

              {msg.trim() || isUploading ? (
                <motion.button 
                  type="submit"
                  whileTap={{ scale: 0.9 }}
                  disabled={isUploading}
                  className="w-11 h-11 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 disabled:opacity-40 transition-opacity"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </motion.button>
              ) : (
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={startRecording}
                  className="w-11 h-11 rounded-xl bg-white/5 text-[#D4AF37] flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
                >
                  <Mic size={20} />
                </motion.button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
