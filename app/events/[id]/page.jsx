'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin, CalendarDays, Users, ChevronLeft, Send,
  MessageCircle, CheckCircle2, Shield, UserCheck, X, Lock, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Small 1-on-1 DM chat with event creator (before joining)
function PrivateChatModal({ event, currentUser, onClose }) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: event.creator.name, text: 'Hey! Feel free to ask me anything about the event 😊', time: '10:00 AM', mine: false },
  ]);
  const sendMsg = () => {
    if (!msg.trim()) return;
    setMessages(p => [...p, { id: Date.now(), sender: currentUser?.displayName || 'Me', text: msg, time: 'Now', mine: true }]);
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
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand-purple text-brand-dark"
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
    { id: 1, user: event.creator.name, img: event.creator.img, text: 'Hey everyone! So excited for this event 🌊', time: '4:00 PM', mine: false },
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
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand-purple text-brand-dark"
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
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const fetchEventDetails = async () => {
    if (!params?.id) return;
    try {
      const docRef = doc(db, 'events', params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Fetch creator info
        let creatorInfo = { name: 'Host', img: '/images/companion_1.png', age: 24, verified: false };
        if (data.createdBy) {
          const userSnap = await getDoc(doc(db, 'users', data.createdBy));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            creatorInfo = {
              name: userData.name || 'Unknown',
              img: userData.profilePic || (userData.photos && userData.photos[0]) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'H'),
              age: userData.age || 24,
              verified: userData.verified || false
            };
          }
        }

        // Fetch participants info
        const participantsData = [];
        if (data.participants && Array.isArray(data.participants)) {
          for (const uid of data.participants) {
            if (uid === data.createdBy) continue; // Organiser has Host tag, not listed as basic participant
            const uSnap = await getDoc(doc(db, 'users', uid));
            if (uSnap.exists()) {
              const u = uSnap.data();
              participantsData.push({
                name: u.name || 'User',
                img: u.profilePic || (u.photos && u.photos[0]) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name || 'U'),
                uid: uid
              });
            } else {
              participantsData.push({ name: 'User', img: '/images/companion_2.png', uid });
            }
          }
        }

        setEvent({
          id: docSnap.id,
          title: data.title || 'Untitled Event',
          location: data.location || 'Global',
          date: data.startDate || 'Soon',
          time: data.time || 'TBD',
          slots: data.maxParticipants || 10,
          joined: data.participants?.length || 1,
          activities: data.activities || [],
          description: data.description || 'No description provided.',
          requirements: data.requirements || '',
          creator: creatorInfo,
          createdBy: data.createdBy,
          participants: participantsData,
          rawParticipants: data.participants || [],
          imgs: data.images?.length ? data.images : ['https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800']
        });
      } else {
        console.error('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      fetchEventDetails();
    });
    return () => unsub();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-purple" size={48} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-brand-dark mb-2">Event Not Found</h1>
        <p className="text-brand-gray mb-6">The event you are looking for does not exist or has been deleted.</p>
        <Link href="/events/explore" className="px-6 py-3 bg-brand-dark text-white rounded-2xl font-bold">Back to Explore</Link>
      </div>
    );
  }

  const isCreator = currentUser && currentUser.uid === event.createdBy;
  const hasJoined = currentUser && event.rawParticipants.includes(currentUser.uid);
  const isFull = event.joined >= event.slots;
  const tabs = ['details', 'participants'];

  const handleJoinEvent = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsJoining(true);
    try {
      const docRef = doc(db, 'events', event.id);
      await updateDoc(docRef, {
        participants: arrayUnion(currentUser.uid)
      });
      await fetchEventDetails();
    } catch (e) {
      console.error('Error joining event:', e);
      alert('Failed to join event: ' + e.message);
    } finally {
      setIsJoining(false);
    }
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

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white shadow-sm text-brand-dark' : 'text-brand-gray hover:text-brand-dark'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-brand-dark mb-3">About This Event</h3>
                    <p className="text-brand-gray leading-relaxed text-sm whitespace-pre-wrap">{event.description}</p>
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
                  {event.activities && event.activities.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-brand-dark mb-3">Activities</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.activities.map(a => (
                          <span key={a} className="bg-brand-dark text-white px-4 py-2 rounded-full text-sm font-bold">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'participants' && (
                <motion.div key="participants" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-brand-dark">Participants ({event.joined}/{event.slots})</h3>
                    <span className="text-xs text-brand-gray">{Math.max(0, event.slots - event.joined)} slots open</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {[event.creator, ...event.participants].map((p, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 w-16">
                        <div className="relative">
                          <img src={p.img} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" alt="" />
                          {i === 0 && <div className="absolute -bottom-1 -right-1 bg-brand-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Host</div>}
                        </div>
                        <span className="text-xs text-brand-gray font-medium truncate w-full text-center">{p.name}</span>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, event.slots - event.joined) }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5 w-16">
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-2xl font-light cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => !hasJoined && !isFull && handleJoinEvent()}>+</div>
                        <span className="text-xs text-gray-300 text-center">Open</span>
                      </div>
                    ))}
                  </div>
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
                <span className="font-semibold text-sm text-brand-dark">{event.joined}/{event.slots} joined</span>
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
                  </div>
                  <span className="text-xs text-brand-gray">Age {event.creator.age}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {isCreator ? (
                <button onClick={() => setShowGroupChat(true)}
                  className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 text-sm">
                  <MessageCircle size={18} /> Group Chat
                </button>
              ) : hasJoined ? (
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
              ) : (
                <>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={handleJoinEvent}
                    disabled={isFull || isJoining}
                    className={`w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg ${
                      isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-dark text-white hover:opacity-90'
                    }`}
                  >
                    {isJoining ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <UserCheck size={18} />
                    )}
                    {isFull ? 'Event is Full' : 'Join Event'}
                  </motion.button>

                  <button onClick={() => setShowPrivateChat(true)}
                    className="w-full py-3 border border-gray-200 text-brand-dark font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition-colors">
                    <MessageCircle size={16} /> Message Host
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPrivateChat && <PrivateChatModal event={event} currentUser={currentUser} onClose={() => setShowPrivateChat(false)} />}
        {showGroupChat && <GroupChatModal event={event} onClose={() => setShowGroupChat(false)} />}
      </AnimatePresence>
    </div>
  );
}
