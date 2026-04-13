'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass, CalendarDays, Settings, PartyPopper,
  ChevronDown, BookOpen, User, Edit3, LogOut,
  Star, Wallet, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoggedIn, logout } = useProfile();
  const [showEventsMenu, setShowEventsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // ⚠️ All hooks MUST be called before any early return (Rules of Hooks)
  const isEventsActive = pathname.startsWith('/events');

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [showProfileModal, setShowProfileModal] = useState(false);

  if (pathname === '/login' || pathname === '/onboarding') return null;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/login');
  };

  const USER_MENU = [
    { label: 'My Profile', icon: User, action: () => { setShowProfileModal(true); setShowUserMenu(false); } },
    { label: 'Edit Profile', icon: Edit3, href: '/profile/me/edit' },
    { label: 'Requests', icon: Heart, href: '/bookings' },
    { label: 'My Events', icon: CalendarDays, href: '/events/my-events' },
    { label: 'Earnings', icon: Wallet, href: '/earn' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <>
      <ProfileModal 
        profile={profile} 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />

      {/* Desktop Header */}
      <nav className="fixed top-0 w-full z-50 glass hidden md:block">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold text-brand-dark tracking-tight">
              Friend <span className="text-brand-gradient">With Me</span>
            </span>
            <span className="text-[10px] text-brand-gray font-medium tracking-wide">Find your vibe. Meet your people.</span>
          </Link>

          <div className="flex items-center gap-8 font-medium text-brand-gray">
            <Link href="/explore" className={pathname === '/explore' ? 'text-brand-dark' : 'hover:text-brand-dark'}>Explore</Link>

            {/* Events dropdown */}
            <div className="relative" onMouseEnter={() => setShowEventsMenu(true)} onMouseLeave={() => setShowEventsMenu(false)}>
              <button className={`flex items-center gap-1 transition-colors ${isEventsActive ? 'text-brand-dark' : 'hover:text-brand-dark'}`}>
                Events <ChevronDown size={14} className={`transition-transform ${showEventsMenu ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showEventsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2"
                  >
                    <Link href="/events/my-events" className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-brand-dark hover:bg-gray-50 transition-colors">
                      <CalendarDays size={16} className="text-brand-purple" /> My Events
                    </Link>
                    <Link href="/events/explore" className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-brand-dark hover:bg-gray-50 transition-colors">
                      <PartyPopper size={16} className="text-orange-500" /> Join Events
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/bookings" className={pathname === '/bookings' ? 'text-brand-dark' : 'hover:text-brand-dark'}>Requests</Link>
            <Link href="/earn" className={pathname === '/earn' ? 'text-brand-dark' : 'hover:text-brand-dark'}>Earn</Link>

            {/* Auth area */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
                >
                  <div className="relative">
                    <Image unoptimized width={100} height={100} 
                      src={profile.avatar || profile.photos?.[0] || "/images/companion_1.png"} 
                      alt={profile.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                     />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-brand-dark leading-tight">{profile.name || "Set Name"}</p>
                    <p className="text-[10px] text-brand-gray">{profile.badge || "Verified Hero"}</p>
                  </div>
                  <ChevronDown size={14} className={`text-brand-gray transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 z-50"
                    >
                      {/* Profile summary inside dropdown */}
                      <div className="px-4 py-3 border-b border-gray-100 mb-1 cursor-pointer hover:bg-gray-50" onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}>
                        <p className="font-bold text-brand-dark text-sm">{profile.name || "Unnamed"}, {profile.age || "20"}</p>
                        <p className="text-xs text-brand-gray">{profile.city || "India"}</p>
                      </div>
                      {USER_MENU.map(item => (
                        item.action ? (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-gray-50 transition-colors w-full text-left"
                          >
                            <item.icon size={15} className="text-brand-purple shrink-0" />
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
                          >
                            <item.icon size={15} className="text-brand-purple shrink-0" />
                            {item.label}
                          </Link>
                        )
                      ))}
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut size={15} className="shrink-0" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="px-6 py-2.5 rounded-full bg-brand-dark text-white hover:opacity-90 transition shadow-lg">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 w-full z-50 glass border-t border-white/40 md:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          <MobileNavItem href="/explore" icon={Compass} active={pathname === '/explore'} />
          <MobileNavItem href="/events/explore" icon={PartyPopper} active={isEventsActive} />
          <MobileNavItem href="/bookings" icon={BookOpen} active={pathname === '/bookings'} />
          {isLoggedIn ? (
            <button onClick={() => setShowProfileModal(true)} className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/profile/me' ? 'text-brand-pink' : 'text-brand-gray'}`}>
              <motion.div whileTap={{ scale: 0.9 }} className="relative">
                <Image unoptimized width={100} height={100}  src={profile.avatar || profile.photos?.[0] || "/images/companion_1.png"} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"  />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
              </motion.div>
            </button>
          ) : (
            <MobileNavItem href="/login" icon={User} active={false} />
          )}
          <MobileNavItem href="/settings" icon={Settings} active={pathname === '/settings'} />
        </div>
      </nav>
    </>
  );
}

function MobileNavItem({ href, icon: Icon, active }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-brand-pink' : 'text-brand-gray'}`}>
      <motion.div whileTap={{ scale: 0.9 }}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      </motion.div>
    </Link>
  );
}
