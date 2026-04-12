'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  {
    title: "Entertainment",
    items: ["Movies", "Web Series", "Anime", "Stand-up Comedy", "Podcasts"]
  },
  {
    title: "Music",
    items: ["Pop", "Hip-hop", "Indie", "EDM", "Singing", "Instruments"]
  },
  {
    title: "Food & Drinks",
    items: ["Coffee ☕", "Street Food", "Fine Dining", "Cooking", "Desserts"]
  },
  {
    title: "Travel",
    items: ["Solo Travel", "Road Trips", "Beaches", "Mountains", "City Exploration"]
  },
  {
    title: "Fitness",
    items: ["Gym", "Yoga", "Running", "Cycling"]
  },
  {
    title: "Gaming",
    items: ["Mobile Gaming", "PC Gaming", "Valorant 🎯", "PUBG / BGMI 🪖", "Call of Duty 💥", "Minecraft ⛏️", "GTA V 🚗", "FIFA ⚽"]
  },
  {
    title: "Pop Culture",
    items: ["Harry Potter ⚡", "Marvel 🕷️", "DC 🦇", "Interstellar 🌌", "Friends ☕", "Stranger Things 🔦", "Game of Thrones 🐉"]
  },
  {
    title: "Personality / Vibe",
    items: ["Chill 😌", "Funny 😂", "Romantic ❤️", "Adventurous 🔥", "Talkative 🗣️", "Listener 👂"]
  },
  {
    title: "Experiences",
    items: ["Coffee Date ☕", "Event Partner 🎉", "Travel Buddy ✈️", "Study Partner 📚", "Movie Partner 🎬", "City Guide 🗺️"]
  }
];

const POPULAR = ["Coffee ☕", "Gym", "Anime", "Marvel 🕷️", "Travel Buddy ✈️"];

export default function InterestSelection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  
  // Track which categories show all items (for the "Show more" functionality if lists get too long)
  // Initially we'll show up to 6 items per category unless expanded.
  const [expandedCats, setExpandedCats] = useState({});

  const toggleInterest = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      if (selected.length < 10) {
        setSelected([...selected, item]);
      }
    }
  };

  const toggleExpand = (title) => {
    setExpandedCats(prev => ({...prev, [title]: !prev[title]}));
  };

  const filteredCategories = CATEGORIES.map(cat => ({
    title: cat.title,
    items: cat.items.filter(item => item.toLowerCase().includes(query.toLowerCase()))
  })).filter(cat => cat.items.length > 0);

  const isMinMet = selected.length >= 5;
  const progressPercent = Math.min((selected.length / 10) * 100, 100);

  return (
    <div className="min-h-screen bg-brand-gradient/5 pt-20 pb-40 px-4 flex flex-col items-center">
      
      {/* Sticky Header / Progress */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <div className="w-full max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-dark">Pick Your Vibe</h1>
            <p className="text-brand-gray text-sm">{selected.length}/10 Selected (Min: 5)</p>
          </div>
          <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
             <motion.div 
               animate={{ width: `${progressPercent}%`, backgroundColor: isMinMet ? '#10B981' : '#D4AF37' }}
               className="h-full bg-brand-gradient"
               transition={{ duration: 0.3 }}
             />
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mt-6 space-y-12">
        {/* Title Area */}
        <div className="text-center">
           <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4">What makes you,<span className="text-brand-gradient"> you?</span></h2>
           <p className="text-xl text-brand-gray">Select 5 to 10 interests to match with the best companions.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input 
            type="text" 
            placeholder="Search interests... (e.g. Marvel, Gym)" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-lg font-bold bg-white p-5 pl-14 rounded-full border border-gray-100 shadow-sm outline-none focus:border-brand-purple focus:ring-4 ring-brand-purple/10 transition-all text-brand-dark"
          />
        </div>

        {/* Popular Section (Only show if not searching) */}
        {!query && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
            <h3 className="text-lg font-bold text-brand-gray uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-brand-pink" /> Trending Vibes
            </h3>
            <div className="flex flex-wrap gap-3">
              {POPULAR.map(item => {
                const active = selected.includes(item);
                return (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`px-5 py-3 rounded-full font-bold transition-all border-2 flex items-center gap-2 ${active ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20' : 'bg-white text-brand-dark border-gray-100 hover:border-brand-blue/30 shadow-sm'}`}
                  >
                    {item} {active && <Check size={16}/>}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Dynamic Categories */}
        <div className="space-y-10">
          <AnimatePresence>
            {filteredCategories.map((cat, idx) => {
              const showAll = expandedCats[cat.title] || query.length > 0;
              const displayItems = showAll ? cat.items : cat.items.slice(0, 6);
              const hasMore = cat.items.length > 6;

              return (
                <motion.div 
                  key={cat.title}
                  initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-brand-gray uppercase tracking-wider">{cat.title}</h3>
                  <div className="flex flex-wrap gap-3">
                    {displayItems.map(item => {
                      const active = selected.includes(item);
                      return (
                        <motion.button 
                          layout
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={item}
                          onClick={() => toggleInterest(item)}
                          className={`px-5 py-3 rounded-full font-bold transition-all border-2 flex items-center gap-2 ${active ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20' : 'bg-white text-brand-dark border-gray-100 hover:border-brand-blue/30 shadow-sm'}`}
                        >
                          {item} {active && <Check size={16}/>}
                        </motion.button>
                      )
                    })}
                    {!showAll && hasMore && (
                       <motion.button 
                         onClick={() => toggleExpand(cat.title)}
                         className="px-5 py-3 rounded-full font-bold text-brand-blue border-2 border-brand-blue/20 hover:bg-brand-blue/5 transition-all flex items-center gap-1"
                       >
                         +{cat.items.length - 6} more <ChevronDown size={16} />
                       </motion.button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-20 text-brand-gray font-medium">
              No interests found for "{query}". Try something else!
            </div>
          )}
        </div>
      </div>

      {/* Floating Continue Action */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
      >
        <div className="w-full max-w-3xl flex justify-between items-center px-2">
           <div className="text-brand-gray font-medium hidden sm:block">
             {selected.length < 5 ? (
               <span>Select {5 - selected.length} more...</span>
             ) : (
               <span className="text-brand-dark font-bold flex items-center gap-1"><Check size={18} className="text-green-500" /> Looking good!</span>
             )}
           </div>
           
           <button 
             disabled={!isMinMet}
             onClick={() => router.push('/explore')} 
             className={`px-12 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-2 transition-all ${isMinMet ? 'bg-brand-dark text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
           >
             Continue <ChevronRight size={24} />
           </button>
        </div>
      </motion.div>

    </div>
  );
}
