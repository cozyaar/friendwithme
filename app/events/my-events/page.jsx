'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, MapPin, CalendarDays, Users, X, Clock,
  Image as ImageIcon, Check, PartyPopper, Pencil
} from 'lucide-react';

const ACTIVITY_CHIPS = ['Hangout 😌', 'Food Outing 🍽️', 'Travel ✈️', 'Shopping 🛍️', 'Walk 🚶', 'Exploration 🗺️', 'Movie 🎬', 'Sports ⚽'];
const GENDER_PREFS = ['Anyone', 'Only boys', 'Only girls', 'Custom'];

// Events will be loaded from API — empty until backend is connected


// ─── Shared Create / Edit Modal ─────────────────────────────────
function EventFormModal({ initialData, onClose, onSave, mode = 'create' }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialData ?? {
    title: '', location: '', dateFrom: '', dateTo: '', time: '', description: '',
    activities: [], requirements: '', slots: 4, genderPref: 'Anyone',
    boysCount: 2, girlsCount: 2,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
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
                <label className="flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-brand-purple/50 hover:bg-brand-purple/5 transition-all">
                  <ImageIcon size={28} className="text-gray-400" />
                  <span className="text-sm text-brand-gray font-medium">Click to upload photos</span>
                  <input type="file" accept="image/*" multiple className="hidden" />
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
              onClick={() => { onSave(form); onClose(); }}
              className="flex-1 py-3.5 bg-brand-dark text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <PartyPopper size={18} /> {mode === 'create' ? 'Publish Event' : 'Save Changes'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── My Events page ──────────────────────────────────────────────
export default function MyEvents() {
  const [events, setEvents] = useState([]); // Will load from API
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('my_saved_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error('Failed to parse saved events', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever events change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_saved_events', JSON.stringify(events));
    }
  }, [events, isLoaded]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreated = (form) => {
    setEvents(prev => [{
      id: `e${Date.now()}`, title: form.title, location: form.location,
      date: form.dateFrom, dateTo: form.dateTo, time: form.time, slots: form.slots, joined: 0,
      status: 'Open', activities: form.activities, description: form.description,
      genderPref: form.genderPref, requirements: form.requirements,
      img: '/images/companion_1.png',
    }, ...prev]);
    showToast('Event published! 🎉');
  };

  const handleEdited = (form) => {
    setEvents(prev => prev.map(ev =>
      ev.id === editingEvent.id
        ? { ...ev, ...form, status: ev.joined >= form.slots ? 'Full' : 'Open' }
        : ev
    ));
    setEditingEvent(null);
    showToast('Event updated! ✅');
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
                  <img src={ev.img} alt={ev.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${ev.status === 'Open' ? 'bg-green-500 text-white' : 'bg-gray-700/80 text-white'}`}>
                    {ev.status === 'Open' ? '● Open' : '✕ Full'}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-brand-dark text-base leading-snug mb-2">{ev.title}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-gray mb-3">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {ev.location}</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={11} />
                      {ev.date}{ev.dateTo && ev.dateTo !== ev.date ? ` → ${ev.dateTo}` : ''}
                    </span>
                    <span className="flex items-center gap-1"><Users size={11} /> {ev.joined}/{ev.slots}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ev.activities.slice(0, 3).map(a => (
                      <span key={a} className="bg-gray-100 text-brand-dark px-2.5 py-1 rounded-full text-xs font-bold">{a}</span>
                    ))}
                  </div>

                  {/* Slot bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                    <div className="h-full bg-brand-dark rounded-full" style={{ width: `${(ev.joined / ev.slots) * 100}%` }} />
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
