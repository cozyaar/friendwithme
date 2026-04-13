'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin, Star, ShieldCheck, ChevronLeft, Heart,
  MessageCircle, Music, Coffee, Sparkles, Shield, Users, Loader2,
  CheckCheck
} from 'lucide-react';
import { 
  collection, query, where, getDocs, addDoc, serverTimestamp,
  doc, setDoc, getDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

// In real app: fetch by ID. For now, mock data keyed by id.
const PROFILES = {
  '1': {
    name: 'Isabella', age: 24, city: 'Chennai, TN', rating: 4.9, reviews: 87,
    verified: true, online: true, match: 96, tag: 'Adventure Soul',
    img: '/images/isabella_1.png',
    photos: ['/images/isabella_1.png', '/images/isabella_2.png'],
    bio: 'Lover of sunsets, street food and spontaneous adventures. Always up for a chai and a good conversation ☕',
    interests: ['Travel 🌍', 'Photography 📷', 'Coffee ☕', 'Music 🎵', 'Hiking 🥾', 'Food 🍜'],
    vibes: ['Chill 😌', 'Adventurous 🏕️', 'Creative 🎨'],
    lifestyle: [
      { icon: Music, label: 'Music', value: 'Indie & Lo-fi' },
      { icon: Coffee, label: 'Drinks', value: 'Coffee person' },
      { icon: Heart, label: 'Looking for', value: 'Genuine connection' },
      { icon: Sparkles, label: 'Personality', value: 'INFJ · Introvert' },
    ],
    prompts: [
      { q: "My morning routine is...", a: "Chai, 10 mins of silence, then chaos. Always worth it." },
      { q: "You'll find me on weekends...", a: "At a local café reading or walking along the beach." },
    ],
  },
};

const FALLBACK = {
  name: 'Priya', age: 24, city: 'Mumbai', rating: 4.8, reviews: 54,
  verified: true, online: false, match: 91, tag: 'Creative Soul',
  img: '/images/companion_1.png',
  photos: ['/images/companion_1.png', '/images/companion_2.png'],
  bio: 'Art enthusiast and coffee lover. Your perfect plus-one for gallery openings or quiet city walks.',
  interests: ['Art 🎨', 'Coffee ☕', 'Photography 📸', 'Jazz 🎷'],
  vibes: ['Calm 🌿', 'Thoughtful 💭', 'Artistic 🎨'],
  lifestyle: [
    { icon: Music, label: 'Music', value: 'Jazz & Classical' },
    { icon: Coffee, label: 'Drinks', value: 'Tea person' },
    { icon: Heart, label: 'Looking for', value: 'Meaningful connection' },
    { icon: Sparkles, label: 'Personality', value: 'INFP · Introvert' },
  ],
  prompts: [
    { q: "I'm known for...", a: "Always finding the most aesthetic cafes in the city." },
  ],
};

export default function ProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const person = PROFILES[id] || FALLBACK;
  const [loading, setLoading] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null);

  const handleLike = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) { router.push('/login'); return; }

    try {
      // 1. Save like
      const likeId = `${currentUser.uid}_${id}`;
      const likeRef = doc(db, "likes", likeId);
      const likeSnap = await getDoc(likeRef);
      
      if (!likeSnap.exists()) {
        await setDoc(likeRef, {
          fromUserId: currentUser.uid,
          toUserId: id,
          createdAt: serverTimestamp()
        });
      }

      // 2. Check match
      const mutualLikeId = `${id}_${currentUser.uid}`;
      const mutualSnap = await getDoc(doc(db, "likes", mutualLikeId));

      if (mutualSnap.exists()) {
        const chatId = [currentUser.uid, id].sort().join("_");
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            participants: [currentUser.uid, id],
            lastMessage: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        setMatchInfo({ name: person.name, img: person.img, chatId });
        setShowMatch(true);
      } else {
        alert("Liked! If they like you back, it's a match! ✨");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartChat = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // 1. Check if chat already exists
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      let existingChatId = null;
      querySnapshot.forEach((chatDoc) => {
        const data = chatDoc.data();
        if (data.participants?.includes(id)) {
          existingChatId = chatDoc.id;
        }
      });

      if (existingChatId) {
        router.push(`/messages/${existingChatId}`);
      } else {
        // 2. Create new chat doc
        const newChatRef = await addDoc(collection(db, "chats"), {
          participants: [currentUser.uid, id],
          lastMessage: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        router.push(`/messages/${newChatRef.id}`);
      }
    } catch (err) {
      console.error("Error initiating chat:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky back button */}
      <div className="fixed top-0 left-0 right-0 z-40 pt-20 px-4 pointer-events-none">
        <button
          onClick={() => router.back()}
          className="pointer-events-auto inline-flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 rounded-full px-4 py-2.5 text-sm font-bold text-brand-dark hover:bg-white transition-colors"
        >
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto pb-24 pt-16">

        {/* Hero photo */}
        <div className="relative">
          <Image unoptimized width={100} height={100} 
            src={person.img} alt={person.name}
            className="w-full h-80 object-cover object-top"
           />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Overlay info */}
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-extrabold text-white">{person.name}, {person.age}</h1>
                  {person.verified && <Shield size={20} className="text-blue-400" />}
                </div>
                <div className="flex items-center gap-3 text-white/80 text-sm mt-1">
                  <span className="flex items-center gap-1"><MapPin size={13} />{person.city}</span>
                  {person.online
                    ? <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />Online</span>
                    : null}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                  ⚡ {person.match}% Match
                </span>
                <span className="flex items-center gap-1 text-white text-xs font-semibold">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" /> {person.rating} ({person.reviews})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Photos strip */}
        {person.photos.length > 1 && (
          <div className="flex gap-2 px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {person.photos.map((p, i) => (
              <Image unoptimized width={100} height={100}  key={i} src={p} alt=""
                className="h-20 w-20 object-cover rounded-2xl shrink-0 border border-gray-100 shadow-sm"  />
            ))}
          </div>
        )}

        <div className="px-4 py-5 space-y-5">

          {/* Verified + tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <ShieldCheck size={13} /> Identity Verified
            </span>
            <span className="text-xs font-bold text-brand-purple bg-purple-50 border border-brand-purple/20 px-3 py-1.5 rounded-full">
              {person.tag}
            </span>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-brand-dark text-sm leading-relaxed">{person.bio}</p>
          </div>

          {/* Prompts */}
          {person.prompts?.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-2">{p.q}</p>
              <p className="text-brand-dark font-semibold text-sm leading-relaxed">"{p.a}"</p>
            </div>
          ))}

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
                <div key={label} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
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
        </div>

        {/* Sticky bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-4 flex gap-3">
          <button
            onClick={handleStartChat}
            disabled={loading}
            className="flex-1 py-3.5 bg-brand-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><MessageCircle size={17} /> Send Message</>
            )}
          </button>
          <button 
            onClick={handleLike}
            className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center text-brand-gray hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <Heart size={18} />
          </button>
        </div>

      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && matchInfo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="relative mb-12">
              <div className="absolute inset-0 bg-brand-gradient blur-3xl opacity-30 animate-pulse" />
              <div className="flex -space-x-6 relative">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  <Image unoptimized width={120} height={120} src={getAuth().currentUser?.photoURL || "/images/companion_1.png"} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  <Image unoptimized width={120} height={120} src={matchInfo.img} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
            </motion.div>
            <h2 className="text-4xl font-black text-white mb-4">It's a Match!</h2>
            <p className="text-brand-gray mb-10">You and {matchInfo.name} are connected.</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button onClick={() => router.push(`/messages/${matchInfo.chatId}`)} className="py-4 bg-brand-gradient text-black font-bold rounded-2xl shadow-xl">Send Message</button>
              <button onClick={() => setShowMatch(false)} className="py-4 bg-white/10 text-white font-bold rounded-2xl">Keep Browsing</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
