"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Award, PartyPopper, IndianRupee, X, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function TaskCompletionCertificate({ isOpen, onClose, task }) {
  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: '100vh',
                  x: `${Math.random() * 100}vw`,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: '-20vh',
                  rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  delay: Math.random() * 1.5,
                  ease: 'easeOut',
                }}
                className="absolute"
                style={{ left: `${Math.random() * 100}%` }}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-sm ${
                    ['bg-amber-400', 'bg-emerald-400', 'bg-indigo-400', 'bg-rose-400', 'bg-cyan-400', 'bg-purple-400'][
                      Math.floor(Math.random() * 6)
                    ]
                  }`}
                  style={{ transform: `rotate(${Math.random() * 360}deg)` }}
                />
              </motion.div>
            ))}
          </div>

          {/* Certificate Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="relative w-full max-w-lg"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 rounded-[28px] blur-lg opacity-40 animate-pulse" />

            <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Top Decorative Strip */}
              <div className="h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-500" />

              {/* Certificate Content */}
              <div className="px-8 pt-8 pb-6 text-center">
                
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
                  className="mx-auto mb-6"
                >
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full blur-xl opacity-30 animate-pulse" />
                    <div className="relative p-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-xl shadow-amber-500/30">
                      <Award className="h-10 w-10 text-white" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-1 -right-1 p-1.5 bg-emerald-500 rounded-full shadow-lg"
                    >
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-black tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400">
                      Task Completed
                    </span>
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                    Completion Certificate
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Thank you for making your community better!
                  </p>
                </motion.div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                  <PartyPopper className="h-5 w-5 text-amber-500" />
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                </div>

                {/* Task Details */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Task Solved</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {task.title}
                    </h3>
                    {task.category && (
                      <span className="inline-block mt-2 text-[10px] font-black tracking-wider px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase rounded-md">
                        {task.category}
                      </span>
                    )}
                  </div>

                  {/* Reward Highlight */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-10" />
                    <div className="relative bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Reward Earned</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <IndianRupee className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', damping: 8, stiffness: 200, delay: 0.6 }}
                          className="text-4xl font-black text-emerald-600 dark:text-emerald-400"
                        >
                          {task.rewardAmount}
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Action */}
              <div className="px-8 pb-8">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white font-bold text-sm hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 transition-all shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tasks
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
