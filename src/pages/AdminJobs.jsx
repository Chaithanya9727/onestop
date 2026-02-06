import React, { useEffect, useState, useMemo } from "react";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import {
   ShieldCheck, Search, Eye, Check, X, Trash2, Briefcase, Users, Loader, Filter,
   TrendingUp, Clock, MapPin, DollarSign, Building2, CheckCircle, ExternalLink, AlertCircle
} from "lucide-react";

export default function AdminJobs() {
   const { get, patch, del } = useApi();

   const [jobs, setJobs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [actionLoading, setActionLoading] = useState(null);
   const [search, setSearch] = useState("");
   const [filter, setFilter] = useState("pending");
   const [viewJob, setViewJob] = useState(null);

   const fetchJobs = async () => {
      setLoading(true);
      try {
         const res = await get("/admin/jobs");
         const list = res || [];
         setJobs(list);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchJobs();
   }, []);

   const stats = useMemo(() => ({
      total: jobs.length,
      active: jobs.filter(j => j.status === 'open' || j.status === 'active' || j.status === 'approved').length,
      pending: jobs.filter(j => j.status === 'pending').length,
      closed: jobs.filter(j => j.status === 'closed' || j.status === 'rejected').length,
   }), [jobs]);

   const handleAction = async (jobId, action) => {
      if (!window.confirm(`Are you sure you want to ${action} this job?`)) return;

      setActionLoading(jobId);
      try {
         await patch(`/admin/jobs/${jobId}/approve`, { approved: action === 'approve' });
         setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: action === 'approve' ? 'approved' : 'rejected' } : j));
         if (viewJob?._id === jobId) setViewJob(prev => ({ ...prev, status: action === 'approve' ? 'approved' : 'rejected' }));
      } catch (err) {
         console.error("Action failed:", err);
      } finally {
         setActionLoading(null);
      }
   };

   const handleDelete = async (jobId) => {
      if (!window.confirm("⚠️ ARE YOU SURE? \n\nThis will PERMANENTLY DELETE this job and all associated applications from the database.\nThis action cannot be undone.")) return;

      setActionLoading(jobId);
      try {
         await del(`/admin/jobs/${jobId}`);

         setJobs(prev => prev.filter(j => j._id !== jobId));
         if (viewJob?._id === jobId) setViewJob(null);
      } catch (err) {
         console.error("Delete failed:", err);
      } finally {
         setActionLoading(null);
      }
   };

   const filteredJobs = useMemo(() => {
      return jobs.filter(job => {
         const matchesSearch = job.title?.toLowerCase().includes(search.toLowerCase()) ||
            job.postedBy?.name?.toLowerCase().includes(search.toLowerCase());

         if (filter === 'all') return matchesSearch;
         if (filter === 'pending') return matchesSearch && job.status === 'pending';
         if (filter === 'active') return matchesSearch && (job.status === 'approved' || job.status === 'active' || job.status === 'open');
         if (filter === 'closed') return matchesSearch && (job.status === 'closed' || job.status === 'rejected');

         return matchesSearch;
      });
   }, [jobs, search, filter]);

   const StatCard = ({ label, val, color, icon: Icon }) => (
      <div className={`p-6 bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all flex items-center justify-between group overflow-hidden relative`}>
         <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
            <Icon size={100} />
         </div>
         <div className="relative z-10">
            <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-2">{label}</span>
            <span className={`text-4xl font-black tracking-tight dark:text-white`}>{val}</span>
         </div>
         <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 ${color} relative z-10`}>
            <Icon size={24} />
         </div>
      </div>
   );

   if (loading) return (
      <div className="flex flex-col justify-center items-center h-[60vh] transition-colors">
         <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Scanning Corporate Offerings...</p>
      </div>
   );

   return (
      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24 relative">
         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px] transition-colors" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/5 rounded-full blur-[120px] transition-colors" />
         </div>

         {/* Header */}
         <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 w-fit rounded-full">
                  <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Moderation Terminal</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-glow-blue">Oversight</span>
               </h1>
               <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2 font-serif italic">Guardian of the platform's opportunity ecosystem.</p>
            </div>

            <div className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-sm">
               <TrendingUp size={16} className="text-emerald-500" />
               <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Global Listings: {stats.total}</span>
            </div>
         </motion.div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard label="Total Submissions" val={stats.total} color="text-slate-500" icon={Briefcase} />
            <StatCard label="Pending Review" val={stats.pending} color="text-amber-500" icon={Clock} />
            <StatCard label="Approved & Active" val={stats.active} color="text-emerald-500" icon={CheckCircle} />
            <StatCard label="Closed / Rejected" val={stats.closed} color="text-rose-500" icon={X} />
         </div>

         {/* Filtering UI */}
         <div className="mb-8 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
               {['pending', 'active', 'closed', 'all'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-white text-blue-600 dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>
                     {f}
                  </button>
               ))}
            </div>
            <div className="relative w-full md:w-96 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
               <input type="text" placeholder="Filter by role or recruiter..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 placeholder:font-medium" />
            </div>
         </div>

         {/* Main List */}
         {filteredJobs.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#0f1014] rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5 transition-colors">
               <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Briefcase size={40} className="text-slate-200 dark:text-white/5" />
               </div>
               <p className="text-slate-400 dark:text-slate-500 font-black text-xl uppercase tracking-widest">The Queue is Empty</p>
               <p className="text-slate-500 dark:text-slate-600 font-medium mt-2">No jobs match your current selection.</p>
            </motion.div>
         ) : (
            <div className="grid gap-6">
               <AnimatePresence>
                  {filteredJobs.map((job) => (
                     <motion.div
                        key={job._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-[#0f1014] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-blue-500/20 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group relative overflow-hidden"
                     >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                           <div className="flex-1 flex gap-6 items-start">
                              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                                 <Building2 size={32} />
                              </div>
                              <div className="space-y-2">
                                 <div className="flex items-center gap-3">
                                    <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                                       ${job.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' :
                                          job.status === 'approved' || job.status === 'active' || job.status === 'open' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                                             'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20'}`}>
                                       {job.status}
                                    </span>
                                 </div>
                                 <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest lowercase">
                                    <span className="flex items-center gap-2 text-indigo-500 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg">{job.postedBy?.orgName || job.postedBy?.name || "Independent"}</span>
                                    <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {job.location}</span>
                                    <span className="flex items-center gap-2 text-emerald-500"><DollarSign size={14} /> {job.salary || "Disclosed on req."}</span>
                                    <span className="flex items-center gap-2 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 uppercase text-[9px]">{job.type}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                              <button onClick={() => setViewJob(job)} className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20" title="View Dossier">
                                 <Eye size={24} />
                              </button>

                              {job.status === 'pending' && (
                                 <>
                                    <button onClick={() => handleAction(job._id, 'approve')} disabled={actionLoading === job._id}
                                       className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 flex items-center gap-2 text-sm uppercase tracking-widest disabled:opacity-50 transition-all active:scale-95">
                                       {actionLoading === job._id ? <Loader className="animate-spin" size={18} /> : <Check size={18} />} Approve Listing
                                    </button>
                                    <button onClick={() => handleAction(job._id, 'reject')} disabled={actionLoading === job._id}
                                       className="px-8 py-4 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 font-black rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-500/10 flex items-center gap-2 text-sm uppercase tracking-widest transition-all">
                                       {item.actionLoading === job._id ? <Loader className="animate-spin" size={18} /> : <X size={18} />} Decline
                                    </button>
                                 </>
                              )}

                              {job.status !== 'pending' && (
                                 <button onClick={() => handleDelete(job._id)} disabled={actionLoading === job._id} className="p-4 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20" title="Purge Record">
                                    {actionLoading === job._id ? <Loader className="animate-spin" size={24} /> : <Trash2 size={24} />}
                                 </button>
                              )}
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         )}

         {/* Dossier Modal */}
         <AnimatePresence>
            {viewJob && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={() => setViewJob(null)}>
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                     onClick={e => e.stopPropagation()}
                     className="bg-white dark:bg-[#0f1014] rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-white/10 relative p-12">

                     <button onClick={() => setViewJob(null)} className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all">
                        <X size={24} />
                     </button>

                     <div className="mb-10">
                        <div className="flex items-center gap-4 mb-3 px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 w-fit rounded-lg">
                           <Briefcase size={14} className="text-blue-600" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Opportunity Brief</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-[0.9]">{viewJob.title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mt-4 text-lg border-l-4 border-indigo-600 pl-4 py-1">
                           Posted by <span className="text-indigo-600 font-black">{viewJob.postedBy?.orgName || viewJob.postedBy?.name}</span> • {new Date(viewJob.createdAt).toLocaleDateString()}
                        </p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col gap-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} /> Compensation Model</p>
                           <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{viewJob.salary || "Not Disclosed"}</p>
                        </div>
                        <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col gap-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> Deployment Hub</p>
                           <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{viewJob.location}</p>
                        </div>
                     </div>

                     <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14} /> Role Intelligence</h4>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-inner">
                           {viewJob.description}
                        </div>
                     </div>

                     {viewJob.status === 'pending' && (
                        <div className="flex gap-4 pt-10 border-t border-slate-100 dark:border-white/5">
                           <button onClick={() => handleAction(viewJob._id, 'approve')} className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02]">
                              <CheckCircle size={20} /> Authorize Listing
                           </button>
                           <button onClick={() => handleAction(viewJob._id, 'reject')} className="flex-1 py-5 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 font-black rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 uppercase tracking-widest transition-all">
                              Decline
                           </button>
                        </div>
                     )}
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

      </div>
   );
}

