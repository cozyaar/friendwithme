'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';


// Empty profile template — no hardcoded personal data
const EMPTY_PROFILE = {
  uid: '',
  name: '', age: '', dobDay: '', dobMonth: '', dobYear: '', heightFt: '', heightIn: '', gender: '', location: '', pincode: '', city: '', bio: '',
  habits: { smoking: '', drinking: '', activity: '', sleep: '', social: '' },
  photos: [null, null, null, null, null, null],
  interests: [],
  lifestyle: [],
  profilePic: '',
  prompts: [],
  vibes: [], prefGender: '', prefAge: 25, prefDist: 15,
  isCompanion: false,
  hourlyRate: '',
  services: [],
  profileCompleted: false,
  isRealUser: false
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ── On mount: restore session from Firebase (authoritative) ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        // Sync with Firestore
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('[ProfileContext] Loaded user from Firestore:', userData);
            // Merge Firestore data into profile — keep uid always
            const merged = { ...EMPTY_PROFILE, ...userData, uid: firebaseUser.uid };
            setProfile(merged);
            localStorage.setItem('fwm_user', JSON.stringify(merged));
          } else {
            // No doc yet — only store UID and phone
            const basic = { ...EMPTY_PROFILE, uid: firebaseUser.uid, phone: firebaseUser.phoneNumber || '' };
            setProfile(basic);
            localStorage.setItem('fwm_user', JSON.stringify(basic));
          }
        } catch (e) {
          console.error('[ProfileContext] Firestore sync error:', e);
          // Fallback to localStorage
          const savedUser = localStorage.getItem('fwm_user');
          if (savedUser) {
            try { setProfile(JSON.parse(savedUser)); } catch (_) {}
          }
        }
      } else {
        console.log('[ProfileContext] No user — clearing state');
        setIsLoggedIn(false);
        setProfile(EMPTY_PROFILE);
      }
      setHydrated(true);
    });
    return () => unsubscribe();
  }, []);

  // ── Persist profile changes to localStorage ──
  const updateProfile = (updates) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem('fwm_user', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  // ── Login: save user data from real auth ──
  const login = (userData) => {
    const merged = { ...EMPTY_PROFILE, ...(userData || {}) };
    setProfile(merged);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('fwm_logged_in', 'true');
      localStorage.setItem('fwm_user', JSON.stringify(merged));
    } catch (e) {}
  };

  // ── Logout: Firebase sign out + clear local state ──
  const logout = () => {
    signOut(auth).catch(console.error);
    setIsLoggedIn(false);
    setProfile(EMPTY_PROFILE);
    try {
      localStorage.removeItem('fwm_logged_in');
      localStorage.removeItem('fwm_user');
    } catch (e) {}
  };

  // Wait until hydrated so server/client match
  if (!hydrated) return null;

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isLoggedIn, hydrated, login, logout }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
