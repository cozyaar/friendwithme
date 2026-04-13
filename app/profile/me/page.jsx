'use client';
import { motion } from 'framer-motion';
import {
  MapPin, Star, ShieldCheck, Edit3, Camera, Music,
  Coffee, Heart, Sparkles, Users, Wallet, ChevronRight,
  Zap, Award
} from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '@/context/ProfileContext';

// Profile strength indicator
function ProfileStrength({ value }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-400';
  const label = value >= 80 ? 'Strong 💪' : value >= 50 ? 'Getting there 🔥' : 'Needs work 🛠️';
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-brand-gray uppercase tracking-wider">Profile Strength</p>
        <span className="text-xs font-bold text-brand-dark">{value}% · {label}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      {value < 100 && (
        <Link href="/profile/me/edit" className="text-xs text-brand-purple font-semibold mt-2 block hover:underline">
          + Complete your profile →
        </Link>
      )}
    </div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function MyProfile() {
  const { profile } = useProfile();

  return (
    <div className="max-w-2xl mx-auto pb-28">

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden mb-5 shadow-lg"
      >
        {/* Background gradient */}
        <div className="h-40 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-400" />

        {/* Avatar */}
        <div className="absolute left-5 bottom-0 translate-y-1/2">
          <div className="relative">
            <img src={profile.profilePic || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}`} alt={profile.name || "User"}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-white" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* Edit button */}
        <Link href="/profile/me/edit"
          className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-colors">
          <Edit3 size={13} /> Edit Profile
        </Link>
      </motion.div>

      {/* Name & details */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="px-1 pt-14 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-brand-dark">{profile.name}, {profile.age}</h1>
              {profile.verified && <ShieldCheck size={18} className="text-blue-500" />}
            </div>
            <p className="flex items-center gap-1.5 text-brand-gray text-sm mt-0.5">
              <MapPin size={13} /> {profile.city}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="flex items-center gap-1 text-sm font-bold text-brand-dark bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full">
              <Star size={12} className="fill-yellow-400 text-yellow-400" /> {profile.rating}
            </span>
            <span className="text-xs font-bold text-brand-purple bg-purple-50 border border-brand-purple/20 px-2.5 py-1 rounded-full">
              {profile.badge}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">

        {/* Profile Strength */}
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
          <ProfileStrength value={profile.profileStrength} />
        </motion.div>

        {/* Bio */}
        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible"
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-2">About me</p>
          <p className="text-brand-dark text-sm leading-relaxed">{profile.bio || "No bio added yet"}</p>
        </motion.div>

        {/* Quick stats */}
        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible"
          className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: 'Connections', value: '24' },
            { icon: Award, label: 'Reviews', value: profile.reviews },
            { icon: Zap, label: 'Response', value: '< 1h' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm text-center">
              <Icon size={18} className="text-brand-purple mx-auto mb-1.5" />
              <p className="text-lg font-extrabold text-brand-dark">{value}</p>
              <p className="text-[10px] text-brand-gray font-semibold uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Interests */}
        <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible"
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">Interests</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(i => (
              <span key={i} className="bg-brand-dark text-white text-xs font-bold px-3 py-1.5 rounded-full">{i}</span>
            ))}
          </div>
        </motion.div>

        {/* Vibes & Companion mode removed for now per spec, or kept conditionally */}
        {profile.vibes && profile.vibes.length > 0 && (
          <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible"
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3">My Vibe</p>
            <div className="flex flex-wrap gap-2">
              {profile.vibes.map(v => (
                <span key={v} className="bg-purple-50 text-brand-purple border border-brand-purple/20 text-xs font-bold px-3 py-1.5 rounded-full">{v}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lifestyle array */}
        <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3 px-1">Lifestyle</p>
          <div className="flex flex-wrap gap-2">
            {profile.lifestyle && profile.lifestyle.length > 0 ? profile.lifestyle.map((item, idx) => (
              <span key={idx} className="bg-white rounded-2xl px-4 py-2 border border-gray-100 shadow-sm text-brand-dark text-sm font-bold">
                {item}
              </span>
            )) : <span className="text-brand-gray text-sm italic">No lifestyle preferences added yet</span>}
          </div>
        </motion.div>

        {/* Companion mode */}
        {profile.companionMode && (
          <motion.div custom={7} variants={sectionVariants} initial="hidden" animate="visible"
            className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-4 border border-brand-purple/20 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-purple">Companion Mode 🌟</p>
              <span className="text-base font-extrabold text-brand-dark">₹{profile.price}/hr</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.services.map(s => (
                <span key={s} className="bg-white text-brand-dark text-xs font-bold px-3 py-1.5 rounded-full border border-brand-purple/20">{s}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Photos grid */}
        {profile.photos && profile.photos.length > 0 && (
          <motion.div custom={8} variants={sectionVariants} initial="hidden" animate="visible">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-3 px-1">Photos</p>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((p, i) => {
                if(!p) return null;
                return (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm bg-gray-100">
                    <img src={p} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                );
              })}
              <Link href="/profile/me/edit"
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-brand-gray hover:border-brand-purple hover:text-brand-purple transition-colors">
                <Camera size={20} />
                <span className="text-[10px] font-bold">Add Photo</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick links */}
        <motion.div custom={9} variants={sectionVariants} initial="hidden" animate="visible"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { icon: Wallet, label: 'Earnings & Payouts', href: '/earn', color: 'text-green-500' },
            { icon: Users, label: 'My Connections', href: '/bookings', color: 'text-blue-500' },
            { icon: Sparkles, label: 'My Events', href: '/events/my-events', color: 'text-orange-500' },
          ].map(({ icon: Icon, label, href, color }) => (
            <Link key={label} href={href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
              <Icon size={17} className={color} />
              <span className="text-sm font-semibold text-brand-dark flex-1">{label}</span>
              <ChevronRight size={15} className="text-brand-gray" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
