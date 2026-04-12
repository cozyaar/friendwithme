'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, UserX, Flag, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function Toggle({ value, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-50 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-brand-dark">{label}</p>
        {description && <p className="text-xs text-brand-gray mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${value ? 'bg-brand-purple' : 'bg-gray-200'}`}
      >
        <motion.span
          animate={{ x: value ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-b-0">
      <p className="text-sm font-bold text-brand-dark mb-2.5">{label}</p>
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-sm font-semibold text-left ${
              value === opt.value
                ? 'bg-brand-purple/10 border-brand-purple text-brand-purple'
                : 'bg-gray-50 border-gray-100 text-brand-dark hover:border-gray-200'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              value === opt.value ? 'border-brand-purple' : 'border-gray-300'
            }`}>
              {value === opt.value && <div className="w-2 h-2 rounded-full bg-brand-purple" />}
            </div>
            <div>
              <p>{opt.label}</p>
              {opt.desc && <p className="text-[11px] font-normal text-brand-gray">{opt.desc}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Toast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 z-50"
    >
      <Check size={16} /> {message}
    </motion.div>
  );
}

// Mock blocked users
const BLOCKED_USERS = [
  { id: 'b1', name: 'Rahul M.', img: '/images/companion_2.png' },
];

export default function PrivacySettings() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const [privacy, setPrivacy] = useState({ ...profile.privacy });
  const [blocked, setBlocked] = useState(BLOCKED_USERS);
  const [saved, setSaved] = useState(false);
  const [unblockId, setUnblockId] = useState(null);

  const set = (key) => (val) => setPrivacy(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    updateProfile({ privacy });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const unblock = (id) => {
    setBlocked(prev => prev.filter(u => u.id !== id));
    setUnblockId(null);
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
            <h1 className="text-xl font-extrabold text-brand-dark">Privacy & Safety</h1>
            <p className="text-xs text-brand-gray">Control your visibility and safety options</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Main privacy toggles */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl px-5 border border-gray-100 shadow-sm">
            <Toggle
              value={privacy.onlineStatus}
              onChange={set('onlineStatus')}
              label="Show Online Status"
              description="Others can see when you're active"
            />
            <RadioGroup
              label="Profile Visibility"
              value={privacy.profileVisibility}
              onChange={set('profileVisibility')}
              options={[
                { value: 'public', label: 'Public', desc: 'Visible to everyone on the platform' },
                { value: 'limited', label: 'Limited', desc: 'Only visible to your connections' },
              ]}
            />
            <RadioGroup
              label="Who can message you"
              value={privacy.whoCanMessage}
              onChange={set('whoCanMessage')}
              options={[
                { value: 'everyone', label: 'Everyone', desc: 'Anyone on the platform' },
                { value: 'connections', label: 'Only connections', desc: 'People you\'ve connected with' },
              ]}
            />
          </motion.div>

          {/* Blocked users */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-gray">Blocked Users</p>
              <span className="text-xs font-bold text-brand-purple bg-purple-50 px-2 py-0.5 rounded-full">{blocked.length}</span>
            </div>
            {blocked.length === 0 ? (
              <p className="text-sm text-brand-gray text-center py-3">No blocked users 🎉</p>
            ) : (
              <div className="space-y-2">
                {blocked.map(user => (
                  <div key={user.id} className="flex items-center gap-3">
                    <img src={user.img} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                    <p className="text-sm font-bold text-brand-dark flex-1">{user.name}</p>
                    <button
                      onClick={() => setUnblockId(user.id)}
                      className="text-xs font-bold text-brand-purple border border-brand-purple/20 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Report */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
              <Flag size={16} className="text-orange-500" />
              <span className="text-sm font-bold text-brand-dark flex-1 text-left">Report a Problem</span>
            </button>
          </motion.div>

          {/* Save */}
          <motion.button
            whileTap={{ scale: 0.97 }} onClick={handleSave}
            className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl hover:opacity-90 transition-opacity text-sm"
          >
            Save Privacy Settings
          </motion.button>
        </div>

        {/* Unblock confirm modal */}
        <AnimatePresence>
          {unblockId && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
              onClick={() => setUnblockId(null)}
            >
              <motion.div
                initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />
                <p className="font-extrabold text-brand-dark text-center mb-1">Unblock this user?</p>
                <p className="text-xs text-brand-gray text-center mb-5">They will be able to see your profile and message you again.</p>
                <div className="flex gap-3">
                  <button onClick={() => setUnblockId(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-sm">Cancel</button>
                  <button onClick={() => unblock(unblockId)} className="flex-1 py-3 rounded-2xl bg-brand-dark text-white font-bold text-sm">Unblock</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{saved && <Toast message="Privacy settings saved ✅" />}</AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
