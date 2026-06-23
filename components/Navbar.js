"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, Map, Trophy, Hexagon, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Map },
    { name: 'Report Issue', path: '/report', icon: ShieldAlert },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <Hexagon className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              CivicPulse
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.path} className="relative px-4 py-2 rounded-md transition-colors">
                  <div className={`flex items-center gap-2 text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </div>
                  {/* Animated Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Status, Theme & Bounty Points */}
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Sun className={`h-5 w-5 transition-all absolute ${theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                <Moon className={`h-5 w-5 transition-all ${theme === 'light' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
              </button>
            )}
            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 shadow-sm">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                <span className="text-slate-900 text-xs font-bold font-mono">C</span>
              </div>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">1,250 pts</span>
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
}