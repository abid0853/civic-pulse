"use client";

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, deleteField, orderBy } from 'firebase/firestore';
import { ShieldCheck, XCircle, CheckCircle, Clock, MapPin, AlertTriangle, IndianRupee, Loader2, FileCheck, ClipboardList, Sparkles, Users, Award, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rewardAmounts, setRewardAmounts] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());
  const [badgeToast, setBadgeToast] = useState(null);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingReports();
    } else if (activeTab === 'reviews') {
      fetchFixReviews();
    } else if (activeTab === 'leaderboard') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchPendingReports = async () => {
    setLoading(true);
    try {
      const bountiesRef = collection(db, 'bounties');
      const q = query(bountiesRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);

      const data = [];
      querySnapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() });
      });

      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPendingReports(data);
    } catch (error) {
      console.error("Error fetching pending reports:", error);
    }
    setLoading(false);
  };

  const fetchFixReviews = async () => {
    setLoading(true);
    try {
      const bountiesRef = collection(db, 'bounties');
      const q = query(bountiesRef, where('status', 'in', ['open', 'under_review']));
      const querySnapshot = await getDocs(q);

      const data = [];
      querySnapshot.forEach(docSnap => {
        const d = docSnap.data();
        if (d.status === 'under_review' || (d.status === 'open' && d.category === 'Power Outage')) {
          data.push({ id: docSnap.id, ...d });
        }
      });

      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const profilesRef = collection(db, 'profiles');
      const querySnapshot = await getDocs(profilesRef);

      const data = [];
      querySnapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Sort by total_points descending
      data.sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleBadgeChange = async (userId, userName, newBadge) => {
    if (!newBadge) return;
    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, { badgeLevel: newBadge });

      // Update local state
      setUsers(current =>
        current.map(u => u.id === userId ? { ...u, badgeLevel: newBadge } : u)
      );

      // Show toast
      setBadgeToast(`${userName || 'User'} promoted to ${newBadge}!`);
      setTimeout(() => setBadgeToast(null), 3000);
    } catch (error) {
      console.error("Badge update error:", error);
      alert("Failed to update badge. Check console.");
    }
    setProcessingIds(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const handleRewardChange = (id, value) => {
    setRewardAmounts(prev => ({ ...prev, [id]: value }));
  };

  const handleApproveAsTask = async (id) => {
    const amount = parseInt(rewardAmounts[id]);
    if (!amount || amount <= 0) {
      alert("Please enter a valid reward amount before approving.");
      return;
    }

    setProcessingIds(prev => new Set(prev).add(id));
    try {
      const bountyRef = doc(db, 'bounties', id);
      await updateDoc(bountyRef, {
        status: 'bounty_active',
        rewardAmount: amount
      });
      setPendingReports(current => current.filter(r => r.id !== id));
    } catch (error) {
      console.error("Approval error:", error);
      alert("Database error approving task.");
    }
    setProcessingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRejectPending = async (id) => {
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      const bountyRef = doc(db, 'bounties', id);
      await updateDoc(bountyRef, { status: 'rejected' });
      setPendingReports(current => current.filter(r => r.id !== id));
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Database error rejecting report.");
    }
    setProcessingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleFixAction = async (id, action) => {
    try {
      const bountyRef = doc(db, 'bounties', id);
      const reviewToUpdate = reviews.find(r => r.id === id);
      const updateData = { status: action };
      if (action === 'open' && reviewToUpdate?.category !== 'Power Outage') {
        updateData.fix_image_data = deleteField();
      }

      await updateDoc(bountyRef, updateData);
      setReviews(current => current.filter(r => r.id !== id));
    } catch (error) {
      console.error("Action error:", error);
      alert("Database error applying action.");
    }
  };

  const severityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10';
      case 'moderate': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10';
      default: return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10';
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending Reports', icon: ClipboardList, count: pendingReports.length },
    { id: 'reviews', label: 'Fix Reviews', icon: FileCheck, count: reviews.length },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users, count: users.length },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 min-h-[calc(100vh-8rem)] pt-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage reports & assign bounties</p>
        </div>
      </div>

      {/* Hackathon Disclaimer */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
        <div className="mt-0.5">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Hackathon Deployment Notice</h4>
          <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">
            This Admin Portal is intentionally provided without authentication for ease of demonstration.
            In a production environment, this route would be secured via NextAuth.js or Supabase Auth policies.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 p-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl inline-flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-white/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-500' : ''}`} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : activeTab === 'pending' ? (
        /* ========== PENDING REPORTS TAB ========== */
        pendingReports.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Pending Reports</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">All reports have been reviewed. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {pendingReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  layout
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col"
                >
                  {/* Before Image */}
                  <div className="h-48 w-full bg-slate-950 relative border-b border-slate-200 dark:border-slate-800">
                    {report.before_image_data ? (
                      <img src={report.before_image_data} alt="Reported issue" className="object-cover w-full h-full" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No image uploaded</div>
                    )}
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Clock className="h-3 w-3" /> PENDING
                    </div>
                    {report.severity && (
                      <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${severityColor(report.severity)}`}>
                        {report.severity}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase rounded-md">
                        {report.category}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        {report.reward_points} PTS
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2">{report.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">"{report.description}"</p>

                    {report.lat && report.lng && (
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mb-4">
                        <MapPin className="h-3 w-3" /> GPS: {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                      </div>
                    )}

                    {/* Reward Amount Input */}
                    <div className="mt-auto space-y-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="number"
                          placeholder="Set reward amount (e.g., 500)"
                          min="1"
                          value={rewardAmounts[report.id] || ''}
                          onChange={(e) => handleRewardChange(report.id, e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleRejectPending(report.id)}
                          disabled={processingIds.has(report.id)}
                          className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          {processingIds.has(report.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveAsTask(report.id)}
                          disabled={processingIds.has(report.id)}
                          className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm hover:from-indigo-600 hover:to-purple-600 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                        >
                          {processingIds.has(report.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          Approve as Task
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : activeTab === 'reviews' ? (
        /* ========== FIX REVIEWS TAB ========== */
        reviews.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">All caught up!</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">No pending claims waiting for review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col"
                >
                  {/* Submitted Proof Image */}
                  <div className="h-48 w-full bg-slate-950 relative border-b border-slate-200 dark:border-slate-800">
                    {review.fix_image_data ? (
                      <img src={review.fix_image_data} alt="Fix Proof" className="object-cover w-full h-full" />
                    ) : review.category === 'Power Outage' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-500 bg-amber-500/10">
                        <AlertTriangle className="h-10 w-10 mb-2" />
                        <span className="text-sm font-bold">Grid Alert Verification</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No image data</div>
                    )}
                    <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Clock className="h-3 w-3" /> PENDING
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase rounded-md">
                        {review.category}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        {review.reward_points} PTS
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2">{review.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">"Original Request: {review.description}"</p>

                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mb-6">
                      <MapPin className="h-3 w-3" /> GPS: {review.lat.toFixed(4)}, {review.lng.toFixed(4)}
                    </div>

                    {/* Admin Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleFixAction(review.id, 'open')}
                        className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                      <button
                        onClick={() => handleFixAction(review.id, 'resolved')}
                        className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : activeTab === 'leaderboard' ? (
        /* ========== LEADERBOARD TAB ========== */
        users.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center">
            <Users className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Users Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">No registered contributors yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Contributor Rankings</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{users.length} contributors</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-6 py-3 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">Rank</th>
                    <th className="text-left px-6 py-3 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">Contributor</th>
                    <th className="text-left px-6 py-3 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">Points</th>
                    <th className="text-left px-6 py-3 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">Current Badge</th>
                    <th className="text-left px-6 py-3 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">Assign Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => {
                    const rankColors = [
                      'bg-amber-500 text-white',
                      'bg-slate-400 text-white',
                      'bg-amber-700 text-white',
                    ];
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-black ${
                            idx < 3 ? rankColors[idx] : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{u.full_name || 'Anonymous'}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{u.total_points || 0} PTS</span>
                        </td>
                        <td className="px-6 py-4">
                          {u.badgeLevel ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                              u.badgeLevel === 'Elite' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' :
                              u.badgeLevel === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                              'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              <Award className="h-3 w-3" />
                              {u.badgeLevel}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <select
                              value={u.badgeLevel || ''}
                              onChange={(e) => handleBadgeChange(u.id, u.full_name, e.target.value)}
                              disabled={processingIds.has(u.id)}
                              className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-3 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <option value="">Select...</option>
                              <option value="Silver">🥈 Silver</option>
                              <option value="Gold">🥇 Gold</option>
                              <option value="Elite">💎 Elite</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : null}

      {/* Badge Toast */}
      <AnimatePresence>
        {badgeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl shadow-2xl shadow-black/20"
          >
            <div className="p-1.5 bg-emerald-500 rounded-full">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">{badgeToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}