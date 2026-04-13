'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, ChevronLeft, X, CheckCheck, MapPin, 
  Shield, Loader2 
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, getDoc 
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
  const bottomRef = useRef(null);

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

  // 4. Send Message Logic
  const send = async (e) => {
    e?.preventDefault();
    if (!msg.trim() || !currentUser || !chatId) return;

    const text = msg.trim();
    setMsg(''); // Clear input immediately

    try {
      // Add to messages subcollection
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text,
        senderId: currentUser.uid,
        createdAt: serverTimestamp()
      });

      // Update parent chat doc
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
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
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isMe 
                    ? 'bg-brand-dark text-white rounded-tr-none' 
                    : 'bg-white text-brand-dark border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{m.text}</p>
                  <div className={`text-[9px] mt-1 flex items-center gap-1 ${isMe ? 'text-white/60 justify-end' : 'text-brand-gray'}`}>
                    {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    {isMe && <CheckCheck size={12} />}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe">
        <form onSubmit={send} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Write a message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-5 py-3 text-sm text-brand-dark outline-none focus:border-brand-purple transition-all"
          />
          <motion.button 
            type="submit"
            whileTap={{ scale: 0.9 }}
            disabled={!msg.trim()}
            className="w-12 h-12 rounded-full bg-brand-dark text-white flex items-center justify-center shadow-lg disabled:opacity-40 transition-opacity"
          >
            <Send size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
