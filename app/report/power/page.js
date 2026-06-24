"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Loader2, ArrowRight, ShieldCheck, Crosshair, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '../../../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

const LocationPicker = dynamic(() => import('../../../components/report/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-48 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"></div>
});

export default function PowerOutageReport() {
  const router = useRouter();
  
  const [remarks, setRemarks] = useState('');
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else setUser(null);
    });

    return () => unsubscribe();
  }, []);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          alert('GPS Failed. Please click on the map to set location manually.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const publishReport = async () => {
    if (!location) {
      alert("Please set your exact location so teams can track the outage.");
      return;
    }

    setIsPublishing(true);

    try {
      await addDoc(collection(db, 'bounties'), {
        title: "Power Outage Reported",
        category: "Power Outage",
        severity: "Critical",
        confidence_score: 100,
        reward_points: 50,
        description: "User has reported a power outage in this location. Ground teams dispatched.",
        user_remarks: remarks || "No power.",
        lat: location.lat,
        lng: location.lng,
        user_id: user ? user.uid : null,
        status: 'open',
        created_at: new Date().toISOString()
      });

      router.push('/');
      
    } catch (error) {
      console.error("Database Insert Error:", error);
      alert("Failed to submit the report.");
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-auto min-h-[calc(100vh-8rem)] flex flex-col justify-center py-10 px-4">
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-4">
          <Zap className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Report Power Outage
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Help us identify grid failures in real-time. Your report will be aggregated with others to highlight affected zones.
        </p>
      </div>

      {/* Reporting Mode Selector */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center p-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-md shadow-inner">
          <Link 
            href="/report"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-semibold transition-all"
          >
            <Camera className="h-4 w-4" />
            Standard Issue (AI Camera)
          </Link>
          <Link 
            href="/report/power"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm ring-1 ring-slate-200/50 dark:ring-white/10 transition-all"
          >
            <Zap className="h-4 w-4 text-amber-500" />
            Power Outage (Grid Tracker)
          </Link>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="space-y-8">
          
          {/* Remarks Input */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. Add Remarks (Optional)</h3>
            <textarea 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Area is completely dark, heard a transformer explode..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none h-32"
            />
          </div>

          {/* Location Pin */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Pin Your Exact Location</h3>
              <button 
                onClick={handleGetLocation}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
              >
                {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                Use GPS
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <LocationPicker location={location} setLocation={setLocation} />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              onClick={publishReport}
              disabled={isPublishing || !location}
              className={`w-full ${(isPublishing || !location) ? 'bg-amber-600/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 hover:-translate-y-1 shadow-xl shadow-amber-500/20'} text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300`}
            >
              {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
              {isPublishing ? 'Submitting Report...' : 'Submit Outage Report'}
              {!isPublishing && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
