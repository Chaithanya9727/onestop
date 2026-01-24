import React, { useEffect, useState, useMemo } from "react";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { 
  Users, Search, Eye, Check, X, Mail, Briefcase, Calendar, 
  Award, MessageSquare, AlertCircle, Loader, Filter, FileText
} from "lucide-react";

export default function RecruiterApplications() {
  const { id } = useParams();
  const { get, patch } = useApi();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Action State
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState(null); 
  const [customMessage, setCustomMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Celebration State
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = id ? `/recruiter/jobs/${id}/applications` : "/recruiter/applications";
      const res = await get(url);
      const apps = Array.isArray(res) ? res : (res.applications || []);
      apps.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
      setApplications(apps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmDialog = (app, type) => {
    let message = "";
    if (type === 'rejected') {
        message = `Dear ${app.candidate?.name},\n\nThank you for your interest in the ${app.job?.title} position. \n\nWe have reviewed your application and, unfortunately, we will not be moving forward with your candidacy at this time. We appreciate your time and wish you the best in your future endeavors.\n\nBest regards,\nHiring Team`;
    }
    setCustomMessage(message);
    setConfirmDialog({ 
      type, 
      appId: app._id, 
      candidateName: app.candidate?.name 
    });
  };

  const executeAction = async () => {
    if (!confirmDialog) return;
    
    setActionLoading(true);
    try {
      await patch(`/recruiter/applications/${confirmDialog.appId}/status`, { 
        status: confirmDialog.type,
        customMessage: customMessage
      });
      
      setApplications(prev => prev.map(app => 
         app._id === confirmDialog.appId ? { ...app, status: confirmDialog.type } : app
      ));
      
      if (selectedApp?._id === confirmDialog.appId) {
        setSelectedApp(prev => ({ ...prev, status: confirmDialog.type }));
      }

      if (confirmDialog.type === 'hired') {
         setShowConfetti(true);
         setTimeout(() => setShowConfetti(false), 5000);
      }

    } catch (err) {
       alert("Failed to perform action");
    } finally {
      setActionLoading(false);
      setConfirmDialog(null);
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        app.candidate?.name?.toLowerCase().includes(search.toLowerCase()) || 
        app.candidate?.email?.toLowerCase().includes(search.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, search, statusFilter]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'shortlisted': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20';
      case 'hired': return 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/20';
      case 'rejected': return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen relative pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <span className="p-3 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl"><Users size={28} /></span>
          Candidate Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 ml-1 text-lg">
          Review applications, shortlist candidates, and make hiring decisions.
        </p>
      </motion.div>

      {/* Confetti Overlay */}
      <AnimatePresence>
        {showConfetti && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <motion.div 
                 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                 className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2rem] shadow-2xl text-center border-4 border-yellow-400"
              >
                 <div className="text-8xl mb-4">🎉</div>
                 <h2 className="text-3xl font-black text-slate-800 dark:text-white">CANDIDATE HIRED!</h2>
                 <p className="text-slate-500 dark:text-slate-300 font-bold mt-2">Great addition to the team.</p>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden min-h-[600px] flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col xl:flex-row justify-between gap-6 bg-slate-50/50 dark:bg-white/5">
           {/* Filters */}
           <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 items-center no-scrollbar">
             <div className="px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 mr-2">
                <Filter className="text-slate-400 dark:text-slate-500" size={18} />
             </div>
             {['all', 'pending', 'shortlisted', 'hired', 'rejected'].map(s => (
               <button
                 key={s}
                 onClick={() => setStatusFilter(s)}
                 className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap border
                   ${statusFilter === s 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                      : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/20'
                   }`}
               >
                 {s}
               </button>
             ))}
           </div>

           {/* Search */}
           <div className="relative w-full xl:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
             <input 
               type="text" placeholder="Search candidate..." 
               value={search} onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500 outline-none bg-white dark:bg-[#1a1a1a] shadow-sm transition-all text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400"
             />
           </div>
        </div>

        {/* Content */}
        {loading ? (
           <div className="flex-1 flex justify-center items-center"><Loader className="animate-spin text-blue-600" size={40} /></div>
        ) : filteredApps.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-12">
             <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-full mb-6 border border-slate-100 dark:border-white/5"><Users size={64} className="opacity-20 text-slate-500 dark:text-white" /></div>
             <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">No applications found</p>
             <p className="text-slate-500 dark:text-slate-500 mt-2">Try adjusting your filters or check back later.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-white/5">
                   <th className="px-8 py-5">Candidate</th>
                   <th className="px-8 py-5">Status</th>
                   <th className="px-8 py-5">AI Match</th>
                   <th className="px-8 py-5">Applied Date</th>
                   <th className="px-8 py-5 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                 {filteredApps.map(app => (
                   <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                     <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 text-lg">
                             {app.candidate?.name?.charAt(0)}
                          </div>
                          <div>
                             <div className="font-bold text-slate-800 dark:text-white text-base">{app.candidate?.name}</div>
                             <div className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">{app.job?.title}</div>
                          </div>
                       </div>
                     </td>
                     <td className="px-8 py-5">
                       <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(app.status)}`}>
                         {app.status || "Pending"}
                       </span>
                     </td>
                     <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5 w-32">
                           <div className="flex items-center justify-between">
                              <span className={`text-base font-black ${
                                 (app.atsScore || 0) >= 80 ? 'text-green-600 dark:text-green-400' : 
                                 (app.atsScore || 0) >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'
                              }`}>
                                 {app.atsScore || 0}%
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{app.atsVerdict || 'Analysis'}</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${app.atsScore || 0}%` }}
                                 className={`h-full rounded-full ${
                                    (app.atsScore || 0) >= 80 ? 'bg-green-500' : 
                                    (app.atsScore || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                 }`} 
                              />
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium">
                       <div className="flex items-center gap-2">
                         <Calendar size={14} className="opacity-70" />
                         {new Date(app.createdAt).toLocaleDateString()}
                       </div>
                     </td>
                     <td className="px-8 py-5 text-right">
                       <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setSelectedApp(app)} className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-blue-400 dark:hover:border-white/30 transition-all shadow-sm" title="View Application"><Eye size={18} /></button>
                          {app.resumeUrl && (
                            <button 
                              onClick={() => window.open(app.resumeUrl, "_blank")}
                              title="View Resume"
                              className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                            >
                              <FileText size={18} />
                            </button>
                          )}
                         {(!app.status || app.status === 'pending') && (
                           <>
                             <button onClick={() => openConfirmDialog(app, 'shortlisted')} className="p-2.5 text-blue-600 bg-transparent border border-blue-200 dark:border-blue-500/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all shadow-sm" title="Shortlist"><Check size={18} /></button>
                             <button onClick={() => openConfirmDialog(app, 'rejected')} className="p-2.5 text-red-600 bg-transparent border border-red-200 dark:border-red-500/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm" title="Reject"><X size={18} /></button>
                           </>
                         )}
                         {app.status === 'shortlisted' && (
                            <button onClick={() => openConfirmDialog(app, 'hired')} className="px-4 py-2 text-xs font-bold text-white bg-green-600 border border-green-500 rounded-xl hover:bg-green-700 hover:shadow-lg transition-all shadow-sm flex items-center gap-2">
                               <Award size={14} /> HIRE
                            </button>
                         )}
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] overflow-hidden shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-white/10">
               <div className="bg-slate-900 text-white p-8 relative overflow-hidden shrink-0">
                  <div className="relative z-10 flex justify-between items-start">
                     <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                           {selectedApp.candidate?.name?.charAt(0)}
                        </div>
                        <div>
                           <h2 className="text-3xl font-black mb-1 tracking-tight">{selectedApp.candidate?.name}</h2>
                           <p className="text-slate-400 flex items-center gap-2 text-sm font-medium bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5"><Mail size={14} /> {selectedApp.candidate?.email}</p>
                        </div>
                     </div>
                     <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 shadow-lg ${selectedApp.status === 'hired' ? 'bg-green-500 text-white' : 'bg-white/10 text-white'}`}>
                        {selectedApp.status || "PENDING"}
                     </div>
                  </div>
                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/30 rounded-full blur-[80px] pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
               </div>

               <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="md:col-span-2 space-y-8">
                        <div>
                           <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Applied Position</h4>
                           <div className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3 p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg"><Briefcase size={20} /></div>
                              {selectedApp.job?.title}
                           </div>
                        </div>
                        
                        <div>
                           <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Cover Letter</h4>
                           <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic relative">
                              <span className="absolute top-4 left-4 text-4xl text-slate-200 dark:text-white/5 font-serif font-black">"</span>
                              <p className="relative z-10 px-4">{selectedApp.coverLetter || "No cover letter provided."}</p>
                           </div>
                        </div>

                        {selectedApp.resumeUrl && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Resume</h4>
                            <button 
                              onClick={() => window.open(selectedApp.resumeUrl, "_blank")}
                              className="w-full py-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center gap-2 transition-all group"
                            >
                              <div className="p-1 bg-white dark:bg-blue-500 rounded-lg group-hover:scale-110 transition-transform"><FileText size={16} /></div> View Resume Document
                            </button>
                          </div>
                        )}
                     </div>
                     
                     <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Actions</h4>
                        {selectedApp.status !== 'hired' && (
                           <div className="flex flex-col gap-3 w-full">
                               {selectedApp.status === 'pending' && (
                                  <button onClick={() => openConfirmDialog(selectedApp, 'shortlisted')} className="w-full py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all shadow-sm">
                                     Shortlist Candidate
                                  </button>
                               )}
                               
                               <button onClick={() => openConfirmDialog(selectedApp, 'hired')} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-green-500">
                                  <Award /> HIRE NOW
                               </button>

                               {selectedApp.status !== 'rejected' && (
                                   <button onClick={() => openConfirmDialog(selectedApp, 'rejected')} className="w-full py-3 bg-white dark:bg-white/5 text-red-600 dark:text-red-400 border border-red-100 dark:border-white/10 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/20 transition-colors shadow-sm">
                                       Reject Application
                                   </button>
                               )}
                           </div>
                        )}
                        {selectedApp.status === 'hired' && (
                           <div className="p-6 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-2xl text-center">
                              <Award size={48} className="mx-auto text-green-500 mb-2"/>
                              <p className="font-bold text-green-700 dark:text-green-400">Successfully Hired</p>
                              <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-1">Action completed</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
               
               <div className="p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a1a] text-center shrink-0">
                  <button onClick={() => setSelectedApp(null)} className="text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-white text-sm transition-colors">Close Details</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CONFIRM ACTION MODAL */}
      <AnimatePresence>
        {confirmDialog && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl border border-slate-200 dark:border-white/10">
                 <div className="text-5xl mb-6">
                    {confirmDialog?.type === 'hired' ? '🤝' : confirmDialog?.type === 'shortlisted' ? '📝' : '❌'}
                 </div>
                 <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 capitalize">{confirmDialog?.type} Candidate?</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                    Are you sure you want to mark <strong>{confirmDialog?.candidateName}</strong> as <span className="uppercase font-bold text-slate-800 dark:text-white">{confirmDialog?.type}</span>?
                 </p>
                 <textarea
                    rows={3}
                    placeholder="Add a note (optional)..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500/50 mb-6 text-slate-800 dark:text-white placeholder-slate-400"
                 />
                 <div className="flex gap-3">
                    <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
                    <button onClick={executeAction} disabled={actionLoading} className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors shadow-lg ${confirmDialog?.type === 'hired' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : confirmDialog?.type === 'rejected' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
                       {actionLoading ? <Loader className="animate-spin mx-auto" size={20} /> : "Confirm"}
                    </button>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
