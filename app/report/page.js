"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, Cpu, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // <-- Import the DB Client

export default function ReportIssue() {
  const router = useRouter();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false); // New state for publishing
  
  const fileInputRef = useRef(null);

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

  // --- NEW: Database Publishing Function ---
  const publishToMap = async () => {
    if (!aiResult) return;
    setIsPublishing(true);

    try {
      // 1. Insert the AI-generated JSON directly into Supabase
      const { error } = await supabase
        .from('bounties')
        .insert([
          {
            title: aiResult.title,
            category: aiResult.category,
            severity: aiResult.severity,
            confidence_score: parseInt(aiResult.confidenceScore),
            reward_points: aiResult.estimatedBounty,
            description: aiResult.aiDraftedDispatch,
            // Mocking geolocation near your map center for the demo
            lat: 9.55 + (Math.random() * 0.02 - 0.01),
            lng: 76.78 + (Math.random() * 0.02 - 0.01),
          }
        ]);

      if (error) throw error;

      // 2. Redirect to Dashboard to see the new pin live!
      router.push('/');
      
    } catch (error) {
      console.error("Database Insert Error:", error);
      alert("Failed to publish to database. Check console.");
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col justify-center">
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
          Report an Infrastructure Issue
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Our AI agents will analyze the image, verify the location, and instantly draft a municipal work order.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Drag & Drop Zone */}
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur opacity-20 transition-opacity duration-500 ${imageUploaded ? 'opacity-0' : 'group-hover:opacity-40'}`}></div>
          
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg, image/png, image/webp" className="hidden" />

          <div 
            onClick={() => !imageUploaded && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-3xl transition-all duration-300 ${
              imageUploaded 
                ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10' 
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 cursor-pointer'
            }`}
          >
            <AnimatePresence mode="wait">
              {!imageUploaded ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center p-6 text-center">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Click to upload image</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Supports JPG, PNG (Max 5MB)</p>
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center p-6 w-full h-full justify-center">
                  <div className="relative w-full max-w-[240px] aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-4 bg-slate-900">
                     {imagePreview && <img src={imagePreview} alt="Issue preview" className="object-cover w-full h-full opacity-70" />}
                     {isAnalyzing && (
                       <motion.div 
                         animate={{ y: ["0%", "100%", "0%"] }} 
                         transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                         className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)]"
                       />
                     )}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</> : <><CheckCircle2 className="h-5 w-5" /> Analysis Complete</>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Agent Control Room */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Cpu className="h-5 w-5 text-indigo-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Gemini Agent Terminal</h2>
          </div>

          <div className="space-y-6 flex-1">
            {/* Step 1: Vision */}
            <div className={`transition-opacity duration-500 ${analysisStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${analysisStep >= 1 && isAnalyzing ? 'bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]' : analysisStep > 1 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Vision Analysis Agent</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    {analysisStep === 1 && '> Extracting pixel data and context...'}
                    {analysisStep > 1 && aiResult && `> Detected: ${aiResult.category} (${aiResult.confidenceScore} confidence)`}
                    {analysisStep === 0 && 'Waiting for input...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Validation */}
            <div className={`transition-opacity duration-500 ${analysisStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${analysisStep === 2 && isAnalyzing ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]' : analysisStep > 2 ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Validation Agent</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    {analysisStep === 2 && '> Scanning local civic database for duplicates...'}
                    {analysisStep > 2 && aiResult && `> Validated. Severity assessed as: ${aiResult.severity.toUpperCase()}.`}
                    {analysisStep < 2 && 'Waiting for vision output...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Dispatch */}
            <div className={`transition-opacity duration-500 ${analysisStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${analysisStep >= 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Action & Dispatch Agent</h4>
                  {analysisStep >= 3 && aiResult ? (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-2">"{aiResult.aiDraftedDispatch}"</p>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">Reward Pool:</span>
                        <span className="text-emerald-500">{aiResult.estimatedBounty} PTS</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Waiting for verification...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button wired to DB */}
          <AnimatePresence>
            {analysisStep === 3 && (
              <motion.button 
                onClick={publishToMap}
                disabled={isPublishing}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-6 w-full ${isPublishing ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-colors`}
              >
                {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                {isPublishing ? 'Publishing...' : 'Publish to Bounty Map'}
                {!isPublishing && <ArrowRight className="h-5 w-5" />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}