"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { db } from '../../lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function PowerGridStatus() {
  const [recentOutages, setRecentOutages] = useState([]);
  const [totalOutages, setTotalOutages] = useState(0);

  useEffect(() => {
    // Listen to bounties to compute stats
    const bountiesRef = collection(db, 'bounties');
    const bQuery = query(bountiesRef, where('status', '!=', 'resolved'));
    
    const unsubscribeBounties = onSnapshot(bQuery, (bSnapshot) => {
      const outages = [];
      bSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.category === 'Power Outage') {
          outages.push({ id: doc.id, ...data });
        }
      });

      // Sort by newest first
      outages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setRecentOutages(outages.slice(0, 3)); // Only show top 3 recent
      setTotalOutages(outages.length);
    });

    return () => unsubscribeBounties();
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden mb-4">
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full ${totalOutages > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${totalOutages > 0 ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
              <Zap className={`h-4 w-4 ${totalOutages > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            </div>
            <h3 className="font-bold text-white text-sm">Power Grid Status</h3>
          </div>
          {totalOutages > 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider border border-amber-500/20">
              <AlertTriangle className="h-3 w-3" /> Grid Disruption
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" /> Grid Stable
            </span>
          )}
        </div>

        <div className="space-y-2">
          {totalOutages === 0 ? (
            <div className="text-center py-4 text-xs font-bold text-slate-500">
              No active outages reported.
            </div>
          ) : (
            recentOutages.map((outage) => (
              <div key={outage.id} className="flex flex-col py-2 border-t border-slate-800/50">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-300">Live Report</h4>
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {new Date(outage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">
                  "{outage.user_remarks || "No details provided"}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
