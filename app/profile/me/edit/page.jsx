'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Plus, X, Camera, Toggle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';

const INTEREST_OPTIONS = ['Travel 🌍', 'Food 🍜', 'Music 🎵', 'Cricket 🏏', 'Photography 📷', 'Tech 💻', 'Art 🎨', 'Hiking 🥾', 'Coffee ☕', 'Movies 🎬', 'Books 📚', 'Gaming 🎮', 'Dance 💃', 'Yoga 🧘', 'Cooking 🍳'];
const VIBE_OPTIONS = ['Chill 😌', 'Social 🎉', 'Adventurous 🏕️', 'Creative 🎨', 'Foodie 🍜', 'Sporty 💪', 'Bookworm 📚', 'Night Owl 🌙', 'Early Bird 🌅', 'Homebody 🏠'];

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-brand-gray">{label}</label>
      {children}
    </div>
  );
}

function ChipSelector({ options, selected, onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(o => o !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
            selected.includes(opt)
              ? 'bg-brand-dark text-white border-brand-dark'
              : 'bg-white text-brand-gray border-gray-200 hover:border-brand-purple hover:text-brand-purple'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function EditProfile() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setLifestyle = (key, val) => setForm(prev => ({ ...prev, lifestyle: { ...prev.lifestyle, [key]: val } }));

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push('/profile/me');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-brand-dark hover:bg-gray-50">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-brand-dark">Edit Profile</h1>
          <p className="text-xs text-brand-gray">Make it 100% you ✨</p>
        </div>
      </div>

      <div className="space-y-4">

        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-4">Profile Photo</p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image unoptimized width={100} height={100}  src={form.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"  />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-md">
                <Camera size={13} />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-brand-dark mb-0.5">Change photo</p>
              <p className="text-xs text-brand-gray">JPG, PNG up to 5MB</p>
            </div>
          </div>
        </motion.div>

        {/* Basic info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray">Basic Info</p>

          <FieldRow label="Name">
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark bg-gray-50 focus:outline-none focus:border-brand-purple transition-colors"
              value={form.name} onChange={e => set('name', e.target.value)}
            />
          </FieldRow>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Age">
              <input
                type="number" min={18} max={60}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark bg-gray-50 focus:outline-none focus:border-brand-purple transition-colors"
                value={form.age} onChange={e => set('age', Number(e.target.value))}
              />
            </FieldRow>
            <FieldRow label="City">
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark bg-gray-50 focus:outline-none focus:border-brand-purple transition-colors"
                value={form.city} onChange={e => set('city', e.target.value)}
              />
            </FieldRow>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <FieldRow label="Bio">
            <textarea
              rows={3}
              placeholder="Tell people who you are, what you love, what makes you tick..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark bg-gray-50 focus:outline-none focus:border-brand-purple transition-colors resize-none"
              value={form.bio || ''} onChange={e => set('bio', e.target.value)}
            />
            <p className="text-[11px] text-brand-gray text-right">{(form.bio || '').length}/200</p>
          </FieldRow>
        </motion.div>

        {/* Interests */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Interests <span className="normal-case text-brand-purple font-semibold">(pick what you love)</span></p>
          <ChipSelector options={INTEREST_OPTIONS} selected={form.interests || []} onChange={val => set('interests', val)} />
        </motion.div>

        {/* Vibes */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Your Vibe <span className="normal-case text-brand-purple font-semibold">(how would friends describe you?)</span></p>
          <ChipSelector options={VIBE_OPTIONS} selected={form.vibes || []} onChange={val => set('vibes', val)} />
        </motion.div>

        {/* Lifestyle */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray">Lifestyle</p>
          {[
            { key: 'music', label: 'Music you love', placeholder: 'e.g. Bollywood, Lo-fi, EDM' },
            { key: 'drink', label: 'Drinks', placeholder: 'e.g. Chai person, Coffee addict' },
            { key: 'lookingFor', label: 'Looking for', placeholder: 'e.g. Genuine hangouts, City exploration' },
            { key: 'personality', label: 'Personality type', placeholder: 'e.g. ENFP · Extrovert' },
          ].map(({ key, label, placeholder }) => (
            <FieldRow key={key} label={label}>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark bg-gray-50 focus:outline-none focus:border-brand-purple transition-colors"
                value={form.lifestyle?.[key] || ''} placeholder={placeholder}
                onChange={e => setLifestyle(key, e.target.value)}
              />
            </FieldRow>
          ))}
        </motion.div>

        {/* Companion mode toggle */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-brand-dark text-sm">Companion Mode 🌟</p>
              <p className="text-xs text-brand-gray mt-0.5">Get discovered and earn from meetups</p>
            </div>
            <button
              type="button"
              onClick={() => set('companionMode', !form.companionMode)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${form.companionMode ? 'bg-brand-purple' : 'bg-gray-200'}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${form.companionMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {form.companionMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-gray-100">
              <FieldRow label="Hourly Rate (₹)">
                <div className="flex items-center gap-2">
                  <span className="text-brand-dark font-bold">₹</span>
                  <input type="number" min={200} max={5000} step={100}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark bg-gray-50 focus:outline-none focus:border-brand-purple transition-colors"
                    value={form.price} onChange={e => set('price', Number(e.target.value))} />
                </div>
              </FieldRow>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className={`w-full max-w-2xl mx-auto block py-4 rounded-2xl font-bold text-base shadow-xl transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-brand-dark text-white hover:opacity-90'
          }`}
        >
          {saved ? '✅ Saved! Redirecting...' : 'Save Changes'}
        </motion.button>
      </div>
    </div>
  );
}
