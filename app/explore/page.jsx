'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Filter, Star, Heart, X, MessageCircle,
  ChevronLeft, ChevronRight, CheckCircle2, Send, Sparkles,
  Navigation, SlidersHorizontal, RotateCcw, Shield, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';

// ─── Haversine formula ───────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Profiles are fetched from the database and maintained in component state


const VIBE_OPTIONS = ['Chill', 'Travel', 'Party', 'Intellectual', 'Fitness', 'Foodie'];
const SERVICE_OPTIONS = ['Coffee & Chat', 'Hanging Out', 'Shopping Buddy', 'Travel Guide', 'Gym Partner', 'Event Plus-One'];
const DISTANCE_OPTIONS = [5, 10, 25, 50];
const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

const DEFAULT_FILTERS = {
  distance: 50,
  priceMin: 0,
  priceMax: 5000,
  vibes: [],
  services: [],
  ageMin: 18,
  ageMax: 40,
  minRating: 0,
  verifiedOnly: false,
  bestMatch: false,
};

// ─── Filter Modal ────────────────────────────────────────────────
function FilterModal({ filters, setFilters, onClose }) {
  const [local, setLocal] = useState(filters);

  const toggle = (key, val) => {
    setLocal(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(x => x !== val) : [...prev[key], val],
    }));
  };

  const apply = () => { setFilters(local); onClose(); };
  const reset = () => setLocal(DEFAULT_FILTERS);

  const activeCount = [
    local.distance < 50,
    local.priceMax < 5000 || local.priceMin > 0,
    local.vibes.length > 0,
    local.services.length > 0,
    local.ageMin > 18 || local.ageMax < 40,
    local.minRating > 0,
    local.verifiedOnly,
  ].filter(Boolean).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full md:max-w-lg bg-white rounded-t-[2rem] md:rounded-[2rem] p-6 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-brand-dark">Filters</h2>
              {activeCount > 0 && (
                <span className="text-xs text-brand-purple font-bold">{activeCount} active filter{activeCount > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-brand-gray font-semibold hover:text-brand-dark transition-colors px-3 py-1.5 rounded-full bg-gray-100">
                <RotateCcw size={14} /> Reset
              </button>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-brand-gray hover:bg-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Distance */}
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">Distance</h3>
              <div className="flex gap-2 flex-wrap">
                {DISTANCE_OPTIONS.map(d => (
                  <motion.button whileTap={{ scale: 0.95 }} key={d}
                    onClick={() => setLocal(p => ({ ...p, distance: d }))}
                    className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${local.distance === d ? 'bg-brand-dark text-white border-brand-dark shadow-lg' : 'bg-white text-brand-gray border-gray-200 hover:border-brand-dark'}`}
                  >
                    {d} km
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">
                Price Range <span className="text-brand-gray font-normal normal-case">₹{local.priceMin} – ₹{local.priceMax}</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-brand-gray mb-1 block">Min ₹{local.priceMin}</label>
                  <input type="range" min={0} max={5000} step={100} value={local.priceMin}
                    onChange={e => setLocal(p => ({ ...p, priceMin: +e.target.value }))}
                    className="w-full accent-brand-purple h-2 rounded-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-brand-gray mb-1 block">Max ₹{local.priceMax}</label>
                  <input type="range" min={0} max={5000} step={100} value={local.priceMax}
                    onChange={e => setLocal(p => ({ ...p, priceMax: +e.target.value }))}
                    className="w-full accent-brand-purple h-2 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Age Range */}
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">
                Age Range <span className="text-brand-gray font-normal normal-case">{local.ageMin} – {local.ageMax} yrs</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-brand-gray mb-1 block">Min age: {local.ageMin}</label>
                  <input type="range" min={18} max={45} step={1} value={local.ageMin}
                    onChange={e => setLocal(p => ({ ...p, ageMin: +e.target.value }))}
                    className="w-full accent-brand-purple h-2 rounded-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-brand-gray mb-1 block">Max age: {local.ageMax}</label>
                  <input type="range" min={18} max={45} step={1} value={local.ageMax}
                    onChange={e => setLocal(p => ({ ...p, ageMax: +e.target.value }))}
                    className="w-full accent-brand-purple h-2 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Vibes */}
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">Vibe</h3>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map(v => (
                  <motion.button whileTap={{ scale: 0.9 }} key={v}
                    onClick={() => toggle('vibes', v)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${local.vibes.includes(v) ? 'bg-brand-purple text-white border-brand-purple shadow-[0_0_10px_rgba(139,92,246,0.4)]' : 'bg-white text-brand-gray border-gray-200 hover:border-brand-purple/50'}`}
                  >
                    {v}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">Services</h3>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map(s => (
                  <motion.button whileTap={{ scale: 0.9 }} key={s}
                    onClick={() => toggle('services', s)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${local.services.includes(s) ? 'bg-brand-purple text-white border-brand-purple shadow-[0_0_10px_rgba(139,92,246,0.4)]' : 'bg-white text-brand-gray border-gray-200 hover:border-brand-purple/50'}`}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">Minimum Rating</h3>
              <div className="flex gap-2">
                {[0, 4, 4.5].map(r => (
                  <motion.button whileTap={{ scale: 0.95 }} key={r}
                    onClick={() => setLocal(p => ({ ...p, minRating: r }))}
                    className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${local.minRating === r ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-gray-200 hover:border-brand-dark'}`}
                  >
                    {r === 0 ? 'Any' : `${r}★+`}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              {[
                { key: 'verifiedOnly', label: 'Verified only', icon: Shield },
                { key: 'bestMatch', label: 'Best Match first', icon: Zap },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 text-brand-dark font-semibold">
                    <Icon size={16} className="text-brand-purple" /> {label}
                  </div>
                  <button
                    onClick={() => setLocal(p => ({ ...p, [key]: !p[key] }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${local[key] ? 'bg-brand-purple' : 'bg-gray-200'}`}
                  >
                    <motion.div animate={{ x: local[key] ? 24 : 2 }} transition={{ type: 'spring', stiffness: 500 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Apply */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={apply}
            className="w-full mt-8 py-4 bg-brand-dark text-white rounded-2xl font-bold text-lg shadow-xl hover:opacity-90 transition-opacity"
          >
            Show Results
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Explore Page ───────────────────────────────────────────
export default function Explore() {
  const router = useRouter();
  const { profile: userProfile, isLoggedIn, hydrated } = useProfile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [actionSplash, setActionSplash] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProfiles, setAllProfiles] = useState([]);

  // Use direct Firebase state to avoid localStorage desyncs
  const [dbUser, setDbUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch Real Users Feature
  useEffect(() => {
    if (!dbUser) return;
    import('firebase/firestore').then(({ collection, query, where, getDocs }) => {
      import('@/lib/firebase').then(async ({ db }) => {
        try {
          const q = query(
            collection(db, 'users'),
            where('isRealUser', '==', true),
            where('profileCompleted', '==', true)
          );
          const snap = await getDocs(q);
          const profilesList = [];
          snap.forEach(doc => {
            if (doc.id === dbUser.uid) return; // Skip own profile
            const d = doc.data();
            
            // Map photos Array. If profilePic exists, it should be the first.
            let userImages = [];
            if (d.profilePic) userImages.push(d.profilePic);
            if (d.photos && Array.isArray(d.photos)) {
                d.photos.forEach(p => { if (p && p !== d.profilePic) userImages.push(p); });
            }
            if (userImages.length === 0) userImages.push(`https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || 'User')}`);

            profilesList.push({
              id: doc.id,
              name: d.name || 'Unknown',
              age: d.age || '?',
              city: d.city || 'Unknown',
              price: d.hourlyRate || 1000,
              isCompanion: d.isCompanion || false,
              match: 99,
              rating: 5.0,
              reviews: 0,
              verified: true,
              vibes: d.vibes || [],
              services: d.services || [],
              bio: d.bio || '',
              interests: d.interests || [],
              habits: d.habits || {},
              images: userImages,
              lat: 20.5937, 
              lng: 78.9629,
              dist: null
            });
          });
          setAllProfiles(profilesList);
        } catch (err) {
          console.error("Error fetching explore profiles:", err);
        }
      });
    });
  }, [dbUser]);

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      import('firebase/firestore').then(({ doc, getDoc }) => {
        import('@/lib/firebase').then(({ auth, db }) => {
          const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
              router.push('/login');
              return;
            }
            
            try {
              const userRef = doc(db, 'users', currentUser.uid);
              const snap = await getDoc(userRef);
              
              if (snap.exists()) {
                const data = snap.data();
                if (!data.profileCompleted) {
                  router.push('/onboarding');
                  return;
                }
              } else {
                router.push('/onboarding');
                return;
              }
              
              setDbUser(currentUser);
            } catch (e) {
              console.error(e);
            } finally {
              setAuthLoading(false);
            }
          });

          return () => unsubscribe();
        });
      });
    });
  }, [router]);

  // Location state
  const [userLoc, setUserLoc] = useState(null); // { lat, lng }
  const [locStatus, setLocStatus] = useState('idle'); // idle | loading | ok | denied
  const [manualCity, setManualCity] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Request geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocStatus('denied'); return; }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus('ok');
      },
      () => {
        setLocStatus('denied');
        setShowCityPicker(true);
      },
      { timeout: 8000 }
    );
  }, []);

  // Auto-request on mount
  useEffect(() => { requestLocation(); }, [requestLocation]);

  // Filtered + sorted profiles
  const filteredProfiles = useMemo(() => {
    let profiles = allProfiles.map(p => {
      let dist = null;
      if (userLoc) dist = haversine(userLoc.lat, userLoc.lng, p.lat, p.lng);
      else if (manualCity) dist = haversine(
        allProfiles.find(x => x.city === manualCity)?.lat || p.lat,
        allProfiles.find(x => x.city === manualCity)?.lng || p.lng,
        p.lat, p.lng
      );
      return { ...p, dist };
    });

    // Distance filter (only if we have a reference location)
    if (userLoc || manualCity) {
      profiles = profiles.filter(p => p.dist !== null && p.dist <= filters.distance);
    }

    // Price
    profiles = profiles.filter(p => {
      if (!p.isCompanion) return true;
      return p.price >= filters.priceMin && p.price <= filters.priceMax;
    });

    // Age
    profiles = profiles.filter(p => p.age >= filters.ageMin && p.age <= filters.ageMax);

    // Rating
    if (filters.minRating > 0) profiles = profiles.filter(p => p.rating >= filters.minRating);

    // Verified
    if (filters.verifiedOnly) profiles = profiles.filter(p => p.verified);

    // Vibes
    if (filters.vibes.length > 0) {
      profiles = profiles.filter(p =>
        filters.vibes.some(fv => p.vibes.some(pv => pv.toLowerCase().includes(fv.toLowerCase())))
      );
    }

    // Services
    if (filters.services.length > 0) {
      profiles = profiles.filter(p =>
        filters.services.some(fs => p.services.some(ps => ps.toLowerCase().includes(fs.toLowerCase())))
      );
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      profiles = profiles.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.interests.some(i => i.toLowerCase().includes(q))
      );
    }

    // Sort: best match first
    if (filters.bestMatch) profiles.sort((a, b) => b.match - a.match);
    else if (userLoc || manualCity) profiles.sort((a, b) => (a.dist ?? 999) - (b.dist ?? 999));

    return profiles;
  }, [userLoc, manualCity, filters, searchQuery, allProfiles]);

  // Reset index when filters change
  useEffect(() => { setCurrentIndex(0); setImageIndex(0); }, [filters, searchQuery]);

  // Prevent blank screen while redirecting or loading auth profile
  if (authLoading || !dbUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent/20"></div>
          <p className="text-brand-dark font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }


  const activeFilterCount = [
    filters.distance < 50,
    filters.priceMax < 5000 || filters.priceMin > 0,
    filters.vibes.length > 0,
    filters.services.length > 0,
    filters.ageMin > 18 || filters.ageMax < 40,
    filters.minRating > 0,
    filters.verifiedOnly,
    filters.bestMatch,
  ].filter(Boolean).length;

  const profile = filteredProfiles[currentIndex];

  const handleNextProfile = (actionType) => {
    setActionSplash(actionType);
    setShowMessage(false);
    setMessageText('');
    setTimeout(() => {
      setActionSplash(null);
      setCurrentIndex(prev => (prev + 1) % Math.max(filteredProfiles.length, 1));
      setImageIndex(0);
    }, 600);
  };

  const nextImage = () => {
    if (profile && imageIndex < profile.images.length - 1) setImageIndex(p => p + 1);
  };
  const prevImage = () => {
    if (profile && imageIndex > 0) setImageIndex(p => p - 1);
  };


  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col bg-white relative overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex gap-3 items-center">
        {/* Location pill */}
        <div className="flex items-center gap-2 shrink-0">
          {locStatus === 'ok' ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full text-green-700 text-xs font-bold"
            >
              <Navigation size={12} /> Near you
            </motion.div>
          ) : locStatus === 'denied' ? (
            <button onClick={() => setShowCityPicker(v => !v)}
              className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full text-orange-700 text-xs font-bold"
            >
              <MapPin size={12} /> {manualCity || 'Set city'}
            </button>
          ) : locStatus === 'loading' ? (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-gray-500 text-xs font-bold animate-pulse">
              <Navigation size={12} /> Locating…
            </div>
          ) : (
            <button onClick={requestLocation}
              className="flex items-center gap-1.5 bg-brand-purple/10 border border-brand-purple/20 px-3 py-1.5 rounded-full text-brand-purple text-xs font-bold"
            >
              <Navigation size={12} /> Use my location
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
          <Search size={16} className="text-brand-gray shrink-0" />
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name, city, interest…"
            className="w-full bg-transparent outline-none text-sm text-brand-dark placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter button */}
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilter(true)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border transition-all ${activeFilterCount > 0 ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-gray-200 hover:border-brand-dark'}`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-purple text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </motion.button>

        {/* Best Match toggle */}
        <button
          onClick={() => setFilters(p => ({ ...p, bestMatch: !p.bestMatch }))}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all ${filters.bestMatch ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-brand-gray border-gray-200'}`}
        >
          <Zap size={12} /> Best Match
        </button>
      </div>

      {/* City Picker dropdown */}
      <AnimatePresence>
        {showCityPicker && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-4 z-[60] bg-white shadow-xl border border-gray-100 rounded-2xl p-4 w-56"
          >
            <p className="text-xs font-bold text-brand-gray mb-3 uppercase tracking-wider">Select your city</p>
            {INDIAN_CITIES.map(city => (
              <button key={city}
                onClick={() => { setManualCity(city); setShowCityPicker(false); setLocStatus('denied'); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${manualCity === city ? 'bg-brand-dark text-white' : 'hover:bg-gray-50 text-brand-dark'}`}
              >
                {city}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Profile Viewer ── */}
      {!profile ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 mt-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-5xl">🔍</div>
          <h3 className="text-2xl font-bold text-brand-dark">No profiles found</h3>
          <p className="text-brand-gray">Try adjusting your filters or expanding the distance.</p>
          <button onClick={() => setFilters(DEFAULT_FILTERS)}
            className="px-6 py-3 bg-brand-dark text-white rounded-full font-bold mt-2 hover:opacity-90">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative mt-14">

          {/* Splash overlay */}
          <AnimatePresence>
            {actionSplash === 'like' && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm pointer-events-none">
                <Heart className="w-40 h-40 text-brand-pink fill-brand-pink drop-shadow-2xl" />
              </motion.div>
            )}
            {actionSplash === 'skip' && (
              <motion.div initial={{ scale: 0, opacity: 0, rotate: -45 }} animate={{ scale: 1.5, opacity: 1, rotate: 0 }} exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm pointer-events-none">
                <X className="w-40 h-40 text-gray-400 drop-shadow-2xl" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* LEFT: Image Carousel */}
          <div className="md:w-[45%] lg:w-1/2 h-1/2 md:h-full relative bg-gray-900 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={`${profile.id}-${imageIndex}`}
                initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                src={profile.images[imageIndex]}
                className="w-full h-full object-cover"
                alt={profile.name}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

            {/* Dot indicators */}
            {profile.images.length > 1 && (
              <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-20 px-10">
                {profile.images.map((_, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i === imageIndex ? 'bg-white' : 'bg-white/30'}`} />
                ))}
              </div>
            )}

            {/* Arrows */}
            {imageIndex > 0 && (
              <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition z-20">
                <ChevronLeft size={22} />
              </button>
            )}
            {imageIndex < profile.images.length - 1 && (
              <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition z-20">
                <ChevronRight size={22} />
              </button>
            )}

            {/* Distance badge */}
            {profile.dist !== null && profile.dist !== undefined && (
              <div className="absolute top-8 right-4 z-20 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-xs font-bold">
                <MapPin size={12} /> {profile.dist < 1 ? `${Math.round(profile.dist * 1000)}m` : `${profile.dist.toFixed(1)} km`} away
              </div>
            )}

            {/* Message bubble on photo */}
            <button onClick={() => setShowMessage(true)}
              className="absolute bottom-6 left-5 z-20 w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all hover:scale-110 border border-white/30">
              <MessageCircle size={20} />
            </button>

            {/* Mobile name overlay */}
            <div className="absolute bottom-6 left-20 right-6 text-white z-20 md:hidden">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{profile.name}, {profile.age}</h2>
                {profile.verified && <CheckCircle2 className="text-green-400" size={20} />}
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <MapPin size={13} /> {profile.city}
              </div>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="md:w-[55%] lg:w-1/2 h-1/2 md:h-full relative flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-7" style={{ paddingBottom: '120px' }}>

              {/* Header */}
              <div className="hidden md:flex justify-between items-start border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-4xl font-extrabold text-brand-dark tracking-tight">{profile.name}, {profile.age}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-brand-gray">
                    <div className="flex items-center gap-1"><MapPin size={15} /> {profile.city}</div>
                    {profile.dist !== null && profile.dist !== undefined && (
                      <div className="flex items-center gap-1 text-brand-purple font-semibold text-sm">
                        <Navigation size={13} /> {profile.dist.toFixed(1)} km away
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rate */}
              {profile.isCompanion && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gray block mb-0.5">Companionship Rate</span>
                    <span className="text-3xl font-extrabold text-brand-dark">₹{profile.price}<span className="text-base text-brand-gray font-medium">/hr</span></span>
                  </div>
                  <span className="bg-brand-dark text-white px-4 py-2 rounded-xl text-xs font-bold">{profile.tag}</span>
                </div>
              )}

              {/* Prompts */}
              {profile.prompts?.length > 0 && (
                <div className="space-y-4">
                  {profile.prompts.map((p, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 relative group">
                      <p className="text-xs font-bold text-brand-gray mb-1.5">{p.q}</p>
                      <p className="text-lg font-semibold text-brand-dark leading-snug">{p.a}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Lifestyle */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold text-brand-gray mb-3 border-b border-gray-100 pb-2">Lifestyle</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.habits && Object.values(profile.habits).filter(Boolean).map((h, i) => (
                    <span key={i} className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm font-semibold text-brand-dark shadow-sm">{h}</span>
                  ))}
                </div>
              </div>

              {/* Services */}
              {profile.isCompanion && profile.services.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-brand-gray mb-3 border-b border-gray-100 pb-2">Offered Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map(s => (
                      <span key={s} className="bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-1.5 rounded-full text-sm font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vibes */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold text-brand-gray mb-3 border-b border-gray-100 pb-2">Vibes</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.vibes.map(v => (
                    <span key={v} className="bg-brand-purple/5 border border-brand-purple/20 text-brand-purple px-4 py-2 rounded-full text-sm font-bold">{v}</span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold text-brand-gray mb-3 border-b border-gray-100 pb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((v, i) => (
                    <span key={i} className="bg-gray-100 text-brand-dark px-3 py-1.5 rounded-lg text-sm font-medium">{v}</span>
                  ))}
                </div>
              </div>

              {/* Profile counter */}
              <div className="text-center text-xs text-brand-gray">
                {currentIndex + 1} of {filteredProfiles.length} people near you
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent p-5 pt-10 flex justify-center gap-5 items-center z-20">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleNextProfile('skip')}
                className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                <X size={28} strokeWidth={2.5} />
              </motion.button>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowMessage(true)}
                className="px-7 py-3.5 bg-brand-dark text-white rounded-full font-bold shadow-xl flex items-center gap-2 hover:-translate-y-0.5 transition-transform text-sm">
                <MessageCircle size={18} /> Send Message
              </motion.button>

              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleNextProfile('like')}
                className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-brand-pink hover:bg-pink-50 hover:border-pink-200 transition-colors">
                <Heart size={26} strokeWidth={2.5} className="fill-brand-pink/20" />
              </motion.button>
            </div>

            {/* Mini message popup */}
            <AnimatePresence>
              {showMessage && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-30" onClick={() => setShowMessage(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-[90px] left-5 right-5 bg-white shadow-[0_-4px_40px_rgba(0,0,0,0.18)] border border-gray-100 rounded-3xl p-5 z-40"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-brand-dark flex items-center gap-2">
                        <MessageCircle size={15} className="text-brand-purple" /> Message {profile.name}
                      </span>
                      <button onClick={() => setShowMessage(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <textarea autoFocus value={messageText} onChange={e => setMessageText(e.target.value)}
                      placeholder={`Say hi to ${profile.name}…`} rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-sm outline-none focus:border-brand-purple focus:ring-2 ring-brand-purple/10 resize-none text-brand-dark placeholder:text-gray-400 mb-3"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => setShowMessage(false)}
                        className="flex-1 py-2.5 border border-gray-200 text-brand-gray rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => handleNextProfile('like')}
                        className="flex-1 py-2.5 bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
                        <Send size={14} /> Send
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Filter modal */}
      <AnimatePresence>
        {showFilter && <FilterModal filters={filters} setFilters={setFilters} onClose={() => setShowFilter(false)} />}
      </AnimatePresence>
    </div>
  );
}
