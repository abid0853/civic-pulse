"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Map, Hexagon, Sun, Moon, Menu, X, Trophy, Flame, BarChart3, ShieldCheck, User, Coins, Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [user, setUser] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
          if (profileDoc.exists()) {
            setUserPoints(profileDoc.data().total_points || 0);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      } else {
        setUser(null);
        setUserPoints(0);
      }
    });

    // PWA install prompt handler
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    { name: 'Live Map', path: '/', icon: Map },
    { name: 'Report Issue', path: '/report', icon: ShieldAlert },
    { name: 'Do & Earn', path: '/tasks', icon: Coins },
    { name: 'How It Works', path: '/how-it-works', icon: Flame },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Admin', path: '/admin', icon: ShieldCheck }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-200/20 dark:border-white/10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 z-50 relative">
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg border border-emerald-500/20">
              <Hexagon className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              CivicPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex space-x-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.path} className="relative px-3 py-2 rounded-full transition-colors">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </div>
                  {isActive && (
                    <motion.div layoutId="navbar-indicator" className="absolute inset-0 bg-emerald-50 dark:bg-white/10 rounded-full -z-10" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Gamification Stats & Actions */}
          <div className="flex items-center gap-3 z-50">
            {/* Gamified Points Badge */}
            {mounted && user && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{userPoints} PTS</span>
              </div>
            )}

            {/* PWA Install Button */}
            {mounted && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                title="Install CivicPulse App"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </button>
            )}

            {mounted && (
              <Link
                href={user ? "/profile" : "/login"}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={user ? "Profile Dashboard" : "Login"}
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            <button className="xl:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t border-slate-200/20 dark:border-white/10 bg-white dark:bg-slate-950 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                        ? 'bg-emerald-50 dark:bg-white/10 text-emerald-600 dark:text-white font-bold'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Install Button */}
              {mounted && deferredPrompt && (
                <button
                  onClick={() => { handleInstallClick(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Install App
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}