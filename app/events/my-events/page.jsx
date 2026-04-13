'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, MapPin, CalendarDays, Users, X, Clock,
  Image as ImageIcon, Check, PartyPopper, Pencil, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db, storage, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc, doc, getDocs, query, orderBy, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const ACTIVITY_CHIPS = ['Hangout 😌', 'Food Outing 🍽️', 'Travel ✈️', 'Shopping 🛍️', 'Walk 🚶', 'Exploration 🗺️', 'Movie 🎬', 'Sports ⚽'];
const GENDER_PREFS = ['Anyone', 'Only boys', 'Only girls', 'Custom'];

// Events will be loaded from API — empty until backend is connected


// ─── Shared Create / Edit Modal ─────────────────────────────────
function EventFormModal({ initialData, onClose, onSave, mode = 'create' }) {
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const [form, setForm] = useState(initialData ?? {
    title: '', location: '', dateFrom: '', dateTo: '', time: '', description: '',
    activities: [], requirements: '', slots: 4, genderPref: 'Anyone',
    boysCount: 2, girlsCount: 2,
  });

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsub();
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files) => {
    if (!files || files.length === 0) {
      console.log("No files to upload.");
      return [];
    }
    
    console.log(`Starting upload for ${files.length} files...`);
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          const timestamp = Date.now();
          const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const fileName = `${timestamp}-${safeName}`;
          const storagePath = `events/${userId}/${fileName}`;
          const storageRef = ref(storage, storagePath);
          
          console.log(`[File ${index}] Uploading to: ${storagePath}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          console.log(`[File ${index}] Upload success:`, url);
          return url;
        } catch (fileErr) {
          console.error(`[File ${index}] Individual upload failed:`, fileErr);
          return null; // Return null for failed individual files
        }
      });
      
      const results = await Promise.all(uploadPromises);
      // Filter out any failed uploads
      return results.filter(url => url !== null);
    } catch (err) {
      console.error("Global upload error:", err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!userId) { 
      alert("Auth error: No User ID found. Please refresh and try again."); 
      console.error("userId is null during submission");
      return; 
    }
    
    setIsPublishing(true);
    console.log("--- SUBMISSION START ---");
    console.log("Form State:", form);
    console.log("Selected Files Count:", selectedFiles.length);

    try {
      // 1. Upload Images
      const uploadedImageUrls = await uploadImages(selectedFiles);
      console.log("Final Uploaded URLs Array:", uploadedImageUrls);
      
      // 2. Prepare Data (Ensuring strict types for Firestore)
      const eventData = {
        title: String(form.title || ""),
        description: String(form.description || ""),
        location: String(form.location || ""),
        startDate: String(form.dateFrom || ""),
        endDate: String(form.dateTo || form.dateFrom || ""),
        time: String(form.time || ""),
        // FIX: Explicitly ensure activities is an array of strings
        activities: Array.isArray(form.activities) ? [...form.activities] : [], 
        requirements: String(form.requirements || ""),
        maxParticipants: Number(form.slots || 1),
        genderPreference: String(form.genderPref || "Anyone"),
        boysCount: form.genderPref === 'Custom' ? Number(form.boysCount) : 0,
        girlsCount: form.genderPref === 'Custom' ? Number(form.girlsCount) : 0,
        createdBy: String(userId),
        participants: [String(userId)], 
        // FIX: Explicitly ensure images is an array of strings
        images: Array.isArray(uploadedImageUrls) ? [...uploadedImageUrls] : [],
        updatedAt: serverTimestamp()
      };

      if (mode === 'create') {
        eventData.createdAt = serverTimestamp();
      }

      console.log("Full Event Data to Save:", eventData);

      // 3. Save to Firestore
      await onSave(eventData);
      console.log("--- SUBMISSION SUCCESS ---");
      onClose();
    } catch (err) {
      console.error("--- SUBMISSION FAILED ---", err);
      alert(`Error publishing event: ${err.message || "Unknown error"}`);
    } finally {
      setIsPublishing(false);
    }
  };
  const toggleActivity = a => setForm(p => ({
    ...p,
    activities: p.activities.includes(a) ? p.activities.filter(x => x !== a) : [...p.activities, a],
  }));

  const canGoNext = form.title.trim() && form.location.trim() && form.dateFrom.trim();

  return (
    // Full-page overlay
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-start justify-center md:pt-24 md:pb-6"
      onClick={onClose}
    >
      {/* Modal — fixed height with internal scroll */}
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full md:max-w-2xl bg-white rounded-t-[2rem] md:rounded-[2rem] flex flex-col"
        style={{ maxHeight: 'calc(100vh - 112px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Sticky header (always visible) ── */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-extrabold text-brand-dark leading-tight">
                {mode === 'create' ? 'Create Event' : 'Edit Event'}
              </h2>
              <p className="text-sm text-brand-gray mt-0.5">Step {step} of 2 — {step === 1 ? 'Event details' : 'Settings'}</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-brand-gray hover:bg-gray-200 transition-colors shrink-0 ml-4">
              <X size={18} />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-brand-dark' : 'bg-gray-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-brand-dark' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {step === 1 && (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-2">Event Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="E.g. Beach Chill, Coorg Trek, Food Crawl…"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-brand-purple text-brand-dark text-base"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-2">Location *</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                  <input value={form.location} onChange={e => set('location', e.target.value)}
                    placeholder="City / Place"
                    className="w-full border border-gray-200 rounded-2xl pl-9 pr-3 py-3 outline-none focus:border-brand-purple text-brand-dark text-sm"
                  />
                </div>
              </div>

              {/* Date range */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-2">Date *</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                    <input type="date" value={form.dateFrom} onChange={e => set('dateFrom', e.target.value)}
                      className="w-full border border-gray-200 rounded-2xl pl-9 pr-3 py-3 outline-none focus:border-brand-purple text-brand-dark text-sm"
                    />
                  </div>
                  <span className="text-brand-gray font-bold text-sm shrink-0">→</span>
                  <div className="flex-1 relative">
                    <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                    <input type="date" value={form.dateTo} onChange={e => set('dateTo', e.target.value)}
                      min={form.dateFrom || undefined}
                      className="w-full border border-gray-200 rounded-2xl pl-9 pr-3 py-3 outline-none focus:border-brand-purple text-brand-dark text-sm"
                    />
                  </div>
                </div>
                {form.dateFrom && form.dateTo && form.dateFrom === form.dateTo && (
                  <p className="text-xs text-brand-gray mt-1.5 pl-1">Single-day event</p>
                )}
                {form.dateFrom && form.dateTo && form.dateFrom !== form.dateTo && (
                  <p className="text-xs text-brand-purple mt-1.5 pl-1 font-semibold">Multi-day event</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-2">Time</label>
                <div className="relative">
                  <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                  <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl pl-9 pr-3 py-3 outline-none focus:border-brand-purple text-brand-dark text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-2">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={4} placeholder="What's the plan? What will you do? Where exactly will you go?"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-brand-purple text-brand-dark text-sm resize-none"
                />
              </div>

              {/* Activities */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Activities</label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_CHIPS.map(a => (
                    <motion.button whileTap={{ scale: 0.92 }} key={a}
                      onClick={() => toggleActivity(a)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${form.activities.includes(a) ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-gray-200 hover:border-brand-dark'}`}
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-2">Requirements (optional)</label>
                <input value={form.requirements} onChange={e => set('requirements', e.target.value)}
                  placeholder="E.g. Prefer non-smokers, chill people only…"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-brand-purple text-brand-dark text-sm"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Slots */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Total Slots</label>
                <div className="flex items-center gap-5">
                  <button onClick={() => set('slots', Math.max(2, form.slots - 1))}
                    className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold hover:bg-gray-200">−</button>
                  <span className="text-4xl font-extrabold text-brand-dark w-12 text-center">{form.slots}</span>
                  <button onClick={() => set('slots', Math.min(20, form.slots + 1))}
                    className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold hover:bg-gray-200">+</button>
                  <span className="text-brand-gray text-sm">people</span>
                </div>
              </div>

              {/* Gender preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Gender Preference</label>
                <div className="flex flex-wrap gap-2">
                  {GENDER_PREFS.map(g => (
                    <motion.button whileTap={{ scale: 0.92 }} key={g}
                      onClick={() => set('genderPref', g)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${form.genderPref === g ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-brand-gray border-gray-200'}`}
                    >
                      {g}
                    </motion.button>
                  ))}
                </div>
                {form.genderPref === 'Custom' && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-brand-gray font-semibold mb-1.5 block">Boys</label>
                      <input type="number" min={0} max={form.slots} value={form.boysCount}
                        onChange={e => set('boysCount', +e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-purple text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-brand-gray font-semibold mb-1.5 block">Girls</label>
                      <input type="number" min={0} max={form.slots} value={form.girlsCount}
                        onChange={e => set('girlsCount', +e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-purple text-sm" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Event Photos (optional)</label>
                
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {previews.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-brand-purple/50 hover:bg-brand-purple/5 transition-all">
                  <ImageIcon size={28} className="text-gray-400" />
                  <span className="text-sm text-brand-gray font-medium">Click to upload photos</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-2">
                <h4 className="font-bold text-brand-dark text-sm mb-3">📋 Event Summary</h4>
                <p className="font-semibold text-brand-dark">{form.title || 'Untitled'}</p>
                <p className="text-sm text-brand-gray flex items-center gap-1.5"><MapPin size={13} /> {form.location || '—'}</p>
                <p className="text-sm text-brand-gray flex items-center gap-1.5"><CalendarDays size={13} />
                  {form.dateFrom || '—'}{form.dateTo && form.dateTo !== form.dateFrom ? ` → ${form.dateTo}` : ''}
                  {form.time && ` at ${form.time}`}
                </p>
                <p className="text-sm text-brand-gray flex items-center gap-1.5"><Users size={13} /> {form.slots} slots · {form.genderPref}</p>
                {form.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.activities.map(a => <span key={a} className="bg-brand-dark text-white px-2.5 py-0.5 rounded-full text-xs font-bold">{a}</span>)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div className="shrink-0 px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3">
          {step === 2 && (
            <button onClick={() => setStep(1)}
              className="flex-1 py-3.5 border border-gray-200 text-brand-gray rounded-2xl font-bold hover:bg-gray-50 transition-colors text-sm">
              ← Back
            </button>
          )}
          {step === 1 ? (
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => setStep(2)} disabled={!canGoNext}
              className="flex-1 py-3.5 bg-brand-dark text-white rounded-2xl font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Next →
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={isPublishing}
              className="flex-1 py-3.5 bg-brand-dark text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {isPublishing ? (
                <><Loader2 size={18} className="animate-spin" /> Publishing...</>
              ) : (
                <><PartyPopper size={18} /> {mode === 'create' ? 'Publish Event' : 'Save Changes'}</>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── My Events page ──────────────────────────────────────────────
export default function MyEvents() {
  const router = useRouter();
  const [events, setEvents] = useState([]); 
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);

  // Sync auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        router.push('/login');
      }
    });
    return () => unsub();
  }, [router]);

  // Load from Firestore
  const fetchMyEvents = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "events"), 
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(list);
    } catch (e) {
      console.error("fetchMyEvents error:", e);
    }
  };

  useEffect(() => {
    if (user) fetchMyEvents();
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreated = async (eventData) => {
    try {
      await addDoc(collection(db, "events"), eventData);
      showToast('Event published! 🎉');
      fetchMyEvents(); // Refresh list
    } catch (e) {
      console.error("handleCreated error:", e);
    }
  };

  const handleEdited = async (eventData) => {
    if (!editingEvent?.id) return;
    try {
      await updateDoc(doc(db, "events", editingEvent.id), eventData);
      setEditingEvent(null);
      showToast('Event updated! ✅');
      fetchMyEvents(); // Refresh list
    } catch (e) {
      console.error("handleEdited error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-28 md:pb-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-brand-dark mb-1">My Events</h1>
            <p className="text-brand-gray font-medium">{events.length} event{events.length !== 1 ? 's' : ''} created</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:opacity-90">
            <Plus size={20} /> Create Event
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8 w-fit">
          <Link href="/events/my-events" className="px-5 py-2 rounded-xl bg-white shadow-sm text-brand-dark font-bold text-sm">My Events</Link>
          <Link href="/events/explore" className="px-5 py-2 rounded-xl text-brand-gray font-bold text-sm hover:text-brand-dark transition-colors">Join Events</Link>
        </div>

        {/* Event cards grid */}
        {events.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-brand-dark mb-2">No events yet</h3>
            <p className="text-brand-gray mb-6">Create your first event and invite people to join!</p>
            <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-brand-dark text-white rounded-2xl font-bold">Create Event</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Cover image */}
                <div className="relative h-40 overflow-hidden">
                  <Image unoptimized width={100} height={100}  
                    src={ev.images?.[0] || '/images/companion_1.png'} 
                    alt={ev.title} className="w-full h-full object-cover"  
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${(ev.participants?.length || 0) < (ev.maxParticipants || 1) ? 'bg-green-500 text-white' : 'bg-gray-700/80 text-white'}`}>
                    {(ev.participants?.length || 0) < (ev.maxParticipants || 1) ? '● Open' : '✕ Full'}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-brand-dark text-base leading-snug mb-2">{ev.title}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-gray mb-3">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {ev.location}</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={11} />
                      {ev.startDate}{ev.endDate && ev.endDate !== ev.startDate ? ` → ${ev.endDate}` : ''}
                    </span>
                    <span className="flex items-center gap-1"><Users size={11} /> {ev.participants?.length || 0}/{ev.maxParticipants}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ev.activities?.slice(0, 3).map(a => (
                      <span key={a} className="bg-gray-100 text-brand-dark px-2.5 py-1 rounded-full text-xs font-bold">{a}</span>
                    ))}
                  </div>

                  {/* Slot bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                    <div className="h-full bg-brand-dark rounded-full" style={{ width: `${((ev.participants?.length || 0) / (ev.maxParticipants || 1)) * 100}%` }} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => setEditingEvent(ev)}
                      className="flex-1 py-2.5 border border-gray-200 text-brand-dark font-bold rounded-xl text-sm hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <Link href={`/events/${ev.id}`}
                      className="flex-1 py-2.5 bg-brand-dark text-white font-bold rounded-xl text-sm text-center hover:opacity-90 transition-opacity flex items-center justify-center">
                      Manage →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <EventFormModal mode="create" onClose={() => setShowCreate(false)} onSave={handleCreated} />
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editingEvent && (
          <EventFormModal mode="edit" initialData={editingEvent} onClose={() => setEditingEvent(null)} onSave={handleEdited} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 z-50 whitespace-nowrap"
          >
            <Check size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
