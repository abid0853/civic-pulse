"use client";

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, Cpu, FileText, ArrowRight, Loader2, MapPin, Crosshair, MessageSquare, MousePointerClick, Camera, Zap, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Dynamically import the map picker to prevent Next.js SSR errors
const LocationPicker = dynamic(() => import('../../components/report/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-48 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"></div>
});

export default function ReportIssue() {
  const router = useRouter();
  
  // AI & Image State
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // User Input State
  const [remarks, setRemarks] = useState('');
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [user, setUser] = useState(null);
  
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); 
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploaded(true);
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
    setIsAnalyzing(true);
    setAnalysisStep(1); 

    try {
      const base64Data = await fileToBase64(file);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysisStep(2); 

      const response = await fetch('/api/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: file.type
        })
      });

      const result = await response.json();

      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAiResult(result.data);
        setAnalysisStep(3); 
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert(`System Diagnostics: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const publishToMap = async () => {
    if (!aiResult) return;
    
    // Enforce that a location must be selected
    if (!location) {
      alert("Please select a location on the map or use GPS before publishing.");
      return;
    }

    setIsPublishing(true);

    try {
      // Convert image to base64 data URL for Firestore (no Storage needed)
      let before_image_data = null;
      if (imageFile) {
        before_image_data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      }

      await addDoc(collection(db, 'bounties'), {
        title: aiResult.title,
        category: aiResult.category,
        severity: aiResult.severity,
        confidence_score: parseInt(aiResult.confidenceScore),
        reward_points: aiResult.estimatedBounty,
        description: aiResult.aiDraftedDispatch,
        user_remarks: remarks || "No additional remarks provided by user.",
        lat: location.lat,
        lng: location.lng,
        user_id: user ? user.uid : null,
        before_image_data: before_image_data,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      router.push('/');
      
    } catch (error) {
      console.error("Database Insert Error:", error);
      alert("Failed to publish to database. Check console.");
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-auto min-h-[calc(100vh-8rem)] flex flex-col justify-center py-10">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Report an Infrastructure Issue
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Upload visual evidence. Our AI will analyze the hazard, verify the location, and draft a municipal dispatch.
        </p>
      </div>

      {/* Info Disclaimer Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8 mx-auto max-w-3xl w-full"
      >
        <div className="relative overflow-hidden rounded-2xl border border-sky-200 dark:border-sky-500/20 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-500/10 dark:to-blue-500/10 p-4 shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/30 dark:bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="relative flex items-start gap-3">
            <div className="shrink-0 mt-0.5 p-2 bg-sky-100 dark:bg-sky-500/20 rounded-xl">
              <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-sky-800 dark:text-sky-300 mb-1">What can you report?</h4>
              <p className="text-sm text-sky-700 dark:text-sky-400/90 leading-relaxed">
                You can report any kind of issues, for example: <span className="font-semibold">potholes</span>, <span className="font-semibold">water leakages</span>, <span className="font-semibold">damaged streetlights</span>, <span className="font-semibold">waste management concerns</span>, and <span className="font-semibold">public infrastructure challenges</span>.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reporting Mode Selector */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center p-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-md shadow-inner">
          <Link 
            href="/report"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm ring-1 ring-slate-200/50 dark:ring-white/10 transition-all"
          >
            <Camera className="h-4 w-4 text-emerald-500" />
            Standard Issue (AI Camera)
          </Link>
          <Link 
            href="/report/power"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-semibold transition-all"
          >
            <Zap className="h-4 w-4" />
            Power Outage (Grid Tracker)
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Column: Input Zone (Upload + Form) */}
        <div className="flex flex-col gap-6">
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-20 transition-opacity duration-500 ${imageUploaded ? 'opacity-0' : 'group-hover:opacity-40'}`}></div>
            
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg, image/png, image/webp" className="hidden" />

            <div 
              onClick={() => !imageUploaded && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl transition-all duration-300 ${
                imageUploaded 
                  ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10' 
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-emerald-500 cursor-pointer backdrop-blur-sm'
              }`}
            >
              <AnimatePresence mode="wait">
                {!imageUploaded ? (
                  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center p-6 text-center">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-all duration-300 shadow-sm">
                      <UploadCloud className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Evidence</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Supports JPG, PNG</p>
                  </motion.div>
                ) : (
                  <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center p-6 w-full h-full justify-center">
                    <div className="relative w-full max-w-[280px] aspect-video rounded-2xl overflow-hidden border-2 border-white/10 dark:border-slate-700/50 mb-4 shadow-2xl bg-black">
                       {imagePreview && <img src={imagePreview} alt="Issue preview" className="object-cover w-full h-full opacity-80" />}
                       {isAnalyzing && (
                         <motion.div 
                           animate={{ y: ["0%", "100%", "0%"] }} 
                           transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                           className="absolute top-0 left-0 w-full h-1.5 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)]"
                         />
                       )}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/20 px-4 py-2 rounded-full text-sm">
                      {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Image...</> : <><CheckCircle2 className="h-4 w-4" /> AI Analysis Complete</>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User Context Form */}
          <AnimatePresence>
            {imageUploaded && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 20 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
                className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-emerald-500" /> Pin Issue Location
                  </h3>
                  <button 
                    onClick={handleGetLocation}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  >
                    {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                    Use GPS
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Interactive Map */}
                  <LocationPicker location={location} setLocation={setLocation} />

                  {/* Remarks Field */}
                  <div className="relative">
                    <MessageSquare className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                    <textarea 
                      placeholder="Add any additional remarks (e.g., 'Water is leaking into the main road...')"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none custom-scrollbar"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Live Agent Control Room */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Cpu className="h-5 w-5 text-indigo-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Gemini Agent Terminal</h2>
          </div>

          <div className="space-y-8 flex-1">
            <div className={`transition-opacity duration-500 ${analysisStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${analysisStep >= 1 && isAnalyzing ? 'bg-indigo-500 animate-ping' : analysisStep > 1 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Vision Analysis Agent</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono leading-relaxed">
                    {analysisStep === 1 && '> Extracting pixel data and context...'}
                    {analysisStep > 1 && aiResult && `> Detected: ${aiResult.category} (${aiResult.confidenceScore}% confidence)`}
                    {analysisStep === 0 && 'Waiting for visual input...'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`transition-opacity duration-500 ${analysisStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${analysisStep === 2 && isAnalyzing ? 'bg-amber-500 animate-ping' : analysisStep > 2 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Validation Agent</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono leading-relaxed">
                    {analysisStep === 2 && '> Scanning local civic database for duplicates...'}
                    {analysisStep > 2 && aiResult && `> Validated. Severity assessed as: ${aiResult.severity.toUpperCase()}.`}
                    {analysisStep < 2 && 'Waiting for vision pipeline...'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`transition-opacity duration-500 ${analysisStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${analysisStep >= 3 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div className="w-full pr-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Action & Dispatch Agent</h4>
                  {analysisStep >= 3 && aiResult ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner">
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-3 leading-relaxed">"{aiResult.aiDraftedDispatch}"</p>
                      <div className="flex justify-between items-center text-xs font-bold pt-3 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500">Calculated Reward Pool:</span>
                        <span className="text-emerald-500 text-sm">{aiResult.estimatedBounty} PTS</span>
                      </div>
                    </motion.div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Waiting for verification protocol...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-auto">
            <AnimatePresence>
              {analysisStep === 3 && (
                <motion.button 
                  onClick={publishToMap}
                  disabled={isPublishing}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`w-full ${isPublishing ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-1'} text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all duration-300`}
                >
                  {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                  {isPublishing ? 'Publishing to Network...' : 'Publish to Bounty Map'}
                  {!isPublishing && <ArrowRight className="h-5 w-5" />}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}