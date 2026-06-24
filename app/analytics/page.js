"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
  const [data, setData] = useState({
    total: 0,
    resolved: 0,
    categoryData: [],
    severityData: []
  });
  const [loading, setLoading] = useState(true);

  // Modern UI Colors for the charts
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: bounties, error } = await supabase.from('bounties').select('*');
      
      if (!error && bounties) {
        // Calculate Top Level Stats
        const total = bounties.length;
        const resolved = bounties.filter(b => b.status === 'resolved').length;

        // Group by Category for Pie Chart
        const catCount = bounties.reduce((acc, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + 1;
          return acc;
        }, {});
        const categoryData = Object.keys(catCount).map(key => ({ name: key, value: catCount[key] }));

        // Group by Severity for Bar Chart
        const sevCount = bounties.reduce((acc, curr) => {
          acc[curr.severity] = (acc[curr.severity] || 0) + 1;
          return acc;
        }, {});
        const severityData = Object.keys(sevCount).map(key => ({ name: key, count: sevCount[key] }));

        setData({ total, resolved, categoryData, severityData });
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 h-auto min-h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <BarChart3 className="h-8 w-8 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">City Diagnostics</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time macro analysis of municipal infrastructure.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2 font-bold text-sm">
                <Activity className="h-4 w-4" /> Total Issues Reported
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{data.total}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 text-emerald-500 mb-2 font-bold text-sm">
                <TrendingUp className="h-4 w-4" /> Issues Resolved
              </div>
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{data.resolved}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 text-amber-500 mb-2 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" /> Resolution Rate
              </div>
              <div className="text-4xl font-black text-amber-600 dark:text-amber-400">
                {data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0}%
              </div>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* The Pie Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Issues by Category</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.categoryData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                      {data.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* The Bar Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Issues by Severity</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>
        </div>
      )}
    </div>
  );
}