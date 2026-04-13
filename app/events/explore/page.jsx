'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin, CalendarDays, Users, Search, X,
  Heart, MessageCircle, TrendingUp, Navigation, ChevronRight
} from 'lucide-react';

// Events are loaded dynamically from Firestore


const ACTIVITY_FILTERS = ['All', 'Hangout 😌', 'Food Outing 🍽️', 'Travel ✈️', 'Shopping 🛍️', 'Walk 🚶', 'Exploration 🗺️'];

function JoinModal({ event, onClose }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 text-center max-w-xs w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-extrabold text-brand-dark">Request Sent!</h3>
        <p className="text-brand-gray text-sm">Your request to join <strong>{event.title}</strong> has been sent to {event.creator.name}.</p>
        <button onClick={onClose} className="w-full py-3 bg-brand-dark text-white rounded-2xl font-bold mt-2">Done</button>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full md:max-w-md bg-white rounded-t-[2rem] md:rounded-[2rem] p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-extrabold text-brand-dark">Join Request</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-5">
          <img src={event.creator.img} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" alt="" />
          <div>
            <p className="font-bold text-brand-dark text-sm">{event.title}</p>
            <p className="text-brand-gray text-xs">{event.location} · {event.date}</p>
          </div>
        </div>
        <label className="block text-xs uppercase tracking-widest font-bold text-brand-gray mb-2">Message to {event.creator.name} (optional)</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          rows={3} placeholder="Introduce yourself or say why you'd like to join…"
          className="w-full border border-gray-200 rounded-2xl p-3 text-sm outline-none focus:border-brand-purple resize-none mb-5 text-brand-dark"
        />
        <div className="flex gap-3">
          <button onClick={() => setSent(true)} className="flex-1 py-3 bg-white border border-gray-200 text-brand-dark font-bold rounded-2xl hover:bg-gray-50 text-sm">
            Send Request
          </button>
          <button onClick={() => setSent(true)} className="flex-1 py-3 bg-brand-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg">
            <MessageCircle size={16} /> Request + Message
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EventCard({ event, onJoin, index }) {
  const isFull = event.joined >= event.slots;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm transition-all"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img src={event.imgs[0]} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {event.trending && (
            <span className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp size={11} /> Trending
            </span>
          )}
          {event.nearYou && (
            <span className="bg-white/90 backdrop-blur-md text-brand-purple px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Navigation size={11} /> Near You
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <img src={event.creator.img} className="w-7 h-7 rounded-full border-2 border-white object-cover" alt="" />
          <span className="text-white text-xs font-bold">{event.creator.name}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-brand-dark leading-tight">{event.title}</h3>
          <span className={`shrink-0 ml-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${isFull ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {isFull ? '✕ Full' : '● Open'}
          </span>
        </div>
        <p className="text-brand-gray text-sm mb-3 line-clamp-2">{event.description}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-gray mb-3">
          <span className="flex items-center gap-1"><MapPin size={11} /> {event.location}</span>
          <span className="flex items-center gap-1"><CalendarDays size={11} /> {event.date}</span>
          <span className="flex items-center gap-1"><Users size={11} /> {event.joined}/{event.slots} joined</span>
          <span className="flex items-center gap-1"><Heart size={11} /> {event.interested} interested</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {event.activities.map(a => (
            <span key={a} className="bg-gray-100 text-brand-dark px-2.5 py-1 rounded-full text-xs font-bold">{a}</span>
          ))}
        </div>
        {/* Slot progress */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-4">
          <div className="h-full bg-brand-dark rounded-full transition-all" style={{ width: `${(event.joined / event.slots) * 100}%` }} />
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}`}
            className="flex-1 py-2.5 border border-gray-200 text-brand-dark font-bold rounded-xl text-sm text-center hover:bg-gray-50 transition-colors">
            View Details
          </Link>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => !isFull && onJoin(event)}
            disabled={isFull}
            className={`flex-1 py-2.5 font-bold rounded-xl text-sm ${isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-dark text-white shadow-md hover:opacity-90'}`}
          >
            {isFull ? 'Full' : 'Join →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExploreEvents() {
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('All');
  const [joiningEvent, setJoiningEvent] = useState(null);

  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    import('firebase/firestore').then(({ collection, getDocs, doc, getDoc }) => {
      import('@/lib/firebase').then(async ({ db }) => {
        try {
          const snapshot = await getDocs(collection(db, 'events'));
          const eventsData = [];
          for (let document of snapshot.docs) {
             const data = document.data();
             const uid = data.createdBy;
             let creatorInfo = { name: "Unknown", img: "https://ui-avatars.com/api/?name=U" };
             if (uid) {
                const uSnap = await getDoc(doc(db, 'users', uid));
                if (uSnap.exists()) {
                   const uData = uSnap.data();
                   if (!uData.isRealUser) continue; 
                   creatorInfo.name = uData.name || "Unknown";
                   creatorInfo.img = uData.profilePic || (uData.photos && uData.photos[0]) || "https://ui-avatars.com/api/?name=" + encodeURIComponent(uData.name || "U");
                }
             }

             eventsData.push({
               id: document.id,
               title: data.title || 'Untitled',
               description: data.description || '',
               creator: creatorInfo,
               location: data.location || 'Global',
               date: data.date || (data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Soon'),
               slots: data.slots || 10,
               joined: data.participants?.length || 1,
               interested: Math.floor(Math.random() * 50) + 10,
               activities: data.activities || [],
               imgs: data.images?.length ? data.images : ["https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800"],
               trending: Math.random() > 0.7,
               nearYou: Math.random() > 0.5
             });
          }
          setAllEvents(eventsData);
        } catch (e) {
          console.error("Error fetching events:", e);
        }
      });
    });
  }, []);

  // 1. apply search + activity filters
  const filtered = allEvents.filter(ev => {
    const matchSearch = String(ev.title).toLowerCase().includes(search.toLowerCase()) ||
      String(ev.location).toLowerCase().includes(search.toLowerCase());
    const matchActivity = activityFilter === 'All' || ev.activities.includes(activityFilter);
    return matchSearch && matchActivity;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-28 md:pb-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-brand-dark mb-1">Join Events</h1>
          <p className="text-brand-gray font-medium">Discover hangouts, trips &amp; group experiences</p>
        </div>

        {/* Nav tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
          <Link href="/events/my-events" className="px-5 py-2 rounded-xl text-brand-gray font-bold text-sm hover:text-brand-dark transition-colors">My Events</Link>
          <Link href="/events/explore" className="px-5 py-2 rounded-xl bg-white shadow-sm text-brand-dark font-bold text-sm">Join Events</Link>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 gap-2 mb-4">
          <Search size={16} className="text-brand-gray" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events, locations…"
            className="flex-1 outline-none text-sm text-brand-dark bg-transparent" />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-gray-400" /></button>}
        </div>

        {/* Activity chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {ACTIVITY_FILTERS.map(f => (
            <motion.button whileTap={{ scale: 0.93 }} key={f}
              onClick={() => setActivityFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${activityFilter === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-gray-200 hover:border-brand-dark'}`}
            >
              {f}
            </motion.button>
          ))}
        </div>

        {/* Flat event grid — NO duplicate sections */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ev, i) => (
              <EventCard key={ev.id} event={ev} onJoin={setJoiningEvent} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">No events found</h3>
            <p className="text-brand-gray text-sm">Try different filters or check back later!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {joiningEvent && <JoinModal event={joiningEvent} onClose={() => setJoiningEvent(null)} />}
      </AnimatePresence>
    </div>
  );
}
