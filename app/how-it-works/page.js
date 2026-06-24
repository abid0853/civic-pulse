"use client";

import { motion } from 'framer-motion';
import { Camera, MapPin, ShieldCheck, Trophy, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      title: "1. Capture & Report",
      description: "Spot a civic issue like a pothole, broken streetlight, or power outage? Snap a quick photo or drop a pin. Our AI automatically analyzes the severity and categorizes the issue.",
      icon: Camera,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "2. Track & Aggregate",
      description: "Reports are mapped in real-time. For severe issues like grid failures, we automatically aggregate reports from multiple users to create active 'Outage Zones' for rapid response.",
      icon: MapPin,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "3. Fix & Verify",
      description: "Ground teams or civic hackers fix the issue and submit a 'Proof of Fix' photo. Our administrators review the proof to ensure the problem is fully resolved.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "4. Earn Bounties",
      description: "Once verified, you earn Reputation Points! Climb the global leaderboard, earn badges, and get recognized as a top civic contributor in your city.",
      icon: Trophy,
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full mb-6"
          >
            <Zap className="h-8 w-8 text-emerald-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight"
          >
            Gamifying Civic Maintenance
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            CivicPulse turns maintaining our cities into a multiplayer game. Report issues, get them fixed, and earn reputation points.
          </motion.p>
        </div>

        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-8 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${step.bg}`}>
                  <Icon className={`h-7 w-7 ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl shadow-emerald-500/20"
        >
          <h2 className="text-3xl font-extrabold mb-4">Ready to fix your city?</h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Join thousands of active citizens tracking grid failures, fixing potholes, and keeping our infrastructure running smoothly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/report"
              className="w-full sm:w-auto bg-white text-emerald-600 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-5 w-5" />
              Report Issue
            </Link>
            <Link 
              href="/report/power"
              className="w-full sm:w-auto bg-emerald-700/50 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl border border-emerald-400/30 transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="h-5 w-5 text-amber-300" />
              Report Power Outage
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
