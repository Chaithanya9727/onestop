import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, FileText, CalendarDays, TrendingUp, CheckCircle, Clock, AlertTriangle, ChevronRight, PlusCircle } from "lucide-react";
import useApi from "../hooks/useApi";
import { useNavigate } from "react-router-dom";

export default function RecruiterDashboard() {
  const { get } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recruiterData, setRecruiterData] = useState({});
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        const profileRes = await get("/profile/me");
        const statsRes = await get("/recruiter/stats");
        setRecruiterData(profileRes.data);
        setStats(statsRes.data || {});
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="text-center p-8 bg-white dark:bg-black/40 text-red-500 dark:text-red-400 rounded-3xl border border-red-500/20 max-w-lg mx-auto backdrop-blur-xl shadow-xl">
          <AlertTriangle className="mx-auto mb-4" size={48} />
          <p className="font-bold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, value, label, color, bg, border }) => (
    <motion.div 
      whileHover={{ y: -6 }} 
      className="bg-white dark:bg-[#0f1014] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-2xl flex items-center gap-5 relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/10 transition-all"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full ${bg} opacity-5 dark:opacity-10 blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150`}></div>
      <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 ${color} ${border} border border-slate-200 dark:border-white/5 relative z-10`}>
        <Icon size={28} />
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{value}</h3>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-6 pb-20 relative overflow-hidden transition-colors duration-300"
    >
       {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px] transition-colors" />
       </div>

      <div className="max-w-7xl mx-auto relative z-10">
         {/* Header */}
         <div className="mb-10 pt-10">
            <div className="flex items-center gap-2 mb-4">
               <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={12} /> Recruiter Portal
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
               Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">{recruiterData?.name || "Recruiter"}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
               Manage your hiring pipeline for <span className="font-bold text-slate-900 dark:text-white border-b border-slate-300 dark:border-white/20 pb-0.5">{recruiterData?.orgName || "your organization"}</span>.
            </p>
         </div>
   
         {/* Stats Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <StatCard icon={Briefcase} value={stats?.totalJobs || 0} label="Active Jobs" color="text-blue-600 dark:text-blue-400" bg="bg-blue-600" border="border-blue-200 dark:border-blue-500/20" />
           <StatCard icon={Users} value={stats?.applicants || 0} label="Total Applicants" color="text-green-600 dark:text-green-400" bg="bg-green-600" border="border-green-200 dark:border-green-500/20" />
           <StatCard icon={FileText} value={stats?.interviews || 0} label="Interviews" color="text-purple-600 dark:text-purple-400" bg="bg-purple-600" border="border-purple-200 dark:border-purple-500/20" />
           <StatCard icon={CalendarDays} value={stats?.upcomingEvents || 0} label="Events" color="text-orange-600 dark:text-orange-400" bg="bg-orange-600" border="border-orange-200 dark:border-orange-500/20" />
         </div>
   
         {/* Account Status */}
         <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-600/5 dark:to-purple-600/5 rounded-full -mr-32 -mt-32 z-0 blur-3xl transition-colors"></div>
            <div className="relative z-10">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  Account Status
               </h3>
               
               <div className="flex flex-col md:flex-row items-start gap-8">
                  {recruiterData?.status === "approved" ? (
                     <div className="p-6 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-3xl border border-green-200 dark:border-green-500/20 shadow-lg shadow-green-500/10 dark:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                        <CheckCircle size={48} />
                     </div>
                  ) : recruiterData?.status === "pending" ? (
                     <div className="p-6 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-3xl border border-amber-200 dark:border-amber-500/20 shadow-lg shadow-amber-500/10 dark:shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <Clock size={48} />
                     </div>
                  ) : (
                     <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-3xl border border-red-200 dark:border-red-500/20 shadow-lg shadow-red-500/10 dark:shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <AlertTriangle size={48} />
                     </div>
                  )}
                  
                  <div className="flex-1 space-y-4">
                     <div className="flex items-center gap-3">
                       <span className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest
                         ${recruiterData?.status === "approved" ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20" : 
                           recruiterData?.status === "pending" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20"}
                       `}>
                          {recruiterData?.status || "Unknown"}
                       </span>
                     </div>
                     
                     {recruiterData?.status === "approved" ? (
                       <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl">
                          You have full access to the Recruiter Portal. You can post new job openings, manage incoming applications, and schedule candidate interviews seamlessly.
                       </p>
                     ) : recruiterData?.status === "pending" ? (
                       <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl">
                          Your recruiter account is currently under review. Our admin team will verify your details soon. You will be notified via email once approved.
                       </p>
                     ) : (
                       <p className="text-red-600 dark:text-red-400 text-lg font-medium leading-relaxed max-w-3xl">
                          Your application was rejected. Please contact support@onestop.com for further assistance.
                       </p>
                     )}
   
                     {recruiterData?.status === "approved" && (
                        <div className="pt-4">
                           <button 
                             onClick={() => navigate("/recruiter/post-job")}
                             className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95"
                           >
                              <PlusCircle size={20} /> Post New Job
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
