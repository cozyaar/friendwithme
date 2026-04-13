'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Reusable animated toggle
function Toggle({ value, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-50 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-brand-dark">{label}</p>
        {description && <p className="text-xs text-brand-gray mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative flex items-center p-0.5 w-12 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${value ? 'bg-brand-purple' : 'bg-gray-200'}`}
      >
        <motion.span
          initial={false}
          animate={{ x: value ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="block w-5 h-5 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}

function Toast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 z-50"
    >
      <Check size={16} /> Notification preferences saved
    </motion.div>
  );
}

export default function NotificationsSettings() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const [notifs, setNotifs] = useState({ ...profile.notifications });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => (val) => setNotifs(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    updateProfile({ notifications: notifs });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TOGGLES = [
    { key: 'messages', label: 'Messages', description: 'Get notified when someone sends you a message' },
    { key: 'requests', label: 'Connection Requests', description: 'Alerts for new connection requests' },
    { key: 'eventInvites', label: 'Event Invites', description: 'Notifications for event invitations' },
    { key: 'promotions', label: 'Promotional Updates', description: 'Tips, offers, and platform news' },
  ];

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
            <h1 className="text-xl font-extrabold text-brand-dark">Notifications</h1>
            <p className="text-xs text-brand-gray">Choose what you want to be notified about</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl px-5 border border-gray-100 shadow-sm mb-4">
          {TOGGLES.map(({ key, label, description }) => (
            <Toggle key={key} value={notifs[key]} onChange={toggle(key)} label={label} description={description} />
          ))}
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }} onClick={handleSave}
          className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl hover:opacity-90 transition-opacity text-sm"
        >
          Save Preferences
        </motion.button>

        <AnimatePresence>{saved && <Toast />}</AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
