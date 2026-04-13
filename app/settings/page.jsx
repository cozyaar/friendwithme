'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, LogOut, ChevronRight, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/context/ProfileContext';

// Reusable SettingsCard
function SettingsCard({ icon: Icon, iconColor = 'text-brand-blue', iconBg = 'bg-brand-light', label, subtitle, href, onClick }) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.01, boxShadow: '0 8px 24px -6px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.99 }}
      className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 cursor-pointer group transition-shadow"
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-brand-dark text-sm">{label}</p>
        {subtitle && <p className="text-xs text-brand-gray mt-0.5">{subtitle}</p>}
      </div>
      <motion.div
        className="text-brand-gray group-hover:text-brand-purple transition-colors"
        whileHover={{ x: 2 }}
      >
        <ChevronRight size={18} />
      </motion.div>
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// Logout confirmation modal
function LogoutModal({ onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
        onClick={onCancel}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-7 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 md:hidden" />
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LogOut size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold text-brand-dark">Log out?</h3>
            <p className="text-sm text-brand-gray mt-1">You'll need to sign in again to access your account.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 font-bold text-brand-dark hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors text-sm"
            >
              Yes, Log Out
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile, logout } = useProfile();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogout(false);
    router.push('/login');
  };

  return (
    <div className="max-w-lg mx-auto pt-2 pb-28">
      <motion.h1
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold text-brand-dark mb-6"
      >
        Settings
      </motion.h1>

      <div className="space-y-3">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Link href="/profile/me">
            <motion.div
              whileHover={{ scale: 1.01, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.10)' }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer group"
            >
              <div className="relative shrink-0">
                {profile.avatar ? (
                  <Image unoptimized width={100} height={100}  src={profile.avatar} alt={profile.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-extrabold text-2xl">
                    {profile.name?.[0] || 'U'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-brand-dark leading-tight">{profile.name}</h3>
                <p className="text-xs text-brand-gray mt-0.5">View and edit profile</p>
                <p className="text-[11px] text-brand-purple font-semibold mt-1">{profile.badge}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-purple bg-purple-50 px-2.5 py-1 rounded-full border border-brand-purple/20">Edit</span>
                <motion.div className="text-brand-gray group-hover:text-brand-purple transition-colors" whileHover={{ x: 2 }}>
                  <ChevronRight size={18} />
                </motion.div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Account + Notifications + Privacy */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray px-1 pt-2">Account</p>
          <SettingsCard icon={User} label="Account Info" subtitle="Name, phone, email, date of birth" href="/settings/account" iconColor="text-blue-500" iconBg="bg-blue-50" />
          <SettingsCard icon={Bell} label="Notifications" subtitle="Messages, requests, events" href="/settings/notifications" iconColor="text-orange-500" iconBg="bg-orange-50" />
          <SettingsCard icon={Shield} label="Privacy & Safety" subtitle="Visibility, blocked users" href="/settings/privacy" iconColor="text-green-600" iconBg="bg-green-50" />
        </motion.div>

        {/* App version */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-center pt-2">
          <p className="text-[11px] text-brand-gray">Friend With Me · v1.0.0 · India 🇮🇳</p>
        </motion.div>

        {/* Logout button */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogout(true)}
            className="w-full py-4 bg-white rounded-2xl border border-red-100 text-red-500 font-bold flex justify-center items-center gap-2 hover:bg-red-50 transition-colors shadow-sm text-sm"
          >
            <LogOut size={17} /> Log Out
          </motion.button>
        </motion.div>
      </div>

      {/* Logout modal */}
      {showLogout && <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={handleLogout} />}
    </div>
  );
}
