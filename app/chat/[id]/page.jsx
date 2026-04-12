'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, X, CheckCheck, MapPin, Heart, Music, Coffee, Star, Shield, Sparkles } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

// People data will be fetched from API by chat ID in real implementation
// Empty stub shown while loading
const DEFAULT_PERSON = {
  name: '', img: null, online: false, age: null, city: '',
  bio: '', interests: [], vibes: [], lifestyle: [], photos: [],
};

// ── Full-screen photo viewer (WhatsApp style) ──
function PhotoViewer({ src, name, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center gap-3 px-4 py-4 shrink-0" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <X size={18} />
        </button>
        <div>
          <p className="text-white font-bold text-sm">{name}</p>
          <p className="text-white/60 text-xs">Profile photo</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6" onClick={onClose}>
        <motion.img
          src={src} alt={name}
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="max-w-sm w-full rounded-3xl object-cover shadow-2xl"
          onClick={e => e.stopPropagation()}
        />
      </div>
    </motion.div>
  );
}

// ── Profile Drawer (slides up from bottom like a sheet) ──
function ProfileDrawer({ person, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex flex-col justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="w-full bg-white rounded-t-[2rem] overflow-y-auto"
        style={{ maxHeight: '90dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sheet header: grab handle + close button */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 rounded-t-[2rem]">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
          <div /> {/* spacer */}
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-brand-gray hover:bg-gray-200 transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Cover photo + info */}
        <div className="relative h-56">
          <img src={person.img} alt={person.name}
            className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white">{person.name}, {person.age}</h2>
              {person.verified && <Shield size={18} className="text-blue-400 shrink-0" />}
            </div>
            <div className="flex items-center gap-3 text-white/80 text-sm mt-1">
              <span className="flex items-center gap-1"><MapPin size={13} /> {person.city}</span>
              {person.online && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Bio */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-brand-dark text-sm leading-relaxed">{person.bio}</p>
          </div>

          {/* Interests */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {person.interests.map(i => (
                <span key={i} className="bg-brand-dark text-white text-xs font-bold px-3 py-1.5 rounded-full">{i}</span>
              ))}
            </div>
          </div>

          {/* Vibes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Vibes</h4>
            <div className="flex flex-wrap gap-2">
              {person.vibes.map(v => (
                <span key={v} className="bg-purple-50 text-brand-purple border border-brand-purple/20 text-xs font-bold px-3 py-1.5 rounded-full">{v}</span>
              ))}
            </div>
          </div>

          {/* Lifestyle grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Lifestyle</h4>
            <div className="grid grid-cols-2 gap-3">
              {person.lifestyle.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
                    <Icon size={16} className="text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-[11px] text-brand-gray font-medium">{label}</p>
                    <p className="text-xs font-bold text-brand-dark">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          {person.photos.length > 1 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Photos</h4>
              <div className="grid grid-cols-3 gap-2">
                {person.photos.map((p, i) => (
                  <img key={i} src={p} alt=""
                    className="w-full h-24 object-cover rounded-2xl border border-gray-100" />
                ))}
              </div>
            </div>
          )}
          <div className="h-6" />
        </div>
      </motion.div>
    </motion.div>
  );
}


// ── Main Chat Page ──
export default function ChatPage() {
  const router = useRouter();
  const { id: chatId } = useParams();
  const person = DEFAULT_PERSON;

  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]); // Empty — will load from API
  const [showPhoto, setShowPhoto] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e?.preventDefault();
    if (!msg.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), text: msg.trim(), isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }]);
    setMsg('');
  };

  return (
    <>
      <AnimatePresence>
        {showPhoto && <PhotoViewer src={person.img} name={person.name} onClose={() => setShowPhoto(false)} />}
      </AnimatePresence>

      <div className="h-dvh bg-gray-50 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col px-0 md:px-6 md:py-4 overflow-hidden pt-16 md:pt-20">
          <div className="flex-1 flex flex-col bg-white md:rounded-3xl md:border md:border-gray-100 md:shadow-sm overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white shrink-0">
              {/* Back */}
              <button onClick={() => router.push('/bookings?tab=messages')}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-brand-dark hover:bg-gray-200 transition-colors shrink-0">
                <ChevronLeft size={20} />
              </button>

              {/* Avatar → open photo viewer */}
              <button onClick={() => setShowPhoto(true)} className="relative shrink-0">
                <img src={person.img} alt={person.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm hover:opacity-90 transition-opacity" />
                {person.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Name → navigate to full profile page */}
              <button onClick={() => router.push(`/profile/${chatId}`)} className="flex-1 min-w-0 text-left hover:opacity-75 transition-opacity">
                <h3 className="font-bold text-brand-dark text-base leading-tight truncate">{person.name}</h3>
                <p className="text-xs text-brand-gray flex items-center gap-1 mt-0.5">
                  {person.online
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> Online</>
                    : 'Offline'}
                </p>
              </button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-gray-50">
              {messages.map((m, i) => (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {!m.isMe && (
                    <button onClick={() => setShowPhoto(true)} className="shrink-0 mb-1">
                      <img src={person.img} className="w-7 h-7 rounded-full object-cover opacity-80 hover:opacity-100" alt="" />
                    </button>
                  )}
                  <div className={`max-w-[72%] flex flex-col gap-1 ${m.isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.isMe
                        ? 'bg-brand-dark text-white rounded-br-sm'
                        : 'bg-white text-brand-dark border border-gray-100 shadow-sm rounded-bl-sm'
                    }`}>
                      {m.text}
                    </div>
                    <div className={`flex items-center gap-1 px-1 ${m.isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-brand-gray">{m.time}</span>
                      {m.isMe && <CheckCheck size={12} className={m.read ? 'text-blue-500' : 'text-gray-300'} />}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={send} className="flex gap-2 items-center">
                <input
                  type="text" placeholder="Type a message…" value={msg}
                  onChange={e => setMsg(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm text-brand-dark outline-none focus:border-brand-purple transition-colors"
                />
                <motion.button type="submit" whileTap={{ scale: 0.9 }} disabled={!msg.trim()}
                  className="w-11 h-11 rounded-full bg-brand-dark text-white flex items-center justify-center shadow-md hover:opacity-90 disabled:opacity-40 shrink-0">
                  <Send size={17} />
                </motion.button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
