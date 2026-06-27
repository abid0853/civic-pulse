"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Shield, TrendingUp, Loader2 } from 'lucide-react';
import { db, auth } from '../../lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const profilesRef = collection(db, 'profiles');
        const snapshot = await getDocs(profilesRef);
        
        let data = [];
        snapshot.forEach(doc => {
          const profile = doc.data();
          data.push({
            id: doc.id,
            name: profile.full_name || 'Anonymous',
            points: profile.total_points || 0,
            badgeLevel: profile.badgeLevel || 'Contributor',
          });
        });

        // Sort descending by points
        data.sort((a, b) => b.points - a.points);
        
        // Add rank
        data = data.map((u, index) => ({
          ...u,
          rank: index + 1
        }));

        setUsers(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const currentUserData = users.find(u => u.id === currentUserId);

  const badgeLevel = currentUserData?.badgeLevel || '';

  const rankBadges = [
    {
      name: "Silver",
      desc: "Entry-level civic contributor",
      icon: Shield,
      unlocked: badgeLevel === 'Silver' || badgeLevel === 'Gold' || badgeLevel === 'Elite',
      color: "text-slate-500",
      bg: "bg-slate-200/60 dark:bg-slate-600/20",
    },
    {
      name: "Gold",
      desc: "Consistent community fixer",
      icon: Star,
      unlocked: badgeLevel === 'Gold' || badgeLevel === 'Elite',
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      name: "Elite",
      desc: "Top-tier civic hero",
      icon: Trophy,
      unlocked: badgeLevel === 'Elite',
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 min-h-[calc(100vh-4rem)]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-amber-500" /> City Leaderboard
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Compete with your neighbors to build a better city. Earn points by reporting hazards and claiming fix bounties.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Your Profile & Badges */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Your Civic Profile</h2>
              
              {currentUserId ? (
                currentUserData ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white dark:border-slate-800 uppercase">
                        {currentUserData.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{currentUserData.points.toLocaleString()} PTS</h3>
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">Rank #{currentUserData.rank} • {currentUserData.badgeLevel}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-500 mb-6">Profile data not found on leaderboard yet. Start earning points!</div>
                )
              ) : (
                <div className="text-sm text-slate-500 mb-6">Please log in to see your ranking.</div>
              )}

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Medal className="h-4 w-4 text-amber-500" /> Rank Badges
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {rankBadges.map((badge, i) => {
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
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">{users.length} Citizens</span>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No users found. Be the first to earn points!</div>
              ) : (
                <div className="space-y-3">
                  {users.map((citizen, index) => {
                    const isUser = citizen.id === currentUserId;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                        key={citizen.id} 
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isUser ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 shadow-md shadow-emerald-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'}`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank Number */}
                          <div className={`w-8 font-black text-lg text-center ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-300 dark:text-slate-600'}`}>
                            #{citizen.rank}
                          </div>
                          
                          {/* Avatar Block */}
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm uppercase ${isUser ? 'bg-gradient-to-br from-emerald-400 to-cyan-400' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            {citizen.name.charAt(0)}
                          </div>

                          {/* Name & Title */}
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                              {citizen.name} {isUser && <span className="text-emerald-500 text-xs ml-1">(You)</span>}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Badge Level: {citizen.badgeLevel}</p>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <span className={`font-black ${isUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {citizen.points.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold ml-1">PTS</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      )}
    </div>
  );
}