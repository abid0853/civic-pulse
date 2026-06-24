"use client";

import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Shield, Zap, Target, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  // Mock leaderboard data mixed with the user's local stats for the demo
  const topCitizens = [
    { name: "Sarah Jenkins", points: 8450, rank: 1, badges: 12, title: "Grandmaster Civic" },
    { name: "Alex Chen", points: 7200, rank: 2, badges: 9, title: "City Ranger" },
    { name: "Marcus T.", points: 6150, rank: 3, badges: 7, title: "Neighborhood Watch" },
    { name: "Priya Patel", points: 4300, rank: 4, badges: 5, title: "Street Sweeper" },
    { name: "You (Local User)", points: 1250, rank: 5, badges: 3, title: "Rookie Reporter", isUser: true },
    { name: "David Kim", points: 950, rank: 6, badges: 2, title: "Observer" },
  ];

  const unlockableBadges = [
    { name: "First Blood", desc: "Report your first issue", icon: Target, unlocked: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Pothole Punisher", desc: "Report 5 road hazards", icon: Shield, unlocked: true, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Night Light", desc: "Fix a broken streetlamp", icon: Zap, unlocked: true, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "City Savior", desc: "Earn 10,000 Total PTS", icon: Star, unlocked: false, color: "text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-amber-500" /> City Leaderboard
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Compete with your neighbors to build a better city. Earn points by reporting hazards and claiming fix bounties.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Your Profile & Badges */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Your Civic Profile</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white dark:border-slate-800">
                ME
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">1,250 PTS</h3>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">Rank #5 • Rookie Reporter</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Medal className="h-4 w-4 text-amber-500" /> Earned Badges
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {unlockableBadges.map((badge, i) => {
                  const Icon = badge.icon;
                  return (
                    <div key={i} className={`p-3 rounded-xl border ${badge.unlocked ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950' : 'border-dashed border-slate-200 dark:border-slate-800 opacity-60 grayscale'}`}>
                      <div className={`p-2 rounded-lg inline-block mb-2 ${badge.bg}`}>
                        <Icon className={`h-5 w-5 ${badge.color}`} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{badge.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{badge.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: The Global Leaderboard */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" /> Top Contributors
              </h2>
            </div>

            <div className="space-y-3">
              {topCitizens.map((citizen, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  key={index} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${citizen.isUser ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 shadow-md shadow-emerald-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Number */}
                    <div className={`w-8 font-black text-lg text-center ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-300 dark:text-slate-600'}`}>
                      #{citizen.rank}
                    </div>
                    
                    {/* Avatar Block */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${citizen.isUser ? 'bg-gradient-to-br from-emerald-400 to-cyan-400' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      {citizen.name.charAt(0)}
                    </div>

                    {/* Name & Title */}
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {citizen.name} {citizen.isUser && <span className="text-emerald-500 text-xs ml-1">(You)</span>}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{citizen.title} • {citizen.badges} Badges</p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <span className={`font-black ${citizen.isUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {citizen.points.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold ml-1">PTS</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}