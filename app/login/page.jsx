'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Smartphone, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { createOrGetUser } from '@/lib/user';
import { useProfile } from '@/context/ProfileContext';

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const router = useRouter();
  const { login, isLoggedIn } = useProfile();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/explore');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const setupRecaptcha = () => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' }
      );
    }
  };

  const sendOTP = async (phoneNumber) => {
    setError('');
    setLoading(true);
    try {
      setupRecaptcha();
      const formatPhone = `+91${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
      
      window.confirmationResult = confirmationResult;
      
      setStep(2);
      setResendTimer(30);
    } catch (err) {
      console.error('OTP Error:', err);
      const errCode = err.code || err.message || '';
      setError(
        errCode.includes('invalid-app-credential')
          ? 'Invalid app credential. Ensure localhost is authorized in Firebase.'
          : errCode.includes('too-many-requests') || errCode.includes('quota-exceeded')
          ? 'Quota exceeded / too many attempts. Please try again later.'
          : errCode.includes('invalid-phone-number')
          ? 'Invalid phone number format.'
          : errCode.includes('captcha') || errCode.includes('recaptcha-not-ready')
          ? 'Anti-spam check failed. Please try again.'
          : `Failed to send OTP: ${errCode}`
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (code) => {
    setError('');
    setLoading(true);
    try {
      const authResult = await window.confirmationResult.confirm(code);
      const user = authResult.user;
      
      const result = await createOrGetUser(user);
      
      if (result.isNew) {
        login({
          uid: user.uid,
          phone: user.phoneNumber,
          name: '',
          avatar: null,
          onboardingComplete: false
        });

        router.push('/onboarding');
      } else {
        // Existing user -> check onboarding
        const userData = result.data;
        
        login({
          uid: user.uid,
          phone: user.phoneNumber,
          name: userData.name || '',
          avatar: userData.photos?.[0] || null,
          onboardingComplete: userData.onboardingCompleted
        });

        if (!userData.onboardingCompleted) {
          router.push('/onboarding');
        } else {
          router.push('/explore');
        }
      }
    } catch (err) {
      console.error('Firebase OTP Verify Error:', err);
      const errCode = err.code || err.message || '';
      setError(
        errCode.includes('invalid-verification-code')
          ? 'Wrong OTP. Please check and try again.'
          : `Verification failed: ${errCode}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendSubmit = () => {
    if (phone.length === 10) {
      sendOTP(phone);
    } else {
      setError('Enter a valid 10-digit number');
    }
  };

  const handleVerifySubmit = () => {
    const code = otp.join('');
    if (code.length === 6) {
      verifyOTP(code);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    handleSendSubmit();
  };

  const handleOtpChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (e, i) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[i]) {
        newOtp[i] = '';
        setOtp(newOtp);
      } else if (i > 0) {
        newOtp[i - 1] = '';
        setOtp(newOtp);
        otpRefs.current[i - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, idx) => { newOtp[idx] = char; });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4">
      <div id="recaptcha-container" className="hidden" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md p-8 md:p-10 rounded-3xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={step === 2 ? { scale: [1, 1.15, 1] } : {}}
            className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4 text-brand-blue"
          >
            {step === 1 ? <Smartphone size={32} /> : <CheckCircle2 size={32} className="text-brand-purple" />}
          </motion.div>
          <h1 className="text-2xl font-bold text-brand-dark mb-2">
            {step === 1 ? 'Welcome to Friend With Me' : 'Verify your number'}
          </h1>
          <p className="text-brand-gray text-sm">
            {step === 1
              ? 'Enter your mobile number to get started'
              : `We sent a 6-digit code to +91 ${phone}`}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-5 text-sm font-medium"
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="flex items-center bg-white rounded-2xl p-4 shadow-inner border border-gray-100 focus-within:border-brand-blue transition-colors">
                <span className="text-brand-dark font-semibold mr-3 shrink-0 border-r border-gray-200 pr-3">+91</span>
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  maxLength={10}
                  className="w-full bg-transparent outline-none text-brand-dark text-lg tracking-wider"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && phone.length === 10 && handleSendSubmit()}
                  autoFocus
                />
                {phone.length === 10 && (
                  <CheckCircle2 size={20} className="text-green-500 shrink-0 ml-2" />
                )}
              </div>
              <button
                onClick={handleSendSubmit}
                disabled={phone.length < 10 || loading}
                className="w-full py-4 bg-brand-dark text-white rounded-full font-medium text-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <>Continue <ArrowRight size={20} /></>
                )}
              </button>
              <p className="text-center text-xs text-brand-gray">
                By continuing you agree to our Terms of Service
              </p>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`w-12 h-14 bg-white rounded-xl text-center text-2xl font-bold text-brand-dark border-2 transition-colors outline-none
                      ${digit ? 'border-brand-purple' : 'border-gray-200'} focus:border-brand-blue`}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifySubmit}
                disabled={otp.some(d => !d) || loading}
                className="w-full py-4 bg-brand-dark text-white rounded-full font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw size={20} className="animate-spin" /> : <>Verify <ArrowRight size={20} /></>}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                  className="text-brand-gray hover:text-brand-dark transition-colors"
                >
                  ← Change number
                </button>
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="text-brand-purple font-semibold disabled:text-brand-gray disabled:cursor-not-allowed hover:underline transition-colors"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
