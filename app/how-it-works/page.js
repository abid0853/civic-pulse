"use client";

import { motion } from 'framer-motion';
import { Camera, ShieldCheck, Trophy, ArrowRight, Zap, MapPin, IndianRupee, Award, CheckCircle2, Users, Coins, Star } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const pillars = [
    {
      step: "01",
      title: "Report & Alert",
      subtitle: "See Something? Say Something.",
      description: "Citizens spot civic issues — potholes, water leakages, broken streetlights, or waste pileups — snap a photo from their phone, and report it with GPS location. Our Gemini-powered AI instantly analyzes the severity, categorizes the issue, and drafts a municipal dispatch.",
      icon: Camera,
      gradient: "from-blue-500 to-indigo-600",
      lightBg: "bg-blue-50 dark:bg-blue-500/10",
      borderColor: "border-blue-200 dark:border-blue-500/20",
      iconBg: "bg-blue-500",
      dotColor: "bg-blue-500",
      features: ["AI-powered image analysis", "Auto-severity classification", "GPS-pinned location tagging"],
    },
    {
      step: "02",
      title: "Admin Triage & Bounties",
      subtitle: "City Officials Take Action.",
      description: "Municipal admins review incoming reports on a dedicated dashboard. They assess priority, verify legitimacy, and assign monetary rewards (bounties) to high-impact issues — transforming civic complaints into actionable, incentivized tasks for the community.",
      icon: ShieldCheck,
      gradient: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50 dark:bg-amber-500/10",
      borderColor: "border-amber-200 dark:border-amber-500/20",
      iconBg: "bg-amber-500",
      dotColor: "bg-amber-500",
      features: ["Dedicated admin dashboard", "Bounty reward assignment (₹)", "Priority-based task queuing"],
    },
    {
      step: "03",
      title: "Do & Earn (Gamification)",
      subtitle: "Fix It. Prove It. Get Paid.",
      description: "Community members browse the \"Tasks\" board, pick a bounty near them, physically go fix the issue, and upload an \"After\" photo as proof of work. No complex verification — just upload, submit, and the task is marked complete.",
      icon: Coins,
      gradient: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50 dark:bg-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-500/20",
      iconBg: "bg-emerald-500",
      dotColor: "bg-emerald-500",
      features: ["Browse active bounties near you", "Upload \"After\" photo proof", "Instant task completion"],
    },
    {
      step: "04",
      title: "Rank Up & Get Rewarded",
      subtitle: "From Citizen to Community Hero.",
      description: "Upon completion, users instantly receive a beautifully designed digital Task Completion Certificate and earn contribution points. Accumulate points to climb from Silver → Gold → Elite rank, unlocking recognition as a top civic contributor.",
      icon: Trophy,
      gradient: "from-purple-500 to-pink-600",
      lightBg: "bg-purple-50 dark:bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-500/20",
      iconBg: "bg-purple-500",
      dotColor: "bg-purple-500",
      features: ["Digital completion certificate", "Points-based ranking system", "Silver → Gold → Elite badges"],
    },
  ];

  const stats = [
    { label: "AI-Powered", value: "Gemini", icon: Zap },
    { label: "Real-Time", value: "Live Map", icon: MapPin },
    { label: "Gamified", value: "Bounties", icon: IndianRupee },
    { label: "Community", value: "Driven", icon: Users },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full mb-6"
          >
            <Star className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">How CivicPulse Works</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight leading-tight"
          >
            Gamifying Civic
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent"> Maintenance</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            CivicPulse transforms urban infrastructure upkeep into a community-powered, incentive-driven mission.
            Report, fix, earn, repeat.
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
                >
                  <Icon className="h-4 w-4 text-emerald-500" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-emerald-500 to-purple-500 opacity-20 dark:opacity-30" />

          <div className="space-y-16 md:space-y-24">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.15 }}
                  className={`relative flex flex-col md:flex-row items-start gap-8 md:gap-16 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                    <div className={`relative h-12 w-12 rounded-full ${pillar.iconBg} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                      <div className={`absolute inset-0 rounded-full ${pillar.iconBg} animate-ping opacity-20`} />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${isEven ? 'md:pr-0' : 'md:pl-0'}`}>
                    <div className={`relative group bg-white dark:bg-slate-900/80 backdrop-blur-xl border ${pillar.borderColor} rounded-3xl p-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
                      {/* Decorative gradient blob */}
                      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${pillar.gradient} opacity-[0.04] dark:opacity-[0.08] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500`} />

                      <div className="relative">
                        {/* Step Number */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-[10px] font-black tracking-[0.3em] uppercase bg-gradient-to-r ${pillar.gradient} bg-clip-text text-transparent`}>
                            Step {pillar.step}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">
                          {pillar.title}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-4 italic">
                          {pillar.subtitle}
                        </p>

                        {/* Description */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                          {pillar.description}
                        </p>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2">
                          {pillar.features.map((feature, fIdx) => (
                            <span
                              key={fIdx}
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg ${pillar.lightBg} border ${pillar.borderColor}`}
                            >
                              <CheckCircle2 className={`h-3 w-3 opacity-60`} />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

          <div className="relative px-8 py-14 md:px-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Zap className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold text-white/90 tracking-wider uppercase">Join the Movement</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to fix your city?
            </h2>
            <p className="text-emerald-100 mb-10 max-w-xl mx-auto leading-relaxed">
              Join active citizens tracking infrastructure failures, fixing real problems, and earning real rewards. Every report makes a difference.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/report"
                className="w-full sm:w-auto bg-white text-emerald-600 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-xl flex items-center justify-center gap-2"
              >
                <Camera className="h-5 w-5" />
                Report an Issue
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tasks"
                className="w-full sm:w-auto bg-emerald-700/40 hover:bg-emerald-700/60 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Coins className="h-5 w-5 text-amber-300" />
                Browse Tasks
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
