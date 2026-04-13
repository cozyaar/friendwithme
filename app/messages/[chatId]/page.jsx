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

  // 6. Media Handling Helpers
  const uploadChatFile = async (file, type) => {
    const ext = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const storageRef = ref(storage, `chatFiles/${type}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
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

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "voice_note.webm", { type: 'audio/webm' });
        
        setIsUploading(true);
        try {
          const url = await uploadChatFile(audioFile, 'audio');
          await sendMessage({ 
            type: 'audio', 
            fileUrl: url, 
            duration: recordingTime,
            text: '🎤 Voice Note' 
          });
        } catch (err) {
          console.error("Audio upload failed:", err);
        } finally {
          setIsUploading(false);
          setRecordingTime(0);
        }
        
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
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
      audioChunksRef.current = [];
    }
  };

  const handleMediaSelect = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowAttachMenu(false);
    try {
      const url = await uploadChatFile(file, type);
      await sendMessage({ 
        type, 
        fileUrl: url, 
        fileName: file.name,
        text: type === 'image' ? '📷 Photo' : `📄 ${file.name}`
      });
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // 7. Unified Send Message Logic
  const sendMessage = async ({ text = '', type = 'text', fileUrl = '', fileName = '', duration = 0 }) => {
    if (!currentUser || !chatId) return;

    try {
      // Add to messages subcollection
      const msgData = {
        text,
        type,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        status: "sent",
        fileUrl,
        fileName,
        duration
      };

      await addDoc(collection(db, "chats", chatId, "messages"), msgData);

      // Update parent chat doc
      const receiverId = otherUser?.id;
      const updateData = {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      };
      
      if (receiverId) {
        updateData[`unreadCount.${receiverId}`] = increment(1);
      }

      await updateDoc(doc(db, "chats", chatId), updateData);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send. Please try again.");
    }
  };

  const handleSendText = (e) => {
    e?.preventDefault();
    if (!msg.trim()) return;
    const currentText = msg.trim();
    setMsg('');
    sendMessage({ text: currentText, type: 'text' });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0 pt-safe mt-16 md:mt-20">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-brand-dark">
          <ChevronLeft size={20} />
        </button>
        
        <div className="relative shrink-0">
          <Image unoptimized width={100} height={100} 
            src={otherUser?.profilePic || otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name || 'U'}`} 
            alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
          />
          {otherUser?.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-brand-dark text-sm truncate">{otherUser?.name || 'Chat'}</h3>
          <p className="text-[10px] text-brand-gray font-medium uppercase tracking-wider">
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
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group ${
                  isMe 
                    ? 'bg-brand-dark text-white rounded-tr-none' 
                    : 'bg-white text-brand-dark border border-gray-100 rounded-tl-none'
                }`}>
                  
                  {/* Text Style */}
                  {m.type === 'text' && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}

                  {/* Image Style */}
                  {m.type === 'image' && (
                    <div className="space-y-2">
                       <Image 
                         unoptimized 
                         width={400} 
                         height={400} 
                         src={m.fileUrl} 
                         alt="Uploaded" 
                         className="rounded-lg object-cover max-h-64 md:max-h-96 w-full cursor-zoom-in" 
                       />
                       {m.text && m.text !== '📷 Photo' && <p className="leading-relaxed">{m.text}</p>}
                    </div>
                  )}

                  {/* Audio Style */}
                  {m.type === 'audio' && (
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-white/10' : 'bg-brand-purple/10'}`}>
                        <Mic size={18} className={isMe ? 'text-white' : 'text-brand-purple'} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <audio controls src={m.fileUrl} className="w-full h-8 opacity-80" />
                        <div className="flex justify-between text-[9px] px-1 opacity-60">
                          <span>Voice Note</span>
                          <span>{Math.floor(m.duration / 60)}:{String(m.duration % 60).padStart(2, '0')}</span>
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
                      className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className={`font-bold text-xs truncate ${isMe ? 'text-white' : 'text-brand-dark'}`}>{m.fileName || 'Document'}</p>
                        <p className={`text-[10px] opacity-60 ${isMe ? 'text-white' : 'text-brand-gray'}`}>View/Download</p>
                      </div>
                      <Download size={14} className="opacity-40" />
                    </a>
                  )}

                  <div className={`text-[9px] mt-1 flex items-center gap-1 ${isMe ? 'text-white/60 justify-end' : 'text-brand-gray'}`}>
                    {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    
                    {isMe && (
                      <div className="flex items-center">
                        {m.status === 'sent' && <Check size={12} className="text-white/70" />}
                        {m.status === 'delivered' && <CheckCheck size={12} className="text-white/70" />}
                        {m.status === 'seen' && <CheckCheck size={12} className="text-blue-300" />}
                        {!m.status && <Check size={12} className="text-white/70" />}
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
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe relative">
        {/* Hidden File Inputs */}
        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleMediaSelect(e, 'image')} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleMediaSelect(e, 'file')} />

        {/* Attachment Menu */}
        <AnimatePresence>
          {showAttachMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 flex gap-4 z-50"
            >
              <button 
                onClick={() => imageInputRef.current.click()}
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <ImageIcon size={22} />
                </div>
                <span className="text-[10px] font-bold text-brand-gray">Gallery</span>
              </button>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <FileText size={22} />
                </div>
                <span className="text-[10px] font-bold text-brand-gray">Document</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendText} className="flex gap-2 items-center">
          {isRecording ? (
            <div className="flex-1 bg-brand-pink/5 rounded-full flex items-center px-4 py-2 gap-3 border border-brand-pink/20">
              <div className="w-2 h-2 bg-brand-pink rounded-full animate-pulse" />
              <span className="text-sm font-bold text-brand-pink flex-1">
                Recording... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
              </span>
              <button type="button" onClick={cancelRecording} className="p-2 text-brand-gray hover:text-red-500">
                <Trash2 size={18} />
              </button>
              <button type="button" onClick={stopRecording} className="w-10 h-10 rounded-full bg-brand-pink text-white flex items-center justify-center shadow-md">
                <Square size={16} fill="white" />
              </button>
            </div>
          ) : (
            <>
              <button 
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showAttachMenu ? 'bg-brand-purple text-white' : 'text-brand-gray bg-gray-50'}`}
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                placeholder="Write a message..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-5 py-3 text-sm text-brand-dark outline-none focus:border-brand-purple transition-all"
              />

              {msg.trim() || isUploading ? (
                <motion.button 
                  type="submit"
                  whileTap={{ scale: 0.9 }}
                  disabled={isUploading}
                  className="w-12 h-12 rounded-full bg-brand-dark text-white flex items-center justify-center shadow-lg disabled:opacity-40 transition-opacity"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </motion.button>
              ) : (
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={startRecording}
                  className="w-12 h-12 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-lg"
                >
                  <Mic size={18} />
                </motion.button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
