"use client";

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { UploadCloud, Loader2, CheckCircle2, X, Zap } from 'lucide-react';

export default function BountyMap() {
  const { theme } = useTheme();
  const [bounties, setBounties] = useState([]);
  
  // Claim Modal State
  const [activeClaim, setActiveClaim] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Listen to open bounties
    const bountiesRef = collection(db, 'bounties');
    const bountiesQuery = query(bountiesRef, where('status', '!=', 'resolved'));
    
    const unsubscribeBounties = onSnapshot(bountiesQuery, (snapshot) => {
      const bData = [];
      snapshot.forEach(doc => bData.push({ id: doc.id, ...doc.data() }));
      setBounties(bData);
    });

    return () => {
      unsubscribeBounties();
    };
  }, []);

  const createCustomIcon = (points, severity, status) => {
    // If it's under review, turn the pin gray/yellow to indicate it's locked
    if (status === 'under_review') {
      return L.divIcon({
        className: 'custom-icon',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 transition-transform">
            <div class="absolute inset-0 rounded-full opacity-40 bg-slate-500"></div>
            <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-slate-600 text-white text-[10px] font-bold shadow-lg">
              ⏳
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    }

    const isPowerOutage = points === 'POWER';

    const colorClass = isPowerOutage ? 'bg-amber-500 shadow-amber-500/50' : 
      (severity.toUpperCase() === 'HIGH' || severity.toUpperCase() === 'CRITICAL' 
      ? 'bg-red-500 shadow-red-500/50' 
      : 'bg-orange-500 shadow-orange-500/50');
      
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 transition-transform hover:scale-110 cursor-pointer">
          <div class="absolute inset-0 rounded-full animate-ping opacity-20 ${colorClass}"></div>
          <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white ${colorClass} text-white text-[10px] font-bold shadow-lg">
            ${isPowerOutage ? '⚡' : (points || 100)}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Compress the image via canvas
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Drastically reduce size to fit 1MB limit easily
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Export as highly compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
        img.src = event.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFixUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeClaim) return;

    setIsSubmitting(true);

    try {
      const base64Data = await fileToBase64(file);
      
      // Update database directly to "under_review" state
      const bountyRef = doc(db, 'bounties', activeClaim.id);
      await updateDoc(bountyRef, {
        status: 'under_review',
        fix_image_data: base64Data
      });

      setSubmitSuccess(true);
      
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit to Admin. Please try a smaller image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  if (typeof window === 'undefined') return null;

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden relative z-0 bg-slate-900">
      
      <MapContainer center={[9.55, 76.78]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url={tileUrl} />
        
        {/* Standard Issue Markers and Power Outages */}
        {bounties.map(bounty => (
          <Marker key={bounty.id} position={[bounty.lat, bounty.lng]} icon={createCustomIcon(bounty.category === 'Power Outage' ? 'POWER' : bounty.reward_points, bounty.severity, bounty.status)}>
            <Popup className="custom-popup">
              <div className="p-1 w-48">
                <h3 className="font-bold text-slate-900 leading-tight mb-1">{bounty.title}</h3>
                <p className="text-emerald-600 font-extrabold text-sm mb-3">{bounty.reward_points} PTS Reward</p>
                
                {bounty.status === 'under_review' ? (
                  <div className="w-full bg-slate-200 text-slate-600 text-center rounded-lg py-2 text-xs font-bold">
                    Pending Admin Review
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveClaim(bounty); setSubmitSuccess(false); }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2 text-xs font-bold transition-colors"
                  >
                    Submit Fix Proof
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Submission Overlay Modal */}
      <AnimatePresence>
        {activeClaim && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => { setActiveClaim(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Submit Proof of Work</h2>
                <p className="text-sm text-slate-500">Upload a photo showing you resolved: <span className="font-semibold text-slate-700 dark:text-slate-300">"{activeClaim.title}"</span></p>
              </div>

              {!submitSuccess ? (
                <div 
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${isSubmitting ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-950'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFixUpload} accept="image/jpeg, image/png" className="hidden" />
                  
                  {isSubmitting ? (
                    <div className="flex flex-col items-center text-indigo-500">
                      <Loader2 className="h-8 w-8 animate-spin mb-3" />
                      <span className="font-bold text-sm">Uploading to Admin...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
                      <UploadCloud className="h-8 w-8 mb-2" />
                      <span className="font-bold text-sm">Upload "After" Photo</span>
                      <span className="text-xs mt-1 opacity-70">JPEG/PNG only</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 w-full">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2">Submitted for Review!</h3>
                    <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mb-4">A municipal admin will verify your photo shortly. Upon approval, your account will be credited.</p>
                    <button onClick={() => setActiveClaim(null)} className="w-full bg-emerald-500 text-white font-bold py-2 rounded-xl hover:bg-emerald-600">Close</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}