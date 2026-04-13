'use client';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, ShieldCheck, Heart, MessageCircle, Phone, Mail, Calendar, Camera } from 'lucide-react';

export default function ProfileModal({ profile, isOpen, onClose }) {
  if (!profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4"
          >
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto relative">
              {/* Profile Header Image */}
              <div className="h-64 relative bg-gray-200">
                <Image unoptimized width={100} height={100}  
                  src={profile.avatar || profile.photos?.[0] || "/images/companion_1.png"} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                 />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Close Button */}
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all shadow-lg"
                >
                  <X size={20} />
                </button>

                {/* Name & Age Overlay */}
                <div className="absolute bottom-6 left-8 text-white">
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold">{profile.name || "Unnamed User"}, {profile.age || "??"}</h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80 font-medium">
                    <MapPin size={14} /> {profile.city || "Unknown Location"}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* About Section */}
                <div>
                  <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider mb-2">About</h3>
                  <p className="text-brand-dark leading-relaxed font-medium">
                    {profile.bio || "No bio added yet."}
                  </p>
                </div>

                {/* Interests */}
                {profile.interests?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map(item => (
                        <span key={item} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-bold text-brand-dark">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle */}
                {profile.habits && Object.values(profile.habits).some(Boolean) && (
                  <div>
                    <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider mb-3">Lifestyle</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(profile.habits).filter(Boolean).map((h, i) => (
                        <span key={i} className="px-3 py-1.5 bg-brand-purple/5 border border-brand-purple/10 rounded-lg text-sm font-bold text-brand-purple">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
