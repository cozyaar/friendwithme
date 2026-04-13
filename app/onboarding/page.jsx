'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, ChevronDown, Camera, Image as ImageIcon, MapPin, Check, Plus, Search, Sparkles, Filter, Globe, Music, Coffee, Dumbbell, Map, Gamepad2, Tv, Book } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { useProfile } from '@/context/ProfileContext';

const INTEREST_CATEGORIES = [
  { title: "Entertainment", items: ["Movies", "Web Series", "Anime", "Stand-up Comedy", "Podcasts"] },
  { title: "Music", items: ["Pop", "Hip-hop", "Indie", "EDM", "Singing", "Instruments"] },
  { title: "Food & Drinks", items: ["Coffee ☕", "Street Food", "Fine Dining", "Cooking", "Desserts"] },
  { title: "Travel", items: ["Solo Travel", "Road Trips", "Beaches", "Mountains", "City Exploration"] },
  { title: "Fitness", items: ["Gym", "Yoga", "Running", "Cycling"] },
  { title: "Gaming", items: ["Mobile Gaming", "PC Gaming", "Valorant 🎯", "PUBG / BGMI 🪖", "Call of Duty 💥", "Minecraft ⛏️", "GTA V 🚗", "FIFA ⚽"] },
  { title: "Pop Culture", items: ["Harry Potter ⚡", "Marvel 🕷️", "DC 🦇", "Interstellar 🌌", "Friends ☕", "Stranger Things 🔦", "Game of Thrones 🐉"] },
  { title: "Personality / Vibe", items: ["Chill 😌", "Funny 😂", "Romantic ❤️", "Adventurous 🔥", "Talkative 🗣️", "Listener 👂"] },
  { title: "Experiences", items: ["Coffee Date ☕", "Event Partner 🎉", "Travel Buddy ✈️", "Study Partner 📚", "Movie Partner 🎬", "City Guide 🗺️"] }
];

