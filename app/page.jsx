'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Shield, Sparkles, Clock, ArrowRight, Heart, MapPin, Star, Compass, CheckCircle } from 'lucide-react';

const PICKUP_LINES = [
  "Are you my next favorite memory?",
  "Not just a match. A whole vibe.",
  "We don’t do boring here.",
  "Find someone who matches your energy.",
  "This might be your best decision today."
];

const MOCK_PROFILES = [
  { id: 1, name: "Isabella", age: 24, loc: "New York, NY", price: 150, rating: 4.9, img: "/images/companion_1.png" },
  { id: 2, name: "Marcus", age: 28, loc: "Los Angeles, CA", price: 200, rating: 4.8, img: "/images/companion_2.png" },
  { id: 3, name: "Elena", age: 26, loc: "Miami, FL", price: 180, rating: 5.0, img: "/images/companion_1.png" },
  { id: 4, name: "Julian", age: 29, loc: "Chicago, IL", price: 130, rating: 4.7, img: "/images/companion_2.png" },
];

export default function LandingPage() {
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const int = setInterval(() => setLineIdx(prev => (prev + 1) % PICKUP_LINES.length), 3000);
    return () => clearInterval(int);
  }, []);

  const wordAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8 } })
  };

  return (
    <div className="flex flex-col items-center w-full overflow-hidden pb-10">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-16 md:pt-32 min-h-[90vh] flex flex-col justify-center text-center w-full max-w-5xl mx-auto z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 rounded-full glass inline-flex items-center gap-2 text-sm font-medium text-brand-dark mb-8 border-brand-pink/20 border shadow-lg mx-auto"
        >
          <Sparkles size={16} className="text-brand-pink" /> 100% Verified Companionship
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight max-w-4xl mx-auto flex flex-wrap justify-center gap-x-3">
          {["Find", "the", "perfect", "companion"].map((word, i) => (
            <motion.span custom={i} initial="hidden" animate="visible" variants={wordAnimation} key={i}>
              {word}
            </motion.span>
          ))}
          {["for", "any", "moment."].map((word, i) => (
            <motion.span custom={i+4} initial="hidden" animate="visible" variants={wordAnimation} key={i+4} className="text-brand-gradient">
              {word}
            </motion.span>
          ))}
        </h1>
        
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="text-lg md:text-xl text-brand-gray mb-10 max-w-2xl px-4 mx-auto"
        >
          Safe, verified, and meaningful social experiences. Elevate your events, explore new cities, or simply share a great coffee.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row justify-center gap-4 w-full px-4"
        >
          <Link href="/explore" className="w-full sm:w-auto px-10 py-5 rounded-full bg-brand-dark text-white font-bold text-lg flex justify-center items-center gap-2 hover:scale-105 hover:shadow-2xl hover:shadow-brand-blue/30 transition-all">
            Explore Profiles <ArrowRight size={20} />
          </Link>
          <Link href="/profile/me/edit" className="w-full sm:w-auto px-10 py-5 rounded-full glass font-bold text-lg text-brand-dark border-brand-blue/20 hover:scale-105 transition-transform hover:shadow-xl hover:bg-white/90">
            Become a Companion
          </Link>
        </motion.div>

        {/* Floating Avatars */}
        <div className="absolute top-1/4 -left-4 md:-left-8 hidden lg:block z-[-1]">
          <motion.div animate={{ y: [-15, 15, -15] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
            <Image unoptimized width={96} height={96} src="/images/companion_1.png" className="w-24 h-24 rounded-full object-cover border-[6px] border-white shadow-2xl shadow-brand-pink/20" alt="" />
          </motion.div>
        </div>
        <div className="absolute top-[60%] -right-4 md:-right-8 hidden lg:block z-[-1]">
          <motion.div animate={{ y: [15, -15, 15] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}>
            <Image unoptimized width={112} height={112} src="/images/companion_2.png" className="w-28 h-28 rounded-full object-cover border-[6px] border-white shadow-2xl shadow-brand-blue/20" alt="" />
          </motion.div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once:true }} className="py-10 border-y border-brand-gray/10 w-full glass mb-24">
         <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-6 px-4">
           <div className="flex -space-x-4">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-12 h-12 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
                 <Image unoptimized width={100} height={100}  src={i%2===0 ? "/images/companion_2.png" : "/images/companion_1.png"} className="w-full h-full object-cover" />
               </div>
             ))}
           </div>
           <div className="text-center sm:text-left">
             <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-400 mb-1">
               <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> 
               <span className="text-brand-dark font-bold ml-2">4.9/5</span>
             </div>
             <p className="text-brand-gray font-medium">Trusted by 10,000+ happy users globally.</p>
           </div>
         </div>
      </motion.section>

      {/* 4. PICKUP LINES / FUN SECTION */}
      <section className="w-full max-w-4xl mx-auto text-center py-24 px-4 h-[300px] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-brand-gradient opacity-5 rounded-[4rem] -z-10" />
        <AnimatePresence mode="wait">
          <motion.h2 
            key={lineIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-brand-dark tracking-tight leading-tight"
          >
            "{PICKUP_LINES[lineIdx]}"
          </motion.h2>
        </AnimatePresence>
      </section>

      {/* 3. FEATURE CARDS */}
      <section className="w-full max-w-6xl mx-auto py-24 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "100% Verified", desc: "Rigorous background checks to ensure complete safety and trust.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
            { icon: Sparkles, title: "Premium Matching", desc: "Our algorithm connects you with sophisticated profiles that fit your vibe.", color: "text-brand-purple", bg: "bg-brand-purple/10" },
            { icon: Clock, title: "Easy Booking", desc: "Transparent pricing and instant confirmations for any schedule.", color: "text-brand-pink", bg: "bg-brand-pink/10" },
          ].map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05, y: -10 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass p-10 rounded-[2.5rem] hover:shadow-2xl hover:shadow-brand-purple/10 transition-all border border-white"
            >
              <div className={`w-16 h-16 rounded-2xl ${feat.bg} flex items-center justify-center mb-6 shadow-inner ${feat.color}`}>
                <feat.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-brand-dark">{feat.title}</h3>
              <p className="text-brand-gray text-lg leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>



      {/* 6. HOW IT WORKS */}
      <section className="w-full max-w-6xl mx-auto py-24 px-4 rounded-[4rem] bg-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient opacity-5 pointer-events-none" />
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-xl text-brand-gray">Three simple steps to your next great memory.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative z-10">
           <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-brand-gray/10 -z-10" />
           {[
             { step: "01", icon: Compass, title: "Explore", desc: "Filter by location, vibe, and rating." },
             { step: "02", icon: Heart, title: "Connect", desc: "Align on expectations and book securely." },
             { step: "03", icon: CheckCircle, title: "Experience", desc: "Enjoy a perfect, curated social outing." }
           ].map((s, i) => (
             <motion.div key={i} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i*0.2}} className="text-center">
               <div className="w-32 h-32 mx-auto bg-brand-light rounded-full flex flex-col items-center justify-center p-6 mb-6 shadow-sm border border-white">
                  <div className="text-brand-pink font-black text-2xl opacity-40 mb-1">{s.step}</div>
                  <s.icon size={32} className="text-brand-dark" />
               </div>
               <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
               <p className="text-brand-gray text-lg">{s.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="w-full py-24 bg-white/50 backdrop-blur-3xl px-4 overflow-hidden border-y border-white">
        <h2 className="text-4xl font-bold text-center mb-16">What They Say</h2>
        <div className="flex gap-8 overflow-hidden relative">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-8 whitespace-nowrap"
          >
             {[1,2,3,4, 1,2,3,4].map((v, i) => (
                <div key={i} className="glass w-[400px] p-8 rounded-[2rem] shadow-sm flex-shrink-0">
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    <Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/>
                  </div>
                  <p className="text-xl font-medium text-brand-dark mb-6 whitespace-normal">"I needed a plus one for my corporate event. Aura provided someone who was not only stunning but could hold a conversation with industry leaders perfectly."</p>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden"><Image unoptimized width={100} height={100}  src={`/images/companion_${(i%2)+1}.png`} className="w-full h-full object-cover" /></div>
                     <span className="font-bold text-brand-dark">Sarah J.</span>
                  </div>
                </div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* 9. INTERACTIVE CTA */}
      <section className="w-full max-w-4xl mx-auto py-40 px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once:true }} className="glass rounded-[4rem] p-16 md:p-24 shadow-2xl relative overflow-hidden group border border-white">
          <div className="absolute inset-0 bg-brand-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
          <h2 className="text-5xl md:text-7xl font-bold text-brand-dark mb-8 relative z-10">Start your <br/><span className="text-brand-gradient">story today.</span></h2>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-12 py-6 bg-brand-dark text-white rounded-full font-bold text-2xl shadow-xl hover:shadow-brand-blue/30 relative z-10">
            Get Started Now
          </motion.button>
        </motion.div>
      </section>

      {/* 10. FOOTER */}
      <footer className="w-full max-w-7xl mx-auto py-12 px-6 border-t border-brand-gray/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-2xl font-bold text-brand-dark"><span className="text-brand-gradient">Aura</span>.</div>
        <div className="flex flex-wrap justify-center gap-8 font-medium text-brand-gray">
          <Link href="/" className="hover:text-brand-dark">About</Link>
          <Link href="/" className="hover:text-brand-dark">Trust & Safety</Link>
          <Link href="/" className="hover:text-brand-dark">Terms of Service</Link>
          <Link href="/" className="hover:text-brand-dark">Privacy</Link>
        </div>
        <div className="text-brand-gray/60 font-medium">© 2026 Aura Companions</div>
      </footer>

      <style jsx global>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
