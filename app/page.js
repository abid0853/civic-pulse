"use client";

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Trophy, ShieldAlert, CheckCircle2 } from 'lucide-react';

// Dynamically import the map to avoid window undefined errors in Next.js
const BountyMap = dynamic(() => import('../components/dashboard/BountyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  ),
});

const leaderboardData = [
  { rank: 1, name: "Arjun M.", points: 4500, fixes: 12 },
  { rank: 2, name: "Sarah K.", points: 3200, fixes: 8 },
  { rank: 3, name: "Rahul V.", points: 2850, fixes: 7 },
];

export default function Dashboard() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: The Bounty Map (Takes up remaining space) */}
      <div className="flex-1 h-[50vh] lg:h-full relative flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Bounties</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Verify or fix issues to earn reputation points.</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Report Issue
          </button>
        </div>
        <div className="flex-1 relative">
          <BountyMap />
        </div>
      </div>

      {/* Right Column: Gamification & Stats */}
      <div className="w-full lg:w-96 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4">
        
        {/* Top Fixers Leaderboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Fixers</h2>
          </div>
          <div className="flex flex-col gap-3">
            {leaderboardData.map((user, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={user.rank}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    user.rank === 1 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                    user.rank === 2 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                    'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                  }`}>
                    #{user.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.fixes} fixes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{user.points}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">pts</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Feed / Agent Activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex-1">
           <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live Resolutions</h2>
          </div>
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
             <p className="text-sm text-slate-500 dark:text-slate-400 text-center px-4">
               Waiting for incoming agent validations...<br/>
               <span className="text-xs animate-pulse text-emerald-500">Gemini Webhook Active</span>
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}