const PINCODE_MAP = {
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "560001": { city: "Bangalore", state: "Karnataka" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "110001": { city: "Delhi", state: "Delhi" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
};

const MAJOR_CITIES = [
  "Mumbai, Maharashtra", "Delhi, Delhi", "Bangalore, Karnataka", "Hyderabad, Telangana", 
  "Ahmedabad, Gujarat", "Chennai, Tamil Nadu", "Kolkata, West Bengal", 
  "Surat, Gujarat", "Pune, Maharashtra", "Jaipur, Rajasthan"
];

const POPULAR_INTERESTS = ["Coffee ☕", "Gym", "Anime", "Marvel 🕷️", "Travel Buddy ✈️"];

const PROMPTS = [
  "My perfect day looks like...",
  "I'm known for...",
  "Let's grab coffee if...",
  "A random fact about me...",
  "The way to win me over is...",
  "I'll fall for you if...",
  "My biggest green flag is...",
  "My vibe in one word is...",
  "The most spontaneous thing I've done is...",
  "You should message me if..."
];

const LocationSelector = ({ data, updateData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [detected, setDetected] = useState("");

  const handlePincode = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    updateData('pincode', val);
    
    if (val.length === 6) {
      setDetected("Searching... ✨");
      setError("");
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const result = await res.json();
        
        if (result && result[0] && result[0].Status === "Success") {
          const match = result[0].PostOffice[0];
          const fullLocation = `${match.District}, ${match.State}`;
          updateData('location', fullLocation);
          setDetected(`Detected: ${fullLocation}`);
          setError("");
        } else {
          setError("Invalid Indian pincode");
          setDetected("");
          updateData('location', "");
        }
      } catch (err) {
        setError("Network error fetching API");
        setDetected("");
      }
    } else {
      setError("");
      setDetected("");
    }
  };

  const filteredCities = MAJOR_CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-4">
        <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">Pincode</label>
        <div className="relative flex items-center">
          <span className="absolute left-4">📮</span>
          <input 
            placeholder="600001" 
            value={data.pincode} onChange={handlePincode}
            className={`w-full text-xl font-bold bg-white p-5 pl-12 rounded-[1.5rem] border ${error ? 'border-red-500 text-red-500' : 'border-gray-100 text-brand-dark'} shadow-sm outline-none focus:border-brand-purple focus:ring-4 ring-brand-purple/10 transition-all`}
          />
        </div>
        {error && <p className="text-red-500 text-xs font-bold px-2">{error}</p>}
      </div>

      <div className="sm:col-span-2 space-y-4 relative">
        <div className="flex justify-between items-center">
          <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">City</label>
          {detected && <span className="text-brand-purple text-xs font-bold">{detected}</span>}
        </div>
        
        <div className="relative">
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-xl font-bold bg-white p-5 pl-12 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer focus:border-brand-purple transition-all text-brand-dark relative"
          >
            <span className="absolute left-4">📍</span>
            <span>{data.location || "Select City"}</span>
            <ChevronDown className="text-brand-gray" />
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute z-[100] top-[110%] w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto"
              >
                <div className="p-3 border-b border-gray-100 relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray" size={18} />
                  <input 
                    type="text" autoFocus
                    placeholder="Search city..." 
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-gray-50 p-3 pl-10 rounded-xl outline-none font-medium text-brand-dark"
                  />
                </div>
                <div className="max-h-[250px] overflow-y-auto p-2 overscroll-contain touch-auto">
                  {filteredCities.map(city => (
                    <div 
                      key={city} 
                      onClick={() => {
                        updateData('location', city);
                        setIsOpen(false);
                      }}
                      className="p-3 hover:bg-brand-purple/10 rounded-xl cursor-pointer font-bold text-brand-dark flex justify-between items-center"
                    >
                      {city}
                      {data.location === city && <Check size={18} className="text-brand-purple" />}
                    </div>
                  ))}
                  {filteredCities.length === 0 && (
                    <div className="p-4 text-center text-brand-gray font-medium">No cities found</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const { profile, isLoggedIn, hydrated, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  // Use direct Firebase state to avoid localStorage desyncs
  const [dbUser, setDbUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [data, setData] = useState({
    name: '', age: '', dobDay: '', dobMonth: '', dobYear: '',
    heightFt: '', heightIn: '', gender: '', location: '', pincode: '',
    habits: { smoking: '', drinking: '', activity: '', sleep: '', social: '' },
    photos: [null, null, null, null, null, null],
    interests: [],
    prompts: [],
    vibes: [], prefGender: '', prefAge: 25, prefDist: 15,
    isCompanion: false,
    hourlyRate: '',
    services: []
  });

  const [interestQuery, setInterestQuery] = useState("");
  const [expandedCats, setExpandedCats] = useState({});
  const [showMaxToast, setShowMaxToast] = useState(false);
  
  const [subtitle, setSubtitle] = useState("Your vibe just got upgraded 😌✨");
  useEffect(() => {
    const subs = [
      "Your vibe just got upgraded 😌✨",
      "Someone's gonna enjoy your company 👀",
      "Warning: You might get too many invites 🔥",
      "Let the good times begin 🎉",
      "You're officially interesting now 😎",
      "Time to make some great memories 🚀",
      "Your next hangout is waiting..."
    ];
    setSubtitle(subs[Math.floor(Math.random() * subs.length)]);
  }, []);

  const [promptStage, setPromptStage] = useState('select');

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      import('firebase/firestore').then(({ doc, getDoc }) => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!currentUser) {
            console.log('[Onboarding] No auth user → redirecting to /login');
            router.push('/login');
            return;
          }

          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(userRef);

            if (snap.exists()) {
              const userData = snap.data();
              console.log('[Onboarding] User data:', userData);

              if (userData.profileCompleted === true) {
                console.log('[Onboarding] profileCompleted=true → redirecting to /explore');
                router.push('/explore');
                return;
              }

              // Preload any previously saved onboarding data
              setData(prev => ({
                ...prev,
                name: userData.name || '',
                age: userData.age ? String(userData.age) : '',
                dobDay: userData.dobDay || '',
                dobMonth: userData.dobMonth || '',
                dobYear: userData.dobYear || '',
                heightFt: userData.heightFt || '',
                heightIn: userData.heightIn || '',
                gender: userData.gender || '',
                location: userData.city || userData.location || '',
                pincode: userData.pincode || '',
                habits: userData.habits || { smoking: '', drinking: '', activity: '', sleep: '', social: '' },
                photos: userData.photos || [null, null, null, null, null, null],
                interests: userData.interests || [],
                prompts: userData.prompts || [],
                vibes: userData.vibes || [],
                prefGender: userData.prefGender || '',
                prefAge: userData.prefAge || 25,
                prefDist: userData.prefDist || 15,
                isCompanion: userData.isCompanion || false,
                hourlyRate: userData.hourlyRate || '',
                services: userData.services || [],
              }));

              // Resume from saved step if available
              if (userData.currentStep && userData.currentStep > 1) {
                setStep(userData.currentStep);
              }
            } else {
              // Document doesn't exist yet — create it
              console.log('[Onboarding] No Firestore doc found, creating...');
              const { setDoc, serverTimestamp } = await import('firebase/firestore');
              await setDoc(userRef, {
                uid: currentUser.uid,
                phone: currentUser.phoneNumber || '',
                name: '',
                age: null,
                city: '',
                bio: '',
                interests: [],
                lifestyle: [],
                profilePic: '',
                createdAt: serverTimestamp(),
                profileCompleted: false,
                isRealUser: true,
              });
            }
            setDbUser(currentUser);
          } catch (e) {
            console.error('[Onboarding] Auth guard error:', e);
            setDbUser(currentUser); // still show onboarding on error
          } finally {
            setAuthLoading(false);
          }
        });

        return () => unsubscribe();
      });
    });
  }, [router]);

  if (authLoading || !dbUser) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0B0B0B', gap: '16px'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '4px solid rgba(212,175,55,0.2)',
          borderTopColor: '#D4AF37',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#D4AF37', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em' }}>
          Loading your profile…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const slideVars = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { x: -40, opacity: 0, transition: { duration: 0.2 } }
  };

  const handleNext = async () => {
    if (step === 5 && promptStage === 'select') {
      setPromptStage('answer');
      return;
    }
    // Save current step progress to Firestore so user can resume
    if (auth.currentUser) {
      try {
        const { updateDoc } = await import('firebase/firestore');
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const nextStep = Math.min(step + 1, totalSteps);
        await updateDoc(userRef, {
          currentStep: nextStep,
          // Save step-relevant data
          ...(step === 1 && {
            name: data.name,
            age: parseInt(data.age) || null,
            dobDay: data.dobDay, dobMonth: data.dobMonth, dobYear: data.dobYear,
            heightFt: data.heightFt, heightIn: data.heightIn,
            gender: data.gender,
            city: data.location,
            pincode: data.pincode,
          }),
          ...(step === 2 && { habits: data.habits, lifestyle: Object.values(data.habits).filter(Boolean) }),
          ...(step === 4 && { interests: data.interests }),
          ...(step === 5 && { prompts: data.prompts }),
          ...(step === 6 && { vibes: data.vibes }),
          ...(step === 7 && { isCompanion: data.isCompanion, hourlyRate: data.hourlyRate, services: data.services }),
        });
        console.log(`[Onboarding] Step ${step} saved to Firestore`);
      } catch (e) {
        console.error('[Onboarding] Step save error:', e);
      }
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (step === 5 && promptStage === 'answer') {
      setPromptStage('select');
    } else {
      setStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleFinish = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      let profilePicUrl = "";

      // Upload main photo if provided (must be a blob/object URL from file input)
      if (data.photos && data.photos[0] && data.photos[0].startsWith('blob:')) {
        try {
          const response = await fetch(data.photos[0]);
          const blob = await response.blob();
          const storage = getStorage();
          const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
          await uploadBytes(storageRef, blob);
          profilePicUrl = await getDownloadURL(storageRef);
          console.log('[Onboarding] Photo uploaded:', profilePicUrl);
        } catch (e) {
          console.error('[Onboarding] Image upload failed, continuing without photo:', e);
        }
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);

      // Use first prompt answer as bio if no explicit bio set
      const extractedBio = data.prompts?.[0]?.answer || data.bio || '';
      const extractedLifestyle = Object.values(data.habits).filter(Boolean);

      const firestorePayload = {
        // Core spec fields
        name: data.name || '',
        age: parseInt(data.age) || null,
        city: data.location || '',
        bio: extractedBio,
        interests: data.interests || [],
        lifestyle: extractedLifestyle,
        profilePic: profilePicUrl,
        profileCompleted: true,
        isRealUser: true,
        // Extended fields for UI
        dobDay: data.dobDay || '', dobMonth: data.dobMonth || '', dobYear: data.dobYear || '',
        heightFt: data.heightFt || '', heightIn: data.heightIn || '',
        gender: data.gender || '',
        pincode: data.pincode || '',
        habits: data.habits || {},
        prompts: data.prompts || [],
        vibes: data.vibes || [],
        prefGender: data.prefGender || '',
        prefAge: data.prefAge || 25,
        prefDist: data.prefDist || 15,
        isCompanion: data.isCompanion || false,
        hourlyRate: data.hourlyRate || null,
        services: data.services || [],
        currentStep: 8,
      };

      await updateDoc(userRef, firestorePayload);
      console.log('[Onboarding] Profile saved, profileCompleted=true');

      // Update local context so UI reflects immediately
      updateProfile({
        ...firestorePayload,
        avatar: profilePicUrl,
        photos: data.photos,
      });

      router.push('/explore');
    } catch (error) {
      console.error('[Onboarding] Error saving onboarding data:', error);
      setIsSaving(false);
    }
  };
  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleDobPartChange = (part, value) => {
    const newData = { ...data, [part]: value };
    setData(newData);
    
    // Auto-calculate age if all parts are filled
    if (newData.dobDay && newData.dobMonth && newData.dobYear) {
      const birthDate = new Date(`${newData.dobYear}-${newData.dobMonth}-${newData.dobDay}`);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setData(prev => ({ ...prev, age: calculatedAge.toString() }));
    }
  };

  const handlePhotoUpload = (e, index) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp" || file.type === "image/jpg")) {
      const newPhotos = [...data.photos];
      newPhotos[index] = URL.createObjectURL(file);
      updateData('photos', newPhotos);
    } else if (file) {
      alert("Invalid image format! Use JPG, PNG, or WEBP.");
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...data.photos];
    newPhotos.splice(index, 1);
    newPhotos.push(null);
    updateData('photos', newPhotos);
  };

  const toggleInterest = (id) => {
    if (data.interests.includes(id)) {
      updateData('interests', data.interests.filter(i => i !== id));
      setShowMaxToast(false);
    } else {
      if (data.interests.length < 9) {
        updateData('interests', [...data.interests, id]);
        setShowMaxToast(false);
      } else {
        setShowMaxToast(true);
        setTimeout(() => setShowMaxToast(false), 3000);
      }
    }
  };

  const togglePrompt = (q) => {
    const isSelected = data.prompts.some(p => p.question === q);
    if (isSelected) {
      updateData('prompts', data.prompts.filter(p => p.question !== q));
    } else if (data.prompts.length < 3) {
      updateData('prompts', [...data.prompts, { question: q, answer: "" }]);
    }
  };

  const updatePrompt = (index, value) => {
    const newPrompts = [...data.prompts];
    newPrompts[index].answer = value;
    updateData('prompts', newPrompts);
  };

  const VIBE_CATEGORIES = [
    { title: "Social", items: ["Casual Hangout ☕", "Coffee Date ☕", "Chill & Talk 😌", "Long Walk 🚶"] },
    { title: "Events", items: ["Event Partner 🎉", "Party Buddy 🕺", "Clubbing Night 💃"] },
    { title: "Travel", items: ["Travel Buddy ✈️", "Road Trip 🚗", "Weekend Getaway 🌄", "City Explorer 🗺️"] },
    { title: "Entertainment", items: ["Movie Partner 🎬", "Gaming Buddy 🎮", "Concert Partner 🎵", "Netflix & Chill 🍿"] },
    { title: "Fitness", items: ["Gym Partner 🏋️", "Running Buddy 🏃", "Sports Partner ⚽", "Yoga Partner 🧘"] },
    { title: "Intellectual", items: ["Study Partner 📚", "Deep Conversations 🧠", "Book Buddy 📖", "Work Buddy 💻"] }
  ];

  const toggleVibe = (vibe) => {
    if (data.vibes.includes(vibe)) {
      updateData('vibes', data.vibes.filter(v => v !== vibe));
    } else {
      if (data.vibes.length < 3) {
        updateData('vibes', [...data.vibes, vibe]);
      } else {
        alert("You can select up to 3 vibes!");
      }
    }
  };

  // Validators
  const isStep1Valid = data.name.trim() !== '' && data.age && parseInt(data.age) >= 18 && data.gender !== '' && data.location !== '' && data.heightFt !== '' && data.heightIn !== '';
  const isStep2Valid = Object.values(data.habits).every(val => val !== '');
  const isStep4Valid = data.interests.length >= 5;
  const isStep5Valid = data.prompts.length === 3 && data.prompts.every(p => p.answer && p.answer.length >= 10);
  const isStep7Valid = !data.isCompanion || (data.hourlyRate && Number(data.hourlyRate) > 0 && data.services.length > 0);

  const COMPANION_SERVICES = [
    "Hanging Out 😌", "Coffee & Chat ☕", "Casual Walk 🚶", 
    "Shopping Buddy 🛍️", "Food Outing 🍽️", "City Exploration 🗺️", 
    "Travel Guide ✈️", "Event Companion 🎉", "Study Partner 📚", 
    "Work Buddy 💻", "Gym Partner 🏋️"
  ];

  const Step1 = () => (
    <motion.div key="step1" {...slideVars} className="space-y-6">
      <h2 className="text-4xl font-bold text-brand-dark mb-8">Let's start with the basics.</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">Your Name</label>
          <input 
            placeholder="First Name" 
            value={data.name} onChange={e => updateData('name', e.target.value)}
            className="w-full text-2xl font-bold bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm outline-none focus:border-brand-purple focus:ring-4 ring-brand-purple/10 transition-all text-brand-dark"
          />
        </div>
        <div className="space-y-4">
          <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">Height</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select value={data.heightFt} onChange={e => updateData('heightFt', e.target.value)} className="w-full h-[66px] text-lg font-bold bg-white p-3 rounded-xl border border-gray-100 outline-none focus:border-brand-purple focus:ring-2 ring-brand-purple/10 appearance-none text-brand-dark cursor-pointer">
                <option value="" disabled>Ft</option>
                {[3,4,5,6,7].map(ft => <option key={ft} value={ft}>{ft}'</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray pointer-events-none" size={16} />
            </div>
            <div className="relative flex-1">
              <select value={data.heightIn} onChange={e => updateData('heightIn', e.target.value)} className="w-full h-[66px] text-lg font-bold bg-white p-3 rounded-xl border border-gray-100 outline-none focus:border-brand-purple focus:ring-2 ring-brand-purple/10 appearance-none text-brand-dark cursor-pointer">
                <option value="" disabled>In</option>
                {Array.from({length: 12}, (_, i) => i).map(inch => <option key={inch} value={inch}>{inch}"</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">Date of Birth</label>
            {data.age && <span className={`font-bold text-sm px-2 py-0.5 rounded-md ${parseInt(data.age) >= 18 ? 'text-brand-purple bg-brand-purple/10' : 'text-red-500 bg-red-100'}`}>{data.age} yrs {parseInt(data.age) < 18 ? '(Under 18)' : ''}</span>}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select value={data.dobDay} onChange={e => handleDobPartChange('dobDay', e.target.value)} className="w-full h-[62px] text-lg font-bold bg-white p-3 rounded-xl border border-gray-100 outline-none focus:border-brand-purple focus:ring-2 ring-brand-purple/10 appearance-none text-brand-dark">
                <option value="" disabled>DD</option>
                {Array.from({length: 31}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray" size={16} />
            </div>
            <div className="relative flex-1">
              <select value={data.dobMonth} onChange={e => handleDobPartChange('dobMonth', e.target.value)} className="w-full h-[62px] text-lg font-bold bg-white p-3 rounded-xl border border-gray-100 outline-none focus:border-brand-purple focus:ring-2 ring-brand-purple/10 appearance-none text-brand-dark">
                <option value="" disabled>MM</option>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray" size={16} />
            </div>
            <div className="relative flex-[1.2]">
              <select value={data.dobYear} onChange={e => handleDobPartChange('dobYear', e.target.value)} className="w-full h-[62px] text-lg font-bold bg-white p-3 rounded-xl border border-gray-100 outline-none focus:border-brand-purple focus:ring-2 ring-brand-purple/10 appearance-none text-brand-dark">
                <option value="" disabled>YYYY</option>
                {Array.from({length: 80}, (_, i) => {
                  const y = new Date().getFullYear() - 15 - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray" size={16} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">Gender</label>
          <div className="relative">
            <select 
              value={data.gender} onChange={e => updateData('gender', e.target.value)}
              className="w-full h-[62px] text-xl font-bold bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm outline-none focus:border-brand-purple focus:ring-4 ring-brand-purple/10 appearance-none text-brand-dark cursor-pointer transition-all"
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-gray pointer-events-none" size={20} />
          </div>
        </div>
      </div>

      <LocationSelector data={data} updateData={updateData} />
    </motion.div>
  );

  const HabitSelector = ({ title, field, options, icon }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-brand-gray uppercase tracking-wider flex items-center gap-2">{icon} {title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isActive = data.habits[field] === opt;
          return (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setData(prev => ({...prev, habits: {...prev.habits, [field]: opt}}))}
              key={opt}
              className={`px-4 py-2.5 rounded-full font-bold text-sm transition-all border-2 flex items-center gap-2 ${isActive ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20' : 'bg-white text-brand-dark border-gray-100 shadow-sm hover:border-brand-purple/30'}`}
            >
              {opt} {isActive && <Check size={14}/>}
            </motion.button>
          )
        })}
      </div>
    </div>
  );

  const Step2 = () => (
    <motion.div key="step2" {...slideVars} className="space-y-8 pb-10">
      <div>
        <h2 className="text-4xl font-bold text-brand-dark mb-2">Habits & Lifestyle</h2>
        <p className="text-brand-gray text-lg">Helps us match you better.</p>
      </div>
      
      <div className="space-y-6">
        <HabitSelector title="Smoking Habits" field="smoking" options={["Non-smoker", "Occasionally", "Social smoker", "Regular smoker"]} icon="🚬" />
        <HabitSelector title="Drinking Habits" field="drinking" options={["Don't drink", "Occasionally", "Social drinker", "Regular drinker"]} icon="🍷" />
        <HabitSelector title="Activity Level" field="activity" options={["Very active", "Active", "Balanced", "Chill"]} icon="🏃" />
        <HabitSelector title="Sleep Style" field="sleep" options={["Early bird 🌅", "Night owl 🌙", "Flexible"]} icon="🌙" />
        <HabitSelector title="Social Style" field="social" options={["Introvert", "Extrovert", "Ambivert", "Pervert"]} icon="🗣️" />
      </div>
    </motion.div>
  );

  const Step3 = () => (
    <motion.div key="step3" {...slideVars} className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-4xl font-bold text-brand-dark mb-2">Upload Photos</h2>
          <p className="text-brand-gray text-lg">Profiles with photos get <span className="text-brand-purple font-bold">5x more matches</span>.</p>
        </div>
        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest hidden sm:block">Optional</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-20">
        {data.photos.map((photo, i) => (
          <div key={i} className={`aspect-[3/4] rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden group transition-all shadow-sm ${photo ? 'border-brand-purple/20' : (i === 0 ? 'border-brand-purple border-dashed bg-brand-purple/5' : 'border-gray-200 border-dashed bg-gray-50 hover:bg-gray-100')}`}>
            {photo ? (
               <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="w-full h-full relative">
                 <img src={photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`Upload ${i}`} />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                   <button onClick={(e) => { e.stopPropagation(); removePhoto(i); }} className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-transform active:scale-95 shadow-xl relative z-20">
                     <span className="font-bold">✕</span>
                   </button>
                   <span className="text-white text-xs font-bold uppercase tracking-wider">Remove</span>
                 </div>
                 {i === 0 && (
                   <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold text-center py-2 uppercase tracking-wide pointer-events-none">
                     👉 Main Profile Photo
                   </div>
                 )}
               </motion.div>
            ) : (
               <>
                 <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-2xl pb-1 pointer-events-none relative z-10">
                   {i === 0 ? <span className="text-brand-purple">✨</span> : <span className="text-brand-gray">+</span>}
                 </div>
                 <span className={`font-bold text-[11px] sm:text-xs uppercase tracking-wider text-center px-1 pointer-events-none relative z-10 ${i === 0 ? 'text-brand-purple' : 'text-brand-gray'}`}>
                   {i === 0 ? 'Add Main Photo' : 'Add Photo'}
                 </span>
               </>
            )}
            {!photo && <input type="file" accept="image/jpeg, image/png, image/webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" onChange={(e) => handlePhotoUpload(e, i)} />}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const Step4 = () => {
    const filteredCategories = INTEREST_CATEGORIES.map(cat => ({
      title: cat.title,
      items: cat.items.filter(item => item.toLowerCase().includes(interestQuery.toLowerCase()))
    })).filter(cat => cat.items.length > 0);

    return (
      <motion.div key="step4" {...slideVars} className="space-y-8 pb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-4xl font-bold text-brand-dark mb-2">Select Interests</h2>
            <p className="text-brand-gray text-lg">Pick 5 to 9 things you love.</p>
          </div>
          <div className="font-bold text-brand-blue">{data.interests.length}/9</div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input 
            type="text" 
            placeholder="Search interests... (e.g. Marvel)" 
            value={interestQuery}
            onChange={e => setInterestQuery(e.target.value)}
            className="w-full text-lg font-bold bg-white p-5 pl-14 rounded-full border border-gray-100 shadow-sm outline-none focus:border-brand-purple focus:ring-4 ring-brand-purple/10 transition-all text-brand-dark"
          />
        </div>

        {/* Popular Section */}
        {!interestQuery && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <h3 className="text-sm font-bold text-brand-gray uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-pink" /> Trending Vibes
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_INTERESTS.map(item => {
                const active = data.interests.includes(item);
                return (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    key={item} onClick={() => toggleInterest(item)}
                    className={`px-4 py-2.5 rounded-full font-bold transition-all border-2 flex items-center gap-2 ${active ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20' : 'bg-white text-brand-dark border-gray-100 shadow-sm'}`}
                  >
                    {item} {active && <Check size={14}/>}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        <div className="space-y-8">
          <AnimatePresence>
            {filteredCategories.map(cat => {
              const showAll = expandedCats[cat.title] || interestQuery.length > 0;
              const displayItems = showAll ? cat.items : cat.items.slice(0, 5);
              const hasMore = cat.items.length > 5;

              return (
                <motion.div key={cat.title} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-3">
                  <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider">{cat.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayItems.map(item => {
                      const active = data.interests.includes(item);
                      return (
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          key={item} onClick={() => toggleInterest(item)}
                          className={`px-4 py-2.5 rounded-full font-bold transition-all border-2 flex items-center gap-2 text-sm ${active ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20' : 'bg-white text-brand-dark border-gray-100 shadow-sm'}`}
                        >
                          {item} {active && <Check size={14}/>}
                        </motion.button>
                      )
                    })}
                    {!showAll && hasMore && (
                       <motion.button 
                         onClick={() => setExpandedCats(prev => ({...prev, [cat.title]: true}))}
                         className="px-4 py-2.5 rounded-full font-bold text-brand-blue border-2 border-brand-blue/20 hover:bg-brand-blue/5 transition-all flex items-center gap-1 text-sm"
                       >
                         +{cat.items.length - 5} <ChevronDown size={14} />
                       </motion.button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const Step5 = () => {
    return (
      <motion.div key="step5" {...slideVars} className="space-y-6 pb-20">
        {promptStage === 'select' ? (
          <>
            <div className="flex justify-between items-end mb-4">
               <div>
                 <h2 className="text-4xl font-bold text-brand-dark mb-2">Write your story.</h2>
                 <p className="text-brand-gray text-lg">Select exactly 3 prompts.</p>
               </div>
               <div className="font-bold text-brand-blue">{data.prompts.length}/3</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {PROMPTS.map(q => {
                 const active = data.prompts.some(p => p.question === q);
                 return (
                   <motion.div 
                     whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                     onClick={() => togglePrompt(q)} key={q}
                     className={`cursor-pointer p-5 rounded-[1.5rem] border-2 transition-all ${active ? 'bg-brand-dark border-brand-dark shadow-xl text-white' : 'bg-white border-gray-100 shadow-sm text-brand-dark hover:border-brand-purple/30'}`}
                   >
                     <div className="flex items-start gap-3">
                       <Sparkles size={18} className={`shrink-0 mt-0.5 ${active ? 'text-brand-pink' : 'text-brand-gray'}`}/>
                       <span className="font-bold text-lg leading-tight">{q}</span>
                     </div>
                   </motion.div>
                 )
               })}
            </div>
          </>
        ) : (
          <AnimatePresence>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-6">
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <h2 className="text-4xl font-bold text-brand-dark mb-2">Your answers.</h2>
                   <p className="text-brand-gray text-lg">Show them what makes you, you.</p>
                 </div>
                 <button onClick={() => setPromptStage('select')} className="text-sm font-bold text-brand-blue px-4 py-2 bg-brand-blue/10 rounded-full hover:bg-brand-blue/20 transition-all">Change Prompts</button>
               </div>

               {data.prompts.map((p, i) => (
                 <div key={i} className="glass p-6 rounded-[2rem] border border-white">
                   <div className="text-brand-purple font-bold mb-3 flex items-center gap-2">
                     <Sparkles size={16} /> {p.question}
                   </div>
                   <textarea 
                     rows={3} maxLength={150}
                     placeholder="Type your answer..."
                     value={p.answer} onChange={(e) => updatePrompt(i, e.target.value)}
                     className="w-full bg-transparent text-xl text-brand-dark font-medium outline-none resize-none placeholder:text-brand-gray/50"
                   />
                   <div className="text-right text-xs font-bold text-brand-gray mt-2">{p.answer.length}/150</div>
                 </div>
               ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  const Step6 = () => (
    <motion.div key="step6" {...slideVars} className="space-y-8 pb-10">
      <div>
        <h2 className="text-4xl font-bold text-brand-dark mb-2">What are you looking for?</h2>
        <p className="text-brand-gray text-lg">Choose what kind of vibe you're looking for.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-end mb-2">
          <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">Vibe Categories</label>
          <div className="font-bold text-brand-blue text-sm">{data.vibes.length}/3 selected</div>
        </div>
        
        <div className="space-y-6 pb-24">
          {VIBE_CATEGORIES.map(cat => (
            <div key={cat.title} className="space-y-3">
               <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider">{cat.title}</h3>
               <div className="flex flex-wrap gap-2">
                 {cat.items.map(v => {
                   const active = data.vibes.includes(v);
                   return (
                     <motion.button 
                       key={v}
                       whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                       onClick={() => toggleVibe(v)}
                       className={`px-4 py-2.5 rounded-full font-bold transition-all border-2 flex items-center gap-2 text-sm ${active ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20' : 'bg-white text-brand-dark border-gray-100 shadow-sm hover:border-brand-purple/30'}`}
                     >
                       {v} {active && <Check size={14} />}
                     </motion.button>
                   )
                 })}
               </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const Step7 = () => (
    <motion.div key="step7" {...slideVars} className="space-y-8 pb-10">
      <div>
        <h2 className="text-4xl font-bold text-brand-dark mb-2">Companion Mode</h2>
        <p className="text-brand-gray text-lg">Choose how you'd like to spend time with others.</p>
        <p className="text-brand-blue text-sm font-bold mt-2 bg-brand-blue/10 inline-block px-3 py-1 rounded-full">Note: This platform is for safe, social experiences only.</p>
      </div>
      
      <div className="glass p-6 rounded-[2rem] flex items-center justify-between border border-white">
        <div>
          <h3 className="text-xl font-bold text-brand-dark mb-1">Become a Companion</h3>
          <p className="text-sm text-brand-gray">Allow others to book your time</p>
        </div>
        <button onClick={() => updateData('isCompanion', !data.isCompanion)} className={`w-14 h-8 rounded-full p-1 transition-colors ${data.isCompanion ? 'bg-green-500' : 'bg-gray-200'}`}>
          <motion.div animate={{ x: data.isCompanion ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" />
        </button>
      </div>

      <AnimatePresence>
        {data.isCompanion && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="space-y-6 pt-4 overflow-hidden">
            <div className="space-y-4">
              <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">Hourly Rate (₹)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-brand-dark">₹</span>
                <input type="number" value={data.hourlyRate} onChange={e => updateData('hourlyRate', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter your rate in ₹"
                  className="w-full text-2xl font-bold bg-white py-5 pl-12 pr-5 rounded-[1.5rem] border border-gray-100 shadow-sm outline-none text-brand-dark focus:border-brand-purple focus:ring-4 ring-brand-purple/10 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-brand-gray font-semibold text-sm uppercase tracking-wider">Available Services</label>
              <div className="flex flex-wrap gap-2">
                {COMPANION_SERVICES.map(s => {
                  const act = data.services.includes(s);
                  return (
                    <motion.button 
                      key={s} 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => updateData('services', act ? data.services.filter(x=>x!==s) : [...data.services, s])}
                      className={`px-4 py-2.5 rounded-full font-bold border-2 transition-all text-sm flex items-center gap-2 ${act ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20' : 'bg-white border-gray-100 text-brand-dark hover:border-brand-purple/30 shadow-sm'}`}
                    >
                      {s} {act && <Check size={14} />}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const Step8 = () => {
    const firstName = data.name.trim() ? data.name.split(' ')[0] : 'There';
    
    return (
      <motion.div key="step8" {...slideVars} className="flex flex-col items-center justify-center text-center pt-24 pb-20 space-y-8">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-40 h-40 rounded-full mx-auto relative mb-4 shadow-2xl"
        >
           <motion.img 
             initial={{ y: 20 }} animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             src={data.photos[0] || "/images/companion_1.png"} 
             className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg" 
           />
           <motion.div 
             initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }}
             className="absolute -bottom-2 -right-2 bg-green-500 w-12 h-12 border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg"
           >
             <Check size={24} strokeWidth={3}/>
           </motion.div>
        </motion.div>
        
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.4, duration: 0.5 }}
           className="space-y-4 px-4"
        >
          <h2 className="text-5xl font-extrabold text-brand-dark tracking-tight">Hey, {firstName}! 👋</h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="text-brand-gray text-2xl font-medium"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 1: return Step1();
      case 2: return Step2();
      case 3: return Step3();
      case 4: return Step4();
      case 5: return Step5();
      case 6: return Step6();
      case 7: return Step7();
      case 8: return Step8();
      default: return Step1();
    }
  };

  return (
    <div className="min-h-screen bg-brand-gradient/5 pt-20 pb-40 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl">
        
        {/* Progress Header */}
        <div className="flex items-center gap-4 mb-12">
          {step > 1 && (
            <button onClick={handleBack} className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors text-brand-dark">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="flex-1">
            <div className="flex justify-between text-sm font-bold text-brand-gray mb-2 uppercase tracking-wide">
              <span>Step {step}</span>
              <span>{totalSteps} Steps</span>
            </div>
            <div className="h-3 bg-brand-gray/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                className="h-full bg-brand-gradient"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="min-h-[450px]">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Max Selection Toast */}
        <AnimatePresence>
          {showMaxToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-24 left-1/2 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-xl z-[60] flex items-center gap-2 whitespace-nowrap"
            >
              You can only select up to 9 interests!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="fixed bottom-6 left-0 right-0 p-4 flex justify-center z-40 pointer-events-none">
          <div className="w-full max-w-xl flex justify-center sm:justify-between items-center px-2 pointer-events-auto">
             
             {/* Sub-text hint if on step 4 (Interests) or Step 5 (Prompts) */}
             <div className="text-brand-gray font-medium hidden sm:block bg-white/50 backdrop-blur-md px-4 py-2 rounded-full">
               {step === 1 && (!data.age || parseInt(data.age) < 18) && <span className="text-red-500 font-bold">You must be 18+ to use this app.</span>}
               {step === 4 && data.interests.length < 5 && <span>Select {5 - data.interests.length} more...</span>}
               {step === 4 && data.interests.length >= 5 && <span className="text-brand-dark font-bold flex items-center gap-1"><Check size={18} className="text-green-500" /> Looking good!</span>}
               {step === 5 && promptStage === 'select' && data.prompts.length < 3 && <span>Select {3 - data.prompts.length} more prompts...</span>}
               {step === 5 && promptStage === 'answer' && !isStep5Valid && <span className="text-red-500 font-bold">Please fill out all prompts (Min 10 chars)</span>}
               {step === 6 && data.vibes.length === 0 && <span className="text-red-500 font-bold">Please select at least 1 vibe!</span>}
               {step === 7 && !isStep7Valid && <span className="text-red-500 font-bold">Enter a valid rate and pick 1+ service!</span>}
             </div>

             {step === 8 ? (
               <button onClick={handleFinish} className="w-full sm:w-auto px-12 py-5 bg-black text-white rounded-full font-bold text-xl shadow-2xl hover:-translate-y-1 hover:shadow-brand-purple/50 hover:shadow-[0_20px_40px_-10px] transition-all flex items-center justify-center gap-2">
                 Start Exploring <Sparkles size={20} />
               </button>
             ) : (
               <button 
                 disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 4 && !isStep4Valid) || (step === 5 && promptStage === 'select' && data.prompts.length < 3) || (step === 5 && promptStage === 'answer' && !isStep5Valid) || (step === 6 && data.vibes.length === 0) || (step === 7 && !isStep7Valid)}
                 onClick={handleNext} 
                 className={`w-full sm:w-auto px-10 py-4 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-4 transition-all ${
                   (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 4 && !isStep4Valid) || (step === 5 && promptStage === 'select' && data.prompts.length < 3) || (step === 5 && promptStage === 'answer' && !isStep5Valid) || (step === 6 && data.vibes.length === 0) || (step === 7 && !isStep7Valid)
                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95' 
                     : 'bg-black text-white shadow-[0_10px_40px_-5px_rgba(0,0,0,0.4)] hover:shadow-2xl hover:-translate-y-2'
                 }`}
               >
                 <span>Let's Go</span> <span className="bg-white/20 p-2 rounded-full"><ChevronRight size={20} /></span>
               </button>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
