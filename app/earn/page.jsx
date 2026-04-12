'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

export default function EarnDashboard() {
  const [active, setActive] = useState(true);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Companion Hub</h1>
          <p className="text-brand-gray">Manage your availability and earnings.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
          <span className="font-medium text-brand-dark">Available</span>
          <div 
            onClick={() => setActive(!active)}
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${active ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <motion.div animate={{ x: active ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-md" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-3xl bg-gradient-to-br from-brand-dark to-black text-white col-span-1 md:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Wallet size={24} className="text-white" />
            </div>
          </div>
          <p className="text-white/60 font-medium mb-1">Total Earnings</p>
          <h2 className="text-5xl font-bold">₹0.00</h2>
        </div>

        <div className="glass p-8 rounded-3xl">
           <div className="p-3 bg-brand-light rounded-2xl w-fit mb-6 text-brand-blue">
             <TrendingUp size={24} />
           </div>
           <p className="text-brand-gray font-medium mb-1">Pending Clearance</p>
           <h2 className="text-3xl font-bold text-brand-dark mb-4">₹0.00</h2>
           <button disabled className="text-brand-gray font-medium flex items-center gap-1 cursor-not-allowed">Withdraw <ChevronRight size={16}/></button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6 text-brand-dark">Upcoming Bookings</h2>
      <div className="glass rounded-[2rem] overflow-hidden p-12 text-center text-brand-gray">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📅</div>
          <p className="font-medium text-lg">No upcoming bookings yet</p>
          <p className="text-sm">When you get booked, they will appear here.</p>
      </div>
    </div>
  );
}
