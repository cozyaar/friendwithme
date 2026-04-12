'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin, CalendarDays, Users, ChevronLeft, Send,
  MessageCircle, CheckCircle2, Shield, UserCheck, X, Lock
} from 'lucide-react';

// Mock: who is the currently logged-in user
// 'Aarushi' = creator  |  'Rohan' = already joined  |  'Karan' = not joined yet
const CURRENT_USER = 'Karan';

const EVENTS_DATA = {
  e1: {
    id: 'e1', title: 'Marina Beach Evening Chill', location: 'Marina Beach, Chennai',
    date: '2026-05-10', time: '5:00 PM', slots: 5, joined: 3, interested: 14,
    activities: ['Hangout 😌', 'Walk 🚶'],
    description: "A relaxed evening on Marina beach — good vibes, local food, and a beautiful sunset walk along the shore. We'll grab some snacks from the beach stalls, find a good spot, and just vibe as the sun sets.",
    requirements: 'Prefer non-smokers. Good energy and chill attitude required!',
    creator: { name: 'Aarushi', img: '/images/companion_1.png', verified: true, age: 24 },
    participants: [
      { name: 'Rohan', img: '/images/companion_2.png' },
      { name: 'Priya', img: '/images/companion_1.png' },
    ],
    pendingRequests: [
      { name: 'Anjali', img: '/images/companion_1.png', message: 'Hey! I love beaches, would love to join!' },
    ],
    imgs: ['/images/companion_1.png', '/images/companion_2.png'],
    genderPref: 'Anyone',
  },
};

