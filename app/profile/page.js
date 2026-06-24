"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Flame, Award, MapPin, Loader2, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      setUser(currentUser);

      try {
        // Fetch Profile
        const profileRef = doc(db, 'profiles', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        } else {
          setProfile({ total_points: 0, badges: [], avatar_url: null, full_name: currentUser.email.split('@')[0] });
        }

        // Fetch Reports
        const bountiesRef = collection(db, 'bounties');
        const q = query(bountiesRef, where('user_id', '==', currentUser.uid)); // orderBy needs composite index, sorting client side
        const querySnapshot = await getDocs(q);
        
        const bountiesData = [];
        querySnapshot.forEach((doc) => {
          bountiesData.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort descending by created_at
        bountiesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setReports(bountiesData);

      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError("Failed to load profile data. Please try refreshing.");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
          <span className="text-slate-500 font-bold animate-pulse">Loading Profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-3xl p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error Loading Profile</h2>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="w-full md:w-1/3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-24 w-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-xl mb-4">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">
                {profile.full_name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">{user.email}</p>
              
              <div className="w-full flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 mb-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total Points</span>
                </div>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {profile.total_points} PTS
                </span>
              </div>

              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Badges & History */}
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          
          {/* Badges Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Award className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Earned Badges</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile.badges && profile.badges.length > 0 ? (
                profile.badges.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
                    <ShieldCheck className="h-8 w-8 text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{badge}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                  No badges earned yet. Report issues to earn them!
                </div>
              )}
            </div>
          </motion.div>

          {/* Report History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/10 rounded-xl">
                <MapPin className="h-6 w-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Submission History</h3>
            </div>

            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black tracking-wider px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase rounded-md">
                          {report.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${report.severity === 'Critical' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10' : report.severity === 'High' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10' : 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10'}`}>
                          {report.severity}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{report.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col sm:items-end">
                       <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        +{report.reward_points} PTS
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-sm bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  You haven't reported any infrastructure issues yet.
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
