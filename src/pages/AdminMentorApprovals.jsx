import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import {
   CheckCircle, XCircle, GraduationCap, Loader2, Mail, Briefcase, Award, Shield,
   User, ExternalLink, ArrowRight, Zap, Target, Star, ShieldCheck, AlertCircle, FileText, Linkedin, Search, Globe
} from "lucide-react";

export default function AdminMentorApprovals() {
   const { role } = useAuth();
   const { get, put } = useApi();
   const toast = useToast();
   const showToast = toast?.showToast || (() => { });

   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [actionLoading, setActionLoading] = useState(null);

   useEffect(() => {
      loadRequests();
   }, []);

   const loadRequests = async () => {
      setLoading(true);
      try {
         const data = await get("/mentor/requests");
         setRequests(data.requests || []);
      } catch (err) {
         console.error(err);
         // showToast("Failed to fetch mentor requests", "error");
      } finally {
         setLoading(false);
      }
   };

   const handleAction = async (id, actionType) => {
      try {
         setActionLoading(id);
         await put(`/mentor/${actionType}/${id}`);
         // showToast(`Mentor ${actionType}d successfully`, "success");
         loadRequests();
      } catch (err) {
         console.error(err);
         // showToast(`Failed to ${actionType} mentor`, "error");
      } finally {
         setActionLoading(null);
      }
   };

   if (loading) return (
      <div className="flex flex-col justify-center items-center h-[60vh] transition-colors">
         <Loader2 className="animate-spin text-violet-600 mb-4" size={48} />
         <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Filtering Knowledge Sources...</p>
      </div>
   );

   if (role !== "admin" && role !== "superadmin") {
      return (
         <div className="flex flex-col items-center justify-center py-40">
            <ShieldCheck size={64} className="text-red-500 mb-6 opacity-30 animate-pulse" />
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Segment Exhausted</h2>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Admin access only. Please authenticate.</p>
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24 relative overflow-hidden">
         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100 dark:bg-violet-600/5 rounded-full blur-[120px] transition-colors" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-100 dark:bg-fuchsia-600/5 rounded-full blur-[120px] transition-colors" />
         </div>

         {/* Header */}
         <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 w-fit rounded-full">
                  <Star size={14} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">Elite Guru Network</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  Mentor <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 text-glow-violet">Curator</span>
               </h1>
               <p className="text-slate-500 dark:text-slate-400 font-medium text-lg font-serif italic max-w-2xl">Hand-picking the architects of tomorrow to direct the talent of today.</p>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-sm">
               <Zap size={16} className="text-amber-500" />
               <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Awaiting Verification: {requests.length}</span>
            </div>
         </motion.div>

         {/* Stats Bar */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
               { label: "Global Applications", val: requests.length, icon: Target, color: "text-violet-500" },
               { label: "Trust Score Average", val: "94.2%", icon: Shield, color: "text-emerald-500" },
               { label: "Vetting Latency", val: "1.2h", icon: Zap, color: "text-amber-500" },
            ].map((s, i) => (
               <div key={i} className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between group cursor-default">
                  <div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{s.label}</span>
                     <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.val}</span>
                  </div>
                  <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 ${s.color}`}>
                     <s.icon size={20} />
                  </div>
               </div>
            ))}
         </div>

         {/* Request Feed */}
         {requests.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#0f1014] rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5 transition-colors">
               <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <GraduationCap size={40} className="text-slate-200 dark:text-white/5" />
               </div>
               <p className="text-slate-400 dark:text-slate-500 font-black text-xl uppercase tracking-widest text-center px-6">The Curator's Table is Clear</p>
               <p className="text-slate-500 dark:text-slate-600 font-medium mt-2">No new wisdom submissions detected.</p>
            </motion.div>
         ) : (
            <div className="grid gap-8">
               <AnimatePresence>
                  {requests.map((req) => (
                     <motion.div
                        key={req._id}
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-[#0f1014] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden hover:border-violet-500/30 transition-all group relative"
                     >
                        <div className="p-10 flex flex-col lg:flex-row gap-12">
                           {/* Guru Avatar Section */}
                           <div className="flex-shrink-0 flex flex-col items-center gap-6">
                              <div className="relative group/avatar">
                                 <div className="w-32 h-32 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-violet-500/30 group-hover:scale-105 transition-transform overflow-hidden">
                                    {req.name?.charAt(0) || <User size={48} />}
                                 </div>
                                 <div className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-black rounded-2xl shadow-xl border-4 border-slate-50 dark:border-[#0f1014]">
                                    <ShieldCheck size={20} className="text-violet-500" />
                                 </div>
                              </div>
                              <div className="px-4 py-2 bg-slate-900 dark:bg-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white dark:text-black shadow-lg">
                                 Grade: Expert
                              </div>
                           </div>

                           {/* Insight Core */}
                           <div className="flex-grow space-y-8">
                              <div>
                                 <div className="flex items-center gap-4 mb-2">
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">{req.name}</h3>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 mt-2 hidden md:block"></div>
                                 </div>
                                 <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 lowercase text-lg">
                                    <Mail size={18} className="text-violet-500" /> {req.email}
                                 </p>
                              </div>

                              <div className="grid md:grid-cols-2 gap-6">
                                 <div className="p-6 bg-slate-50 dark:bg-white/[0.03] rounded-3xl border border-slate-100 dark:border-white/5 group/stat">
                                    <div className="flex items-center gap-3 mb-3">
                                       <Award size={20} className="text-violet-600 dark:text-violet-400 group-hover/stat:rotate-12 transition-transform" />
                                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Expertise</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{req.mentorProfile?.expertise || "Universal Intel"}</p>
                                 </div>
                                 <div className="p-6 bg-slate-50 dark:bg-white/[0.03] rounded-3xl border border-slate-100 dark:border-white/5 group/stat">
                                    <div className="flex items-center gap-3 mb-3">
                                       <Briefcase size={20} className="text-fuchsia-600 dark:text-fuchsia-400 group-hover/stat:rotate-12 transition-transform" />
                                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time-In-Service</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{req.mentorProfile?.experience || "0"}+ Solar Cycles</p>
                                 </div>
                              </div>

                              <div className="p-8 bg-violet-600/[0.03] dark:bg-white/[0.02] rounded-[2.5rem] border border-violet-100 dark:border-white/5 relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Zap size={64} className="text-violet-500" />
                                 </div>
                                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500 block mb-4">Transmission Bio</span>
                                 <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic text-lg relative z-10">
                                    "{req.mentorProfile?.bio || "Silence is the ultimate wisdom. This expert chooses to demonstrate rather than describe."}"
                                 </p>
                              </div>
                           </div>

                           {/* Command Center */}
                           <div className="flex flex-col justify-center gap-4 min-w-[240px]">
                              <button
                                 onClick={() => handleAction(req._id, "approve")}
                                 disabled={actionLoading === req._id}
                                 className="w-full py-6 bg-violet-600 text-white rounded-[2rem] text-sm font-black hover:bg-violet-700 transition-all shadow-2xl shadow-violet-500/40 flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50 group/btn active:scale-95"
                              >
                                 {actionLoading === req._id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                 Onboard Guru
                                 <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                              <button
                                 onClick={() => handleAction(req._id, "reject")}
                                 disabled={actionLoading === req._id}
                                 className="w-full py-6 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 text-rose-600 dark:text-rose-400 rounded-[2rem] text-sm font-black hover:bg-rose-100 transition-all uppercase tracking-widest disabled:opacity-50 active:scale-95"
                              >
                                 {actionLoading === req._id ? <Loader2 className="animate-spin" size={20} /> : <XCircle size={20} />} Purge Submission
                              </button>
                              <div className="mt-6 flex flex-col gap-3">
                                 <div className="grid grid-cols-2 gap-3">
                                    {req.mentorProfile?.documents?.resume && (
                                       <a href={req.mentorProfile.documents.resume} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 hover:border-indigo-500/30 transition-all group/resume">
                                          <FileText size={14} className="group-hover/resume:scale-110 transition-transform" /> Resume
                                       </a>
                                    )}
                                    {req.mentorProfile?.socials?.linkedin && (
                                       <a href={req.mentorProfile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0077b5]/10 rounded-2xl border border-[#0077b5]/20 text-[10px] font-black uppercase tracking-widest text-[#0077b5] hover:bg-[#0077b5]/20 transition-all group/li">
                                          <Linkedin size={14} className="group-hover/li:scale-110 transition-transform" /> LinkedIn
                                       </a>
                                    )}
                                 </div>

                                 {/* Advanced OSINT Intelligence Console */}
                                 <div className="bg-[#0b0c15] rounded-2xl p-4 border border-slate-800/50 relative overflow-hidden group/intel">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600/10 rounded-full blur-2xl group-hover/intel:bg-violet-600/20 transition-all pointer-events-none" />

                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 border-b border-white/5 pb-2">
                                       <span>Deep Intel Protocol</span>
                                       <ShieldCheck size={12} className="text-emerald-500 animate-pulse" />
                                    </div>

                                    <div className="space-y-1">
                                       <a href={`https://www.google.com/search?q="${encodeURIComponent(req.name)}" "${encodeURIComponent(req.email)}"`} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center gap-3 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors group/link">
                                          <Globe size={14} className="text-indigo-500 group-hover/link:text-indigo-400" />
                                          <span>Digital Footprint Analysis</span>
                                       </a>

                                       <a href={`https://www.google.com/search?q="${encodeURIComponent(req.name)}" site:linkedin.com OR site:github.com OR site:behance.net`} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center gap-3 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors group/link">
                                          <Search size={14} className="text-blue-500 group-hover/link:text-blue-400" />
                                          <span>Professional Attribution</span>
                                       </a>

                                       <a href={`https://www.google.com/search?q="${encodeURIComponent(req.name)}" (scam OR fraud OR arrest OR court OR complaint)`} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center gap-3 text-[11px] font-bold text-slate-400 hover:text-rose-200 hover:bg-rose-500/10 p-2 rounded-lg transition-colors group/link">
                                          <AlertCircle size={14} className="text-rose-600 group-hover/link:text-rose-500" />
                                          <span>Reputation & Risk Scan</span>
                                       </a>
                                    </div>
                                 </div>
                              </div>
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

