"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../../lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Coins, MapPin, IndianRupee, UploadCloud, Loader2, ArrowLeft, CheckCircle2, ImagePlus, ShieldAlert, AlertTriangle, Zap } from 'lucide-react';
import TaskCompletionCertificate from '../../components/tasks/TaskCompletionCertificate';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [completedTask, setCompletedTask] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchActiveTasks();
  }, []);

  const fetchActiveTasks = async () => {
    setLoading(true);
    try {
      const bountiesRef = collection(db, 'bounties');
      const q = query(bountiesRef, where('status', '==', 'bounty_active'));
      const querySnapshot = await getDocs(q);

      const data = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() });
      });

      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setLoading(false);
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setAfterImage(null);
    setAfterImagePreview(null);
  };

  const handleAfterImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAfterImage(file);
    setAfterImagePreview(URL.createObjectURL(file));
  };

  const handleSubmitSolution = async () => {
    if (!afterImage || !selectedTask) return;
    if (!user) {
      alert("Please log in before submitting a solution.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert after-image to base64 data URL (no Storage needed - free plan)
      const after_image_data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(afterImage);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      // Update Firestore
      const bountyRef = doc(db, 'bounties', selectedTask.id);
      await updateDoc(bountyRef, {
        after_image_data: after_image_data,
        status: 'completed',
        completed_by: user.uid,
        completed_at: new Date().toISOString()
      });

      // Store completed task for certificate
      setCompletedTask(selectedTask);
      
      // Remove from list
      setTasks(current => current.filter(t => t.id !== selectedTask.id));
      
      // Reset selection
      setSelectedTask(null);
      setAfterImage(null);
      setAfterImagePreview(null);

      // Show certificate
      setShowCertificate(true);

    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit solution. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleCloseCertificate = () => {
    setShowCertificate(false);
    setCompletedTask(null);
  };

  const severityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10';
      case 'moderate': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10';
      default: return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 min-h-[calc(100vh-8rem)] pt-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/25">
            <Coins className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Do & Earn</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Complete tasks, earn rewards, build your community</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 rounded-xl">
          <Zap className="h-4 w-4" />
          {tasks.length} Active {tasks.length === 1 ? 'Task' : 'Tasks'}
        </div>
      </div>

      {/* Selected Task Detail View */}
      <AnimatePresence mode="wait">
        {selectedTask ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={() => { setSelectedTask(null); setAfterImage(null); setAfterImagePreview(null); }}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Task Info */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                {/* Before Image */}
                <div className="h-64 w-full bg-slate-950 relative">
                  {selectedTask.before_image_data ? (
                    <img src={selectedTask.before_image_data} alt="Issue" className="object-cover w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                      <ShieldAlert className="h-12 w-12 opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black tracking-wider px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-slate-700 dark:text-slate-200 uppercase rounded-lg shadow-lg">
                      Before
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/30">
                      <IndianRupee className="h-4 w-4" />
                      {selectedTask.rewardAmount}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase rounded-md">
                      {selectedTask.category}
                    </span>
                    {selectedTask.severity && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${severityColor(selectedTask.severity)}`}>
                        {selectedTask.severity}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{selectedTask.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{selectedTask.description}</p>
                  {selectedTask.lat && selectedTask.lng && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg inline-flex">
                      <MapPin className="h-3.5 w-3.5" />
                      GPS: {selectedTask.lat.toFixed(4)}, {selectedTask.lng.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Upload After Image */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-emerald-500" />
                  Submit Your Solution
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Upload a photo showing the resolved issue to claim your reward.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAfterImageUpload}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                    afterImagePreview
                      ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5'
                  }`}
                >
                  {afterImagePreview ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <img src={afterImagePreview} alt="After solution" className="object-cover w-full h-full rounded-xl" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-black tracking-wider px-2.5 py-1 bg-emerald-500 text-white uppercase rounded-lg shadow-lg">
                          After
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-end justify-center pb-4">
                        <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          Click to change photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <UploadCloud className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload "After" Photo</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG, PNG or WebP</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Warning Banner */}
                {!user && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">You must be logged in to submit solutions.</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-auto pt-6">
                  <button
                    onClick={handleSubmitSolution}
                    disabled={!afterImage || isSubmitting || !user}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl ${
                      afterImage && user
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-500/25 hover:-translate-y-0.5'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Submitting Solution...</>
                    ) : (
                      <><CheckCircle2 className="h-5 w-5" /> Submit Solution & Claim Reward</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ========== TASKS GRID ========== */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center flex flex-col items-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Coins className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Active Tasks</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                  There are no bounties available right now. Check back later or report an issue to help your community!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => handleSelectTask(task)}
                  >
                    {/* Before Image */}
                    <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                      {task.before_image_data ? (
                        <img
                          src={task.before_image_data}
                          alt={task.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                          <ShieldAlert className="h-10 w-10 opacity-30" />
                        </div>
                      )}
                      
                      {/* Reward Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-black shadow-lg shadow-emerald-500/30">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {task.rewardAmount}
                      </div>
                      {task.severity && (
                        <div className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm ${severityColor(task.severity)}`}>
                          {task.severity}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-[10px] font-black tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase rounded-md self-start mb-2">
                        {task.category}
                      </span>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {task.description}
                      </p>

                      {task.lat && task.lng && (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mb-4">
                          <MapPin className="h-3 w-3" />
                          GPS: {task.lat.toFixed(4)}, {task.lng.toFixed(4)}
                        </div>
                      )}

                      <div className="mt-auto">
                        <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm text-center group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-md group-hover:shadow-emerald-500/20 transition-all duration-300">
                          Accept & Solve
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Certificate Modal */}
      <TaskCompletionCertificate
        isOpen={showCertificate}
        onClose={handleCloseCertificate}
        task={completedTask}
      />
    </div>
  );
}
