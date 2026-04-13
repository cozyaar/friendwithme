'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function Booking() {
  const { id } = useParams();
  const router = useRouter();
  const [duration, setDuration] = useState(4);
  const hourlyRate = 18;
  const total = duration * hourlyRate;

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-4">
      <Link href={`/profile/${id}`} className="inline-flex items-center gap-2 text-brand-gray hover:text-brand-dark transition-colors font-medium mb-8">
        <ArrowLeft size={20} /> Back to profile
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-8 md:p-10">
        <h1 className="text-3xl font-bold mb-8 text-brand-dark">Complete Booking</h1>

        <div className="flex gap-4 mb-10 pb-10 border-b border-brand-gray/20">
          <Image unoptimized width={100} height={100}  src={parseInt(id) % 2 === 0 ? "/images/companion_2.png" : "/images/companion_1.png"} className="w-20 h-20 rounded-2xl object-cover shadow-md"  />
          <div>
            <h2 className="text-xl font-bold text-brand-dark">Isabella</h2>
            <p className="text-brand-gray">New York, NY</p>
            <p className="text-brand-dark font-medium mt-1">${hourlyRate}/hr</p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div>
            <label className="block text-sm font-semibold text-brand-gray uppercase tracking-wider mb-3">Select Date</label>
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
               <Calendar className="text-brand-blue" />
               <input type="date" className="w-full outline-none bg-transparent" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-brand-gray uppercase tracking-wider mb-3">Duration (Hours)</label>
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
               <div className="flex items-center gap-3">
                 <Clock className="text-brand-purple" />
                 <span className="font-medium text-brand-dark">{duration} Hours</span>
               </div>
               <div className="flex bg-brand-light rounded-lg">
                 <button onClick={() => setDuration(Math.max(1, duration-1))} className="w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-gray-200 rounded-l-lg">-</button>
                 <button onClick={() => setDuration(duration+1)} className="w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-gray-200 rounded-r-lg">+</button>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-dark text-white rounded-2xl p-6 mb-8">
          <div className="flex justify-between mb-3 text-white/80">
            <span>{duration} Hours x ${hourlyRate}</span>
            <span>${total}</span>
          </div>
          <div className="flex justify-between mb-4 text-white/80">
            <span>Service Fee</span>
            <span>$10</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-white/20 font-bold text-xl">
            <span>Total</span>
            <span>${total + 10}</span>
          </div>
        </div>

        <button onClick={() => router.push('/bookings')} className="w-full py-4 bg-brand-blue text-white rounded-full font-bold text-lg flex justify-center items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
          <CreditCard /> Confirm & Pay
        </button>
        
        <p className="text-center text-xs text-brand-gray mt-6 flex items-center justify-center gap-1">
          <ShieldCheck size={14} /> Payments are secure and encrypted
        </p>
      </motion.div>
    </div>
  );
}
