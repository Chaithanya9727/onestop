import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  FileText,
  Loader,
  ChevronRight,
  Building2,
  Calendar,
  XCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function CandidateApplications() {
  const { get, patch } = useApi();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await get("/candidate/applications");
      setApplications(res || []);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (jobId) => {
    if(!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await patch(`/candidate/applications/${jobId}/status`, { status: "withdrawn" });
      setApplications(prev => prev.map(app => 
        app.job?._id === jobId ? { ...app, status: "withdrawn" } : app
      ));
    } catch (err) {
      console.error("Failed to withdraw", err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'shortlisted': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'hired': return 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20';
      case 'rejected': return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20';
      case 'withdrawn': return 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-white/5';
      default: return 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20';
    }
  };

  if (loading) {
     return (
       <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]">
         <Loader size={40} className="animate-spin text-blue-500" />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors" />
       </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
               <Briefcase size={14} /> Career Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Applications</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
              Track and manage all your job applications in one place.
            </p>
          </div>
          <Link to="/jobs" className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg flex items-center gap-2 border border-slate-200 dark:border-transparent">
            Find More Jobs <ChevronRight size={18} />
          </Link>
        </motion.div>

        {applications.length === 0 ? (
           <div className="bg-white dark:bg-[#0f1014] rounded-3xl p-16 text-center border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 dark:from-blue-500/5 to-transparent opacity-50" />
              <div className="relative z-10">
                 <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/10">
                    <Briefcase size={40} className="text-slate-400 dark:text-slate-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No applications yet</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                   You haven't applied to any jobs yet. Browse our curated opportunities and take the next step in your career!
                 </p>
                 <Link to="/jobs" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 inline-flex items-center gap-2">
                   Browse Opportunities <ChevronRight size={18} />
                 </Link>
              </div>
           </div>
        ) : (
          <div className="space-y-4">
             <AnimatePresence>
             {applications.map((app, index) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-[#0f1014] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-lg dark:shadow-none hover:shadow-2xl"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-50 dark:from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                   
                   <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                      {/* Job Info */}
                      <div className="flex-1">
                         <div className="flex items-start justify-between md:hidden mb-4">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(app.status || 'applied')}`}>
                               {app.status || 'Applied'}
                             </span>
                         </div>
                         
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                           {app.job?.title || "Unknown Job Title"}
                         </h3>
                         
                         <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <span className="flex items-center gap-2">
                               <Building2 size={16} className="text-slate-400 dark:text-slate-500" />
                               {app.job?.recruiter?.orgName || "Company Confidential"}
                            </span>
                            <span className="flex items-center gap-2">
                               <MapPin size={16} className="text-slate-400 dark:text-slate-500" />
                               {app.job?.location || "Remote"}
                            </span>
                            <span className="flex items-center gap-2">
                               <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
                               Applied {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                         </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-3 min-w-[150px]">
                         <span className={`hidden md:inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusColor(app.status || 'applied')}`}>
                           {app.status || 'Applied'}
                         </span>
                         
                         <div className="flex items-center gap-3 mt-auto">
                            {(!app.status || app.status === 'applied') && (
                               <button 
                                 onClick={() => handleWithdraw(app.job?._id)}
                                 className="px-4 py-2 text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                               >
                                 Withdraw
                               </button>
                            )}
                            <Link to={`/jobs/${app.job?._id}`} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-2">
                               Details <ChevronRight size={14} />
                            </Link>
                         </div>
                      </div>
                   </div>
                </motion.div>
             ))}
             </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