// Small 1-on-1 DM chat with event creator (before joining)
function PrivateChatModal({ event, currentUser, onClose }) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: event.creator.name, text: 'Hey! Feel free to ask me anything about the event 😊', time: '10:00 AM', mine: false },
  ]);
  const sendMsg = () => {
    if (!msg.trim()) return;
    setMessages(p => [...p, { id: Date.now(), sender: currentUser, text: msg, time: 'Now', mine: true }]);
    setMsg('');
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full md:max-w-md bg-white rounded-t-[2rem] md:rounded-[2rem] h-[75vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={15} /></button>
          <img src={event.creator.img} className="w-10 h-10 rounded-full object-cover" alt="" />
          <div>
            <p className="font-bold text-brand-dark text-sm">{event.creator.name}</p>
            <p className="text-xs text-brand-gray">Event organiser · Private chat</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-2 ${m.mine ? 'flex-row-reverse' : ''}`}>
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm ${m.mine ? 'bg-brand-dark text-white rounded-tr-sm' : 'bg-gray-100 text-brand-dark rounded-tl-sm'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2 shrink-0">
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder={`Message ${event.creator.name}…`}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand-purple"
          />
          <motion.button whileTap={{ scale: 0.9 }} onClick={sendMsg}
            className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white shrink-0">
            <Send size={15} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Group chat — only after joining
function GroupChatModal({ event, onClose }) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'Aarushi', img: '/images/companion_1.png', text: 'Hey everyone! So excited for the beach chill 🌊', time: '4:00 PM', mine: false },
    { id: 2, user: 'Priya', img: '/images/companion_1.png', text: 'Cannot wait! 🏖️', time: '4:02 PM', mine: false },
    { id: 3, user: 'You', img: '/images/companion_2.png', text: "I'll bring some snacks 🍿", time: '4:05 PM', mine: true },
  ]);
  const sendMsg = () => {
    if (!msg.trim()) return;
    setMessages(p => [...p, { id: Date.now(), user: 'You', img: '/images/companion_2.png', text: msg, time: 'Now', mine: true }]);
    setMsg('');
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full md:max-w-md bg-white rounded-t-[2rem] md:rounded-[2rem] h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={15} /></button>
          <div>
            <p className="font-bold text-brand-dark">{event.title}</p>
            <p className="text-xs text-brand-gray">{event.participants.length + 1} participants · Group Chat</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.mine ? 'flex-row-reverse' : ''}`}>
              {!m.mine && <img src={m.img} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />}
              <div className={`max-w-[75%] flex flex-col gap-0.5 ${m.mine ? 'items-end' : 'items-start'}`}>
                {!m.mine && <span className="text-[11px] text-brand-gray font-semibold px-1">{m.user}</span>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium ${m.mine ? 'bg-brand-dark text-white rounded-tr-sm' : 'bg-gray-100 text-brand-dark rounded-tl-sm'}`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-brand-gray px-1">{m.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2 shrink-0">
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder="Message the group…"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand-purple"
          />
          <motion.button whileTap={{ scale: 0.9 }} onClick={sendMsg}
            className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white shrink-0">
            <Send size={15} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EventDetail({ params }) {
  const event = EVENTS_DATA[params?.id] || EVENTS_DATA['e1'];

  const isCreator = CURRENT_USER === event.creator.name;
  // Check if current user is in participants list
  const hasJoined = event.participants.some(p => p.name === CURRENT_USER);

  const [imgIndex, setImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [pendingRequests, setPendingRequests] = useState(event.pendingRequests || []);
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [joined, setJoined] = useState(hasJoined);
  const [requestSent, setRequestSent] = useState(false);
  const isFull = event.joined >= event.slots;

  // Only creator sees: Requests tab
  const tabs = ['details', 'participants', ...(isCreator ? ['requests'] : [])];

  const handleRequest = (name) => {
    setPendingRequests(prev => prev.filter(r => r.name !== name));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-28 md:pb-10">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <Link href="/events/explore" className="inline-flex items-center gap-2 text-brand-gray font-medium hover:text-brand-dark transition-colors mb-6 mt-4">
          <ChevronLeft size={20} /> Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Image + main info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image */}
            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden bg-gray-200">
              <AnimatePresence mode="wait">
                <motion.img key={imgIndex} src={event.imgs[imgIndex]}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full h-full object-cover" alt={event.title}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
              {event.imgs.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
                  {event.imgs.map((_, i) => (
                    <button key={i} onClick={() => setImgIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-extrabold text-white drop-shadow-md">{event.title}</h1>
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                    <MapPin size={13} /> {event.location}
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${isFull ? 'bg-gray-700/80 text-white' : 'bg-green-500/90 text-white'}`}>
                  {isFull ? 'Full' : 'Open'}
                </span>
              </div>
            </div>

            {/* Tabs — Requests only visible to creator */}
            <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white shadow-sm text-brand-dark' : 'text-brand-gray hover:text-brand-dark'}`}
                >
                  {tab}
                  {tab === 'requests' && pendingRequests.length > 0 && (
                    <span className="ml-1.5 bg-brand-dark text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-brand-dark mb-3">About This Event</h3>
                    <p className="text-brand-gray leading-relaxed text-sm">{event.description}</p>
                  </div>
                  {event.requirements && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
                      <Shield size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-800 text-sm mb-1">Requirements</p>
                        <p className="text-amber-700 text-sm">{event.requirements}</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-brand-dark mb-3">Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.activities.map(a => (
                        <span key={a} className="bg-brand-dark text-white px-4 py-2 rounded-full text-sm font-bold">{a}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'participants' && (
                <motion.div key="participants" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-brand-dark">Participants ({event.joined}/{event.slots})</h3>
                    <span className="text-xs text-brand-gray">{event.slots - event.joined} slots open</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {[event.creator, ...event.participants].map((p, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="relative">
                          <img src={p.img} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" alt="" />
                          {i === 0 && <div className="absolute -bottom-1 -right-1 bg-brand-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Host</div>}
                        </div>
                        <span className="text-xs text-brand-gray font-medium">{p.name}</span>
                      </div>
                    ))}
                    {Array.from({ length: event.slots - event.joined - 1 }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5">
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-2xl">+</div>
                        <span className="text-xs text-gray-300">Open</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Requests tab — creator only */}
              {activeTab === 'requests' && isCreator && (
                <motion.div key="requests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4"
                >
                  <h3 className="font-bold text-brand-dark">Pending Requests</h3>
                  {pendingRequests.length === 0 ? (
                    <p className="text-brand-gray text-sm text-center py-6">No pending requests right now</p>
                  ) : (
                    pendingRequests.map(r => (
                      <div key={r.name} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                        <img src={r.img} className="w-12 h-12 rounded-full object-cover shrink-0" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-brand-dark text-sm">{r.name}</p>
                          {r.message && <p className="text-brand-gray text-sm mt-0.5 line-clamp-2">"{r.message}"</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleRequest(r.name)}
                            className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors">
                            <X size={16} />
                          </button>
                          <button onClick={() => handleRequest(r.name)}
                            className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors">
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-4">
            {/* Event meta */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-brand-purple shrink-0" />
                <span className="font-semibold text-sm text-brand-dark">{event.date} at {event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-brand-purple shrink-0" />
                <span className="font-semibold text-sm text-brand-dark">{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={15} className="text-brand-purple shrink-0" />
                <span className="font-semibold text-sm text-brand-dark">{event.joined}/{event.slots} joined · {event.genderPref}</span>
              </div>
            </div>

            {/* Creator card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs uppercase tracking-widest font-bold text-brand-gray mb-3">Organised by</p>
              <div className="flex items-center gap-3">
                <img src={event.creator.img} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark">{event.creator.name}</span>
                    {event.creator.verified && <CheckCircle2 size={14} className="text-green-500" />}
                  </div>
                  <span className="text-xs text-brand-gray">Age {event.creator.age}</span>
                </div>
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="space-y-2.5">

              {isCreator ? (
                // ① Creator — always has Group Chat
                <button onClick={() => setShowGroupChat(true)}
                  className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 text-sm">
                  <MessageCircle size={18} /> Group Chat
                </button>

              ) : joined ? (
                // ② Approved participant — Group Chat unlocked
                <>
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-green-700 font-bold text-sm">You're in this event!</span>
                  </div>
                  <button onClick={() => setShowGroupChat(true)}
                    className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 text-sm">
                    <MessageCircle size={18} /> Group Chat
                  </button>
                </>

              ) : requestSent ? (
                // ③ Request sent — waiting for creator approval
                <>
                  <div className="w-full py-3.5 bg-green-50 border border-green-200 text-green-700 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm">
                    <CheckCircle2 size={16} /> Request Sent — Awaiting approval
                  </div>
                  <button onClick={() => setShowPrivateChat(true)}
                    className="w-full py-3 border border-gray-200 text-brand-dark font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition-colors">
                    <MessageCircle size={16} /> Message {event.creator.name}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-brand-gray py-1">
                    <Lock size={12} /> Group chat available after your request is approved
                  </div>
                </>

              ) : (
                // ④ Not joined yet — show Join + Message Manager
                <>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => { if (!isFull) setRequestSent(true); }}
                    disabled={isFull}
                    className={`w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg ${
                      isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-dark text-white hover:opacity-90'
                    }`}
                  >
                    <UserCheck size={18} /> {isFull ? 'Event is Full' : 'Send Join Request'}
                  </motion.button>

                  <button onClick={() => setShowPrivateChat(true)}
                    className="w-full py-3 border border-gray-200 text-brand-dark font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition-colors">
                    <MessageCircle size={16} /> Message {event.creator.name}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPrivateChat && <PrivateChatModal event={event} currentUser={CURRENT_USER} onClose={() => setShowPrivateChat(false)} />}
        {showGroupChat && <GroupChatModal event={event} onClose={() => setShowGroupChat(false)} />}
      </AnimatePresence>
    </div>
  );
}
