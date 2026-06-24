"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import PowerGridStatus from '../components/dashboard/PowerGridStatus';
import { db } from '../lib/firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

// Dynamically import the map to avoid window undefined errors in Next.js
const BountyMap = dynamic(() => import('../components/dashboard/BountyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <MapPin className="h-8 w-8 text-emerald-500 animate-bounce" />
        <span className="text-sm font-bold text-slate-500">Initializing Core Map...</span>
      </div>
    </div>
  ),
});

export default function Dashboard() {
  const [recentBounties, setRecentBounties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bountiesRef = collection(db, 'bounties');
    const q = query(bountiesRef, orderBy('created_at', 'desc'), limit(6));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRecentBounties(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching live feed:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[calc(100vh-8rem)]">
      
      {/* Left Column: The Bounty Map */}
      <div className="w-full lg:flex-1 h-[50vh] lg:h-full relative flex flex-col gap-4 order-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Community Heatmap</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Live view of local infrastructure health.</p>
          </div>
          <Link href="/report" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
            <ShieldAlert className="h-5 w-5" />
            Report Issue
          </Link>
        </div>
        <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-black/40 ring-1 ring-slate-200 dark:ring-white/10">
          <BountyMap />
        </div>
      </div>

      {/* Right Column: Live Community Feed & Power Grid Status */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 h-[600px] lg:h-full order-2">
        <PowerGridStatus />
        
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-xl flex-1 flex flex-col overflow-hidden">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Feed</h2>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          {/* Scrolling Feed */}
          <div className="flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-4 flex-1">
            {isLoading ? (
               <div className="flex items-center justify-center h-full">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
               </div>
            ) : recentBounties.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 text-sm py-10">
                No active issues reported yet. Be the first!
              </div>
            ) : (
              <AnimatePresence>
                {recentBounties.map((bounty, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={bounty.id}
                    className="group flex flex-col p-4 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black tracking-wider px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase rounded-md">
                        {bounty.category}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        Just now
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2">
                      {bounty.title}
                    </h3>
                    <div className="mt-3 flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${bounty.severity === 'Critical' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10' : bounty.severity === 'High' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10' : 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10'}`}>
                        {bounty.severity} Priority
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {bounty.reward_points} PTS
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}