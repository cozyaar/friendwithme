'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function Toast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 z-50"
    >
      <Check size={16} /> {message}
    </motion.div>
  );
}

function Field({ label, value, onChange, type = 'text', readOnly, placeholder, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-brand-gray">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark focus:outline-none transition-colors ${
          readOnly
            ? 'bg-gray-50 border-gray-100 text-brand-gray cursor-not-allowed'
            : 'bg-white border-gray-200 focus:border-brand-purple'
        }`}
      />
      {hint && <p className="text-[11px] text-brand-gray">{hint}</p>}
    </div>
  );
}

export default function AccountSettings() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    email: profile.email || '',
    dob: profile.dob || '',
    gender: profile.gender || '',
  });
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-lg mx-auto pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50">
            <ChevronLeft size={20} className="text-brand-dark" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-brand-dark">Account Info</h1>
            <p className="text-xs text-brand-gray">Manage your personal details</p>
          </div>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">

            <Field label="Full Name" value={form.name} onChange={set('name')} placeholder="Your full name" />
            <Field
              label="Phone Number"
              value={`+91 ${form.phone}`}
              readOnly
              hint="To change your number, contact support."
            />
            <Field label="Email (optional)" value={form.email} onChange={set('email')} type="email" placeholder="you@example.com" />
            <Field label="Date of Birth" value={form.dob} onChange={set('dob')} type="date" />

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-gray">Gender (optional)</label>
              <select
                value={form.gender}
                onChange={set('gender')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark bg-white focus:outline-none focus:border-brand-purple transition-colors"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="nonbinary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
          </motion.div>

          <div className="flex gap-3">
            <button onClick={() => router.back()}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 font-bold text-brand-dark hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-2xl bg-brand-dark text-white font-bold hover:opacity-90 transition-opacity text-sm"
            >
              Save Changes
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {saved && <Toast message="Profile updated successfully ✅" />}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
