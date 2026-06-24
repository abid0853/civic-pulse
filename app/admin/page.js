"use client";

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase/config';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { ShieldCheck, XCircle, CheckCircle, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const bountiesRef = collection(db, 'bounties');
      // Note: Ordering by created_at with a where clause requires a composite index in Firestore.
      // We will sort client-side to avoid requiring manual index creation for the hackathon demo.
      // Fetch both under_review and open to catch Power Outages which don't need a user fix proof
      const q = query(bountiesRef, where('status', 'in', ['open', 'under_review']));
      const querySnapshot = await getDocs(q);

      const data = [];
      querySnapshot.forEach(doc => {
        const d = doc.data();
        // Admins review ALL standard bounties that are under_review, AND Power Outages that are open
        if (d.status === 'under_review' || (d.status === 'open' && d.category === 'Power Outage')) {
          data.push({ id: doc.id, ...d });
        }
      });

      // Client-side sort descending by created_at
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    // action: 'resolved' (Approve) or 'open' (Reject)
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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-8rem)] pt-24">

      <div className="flex items-center gap-3 mb-8">
        {/* ... existing header code ... */}
      </div>

      {/* 2. ADD THE DISCLAIMER BLOCK HERE */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <div className="mt-0.5">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-800">Hackathon Deployment Notice</h4>
          <p className="text-xs text-amber-700 mt-0.5">
            This Admin Portal is intentionally provided without authentication for ease of demonstration.
            In a production environment, this route would be secured via NextAuth.js or Supabase Auth policies.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : reviews.length === 0 ? (
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
                      onClick={() => handleAction(review.id, 'open')}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleAction(review.id, 'resolved')}
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
      )}
    </div>
  );
}