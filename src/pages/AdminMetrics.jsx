import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { Briefcase, Users, UserCheck, Clock, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import StunningLoader from "../components/StunningLoader";

export default function AdminMetrics() {
   const { get } = useApi();
   const [loading, setLoading] = useState(true);
   const [insights, setInsights] = useState(null);
   const [error, setError] = useState("");
   const [refreshing, setRefreshing] = useState(false);

   const fetchInsights = async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
         const res = await get("/admin/insights");
         // The backend returns { data: { ... } } or just { ... }? 
         // System insights usually returns { jobs, recruiters, applicants, generatedAt }
         setInsights(res.data || res);
      } catch (err) {
         console.error("Error fetching system insights:", err);
         setError("Failed to load admin insights.");
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   useEffect(() => {
      fetchInsights();
   }, []);

   if (loading) return <StunningLoader message="Analyzing Platform Data..." fullPage={true} />;

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 bg-slate-50 dark:bg-[#0a0a0a]">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full text-red-500 mb-4">
               <TrendingUp size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Metrics Unavailable</h2>
            <p className="text-slate-500 font-medium mb-6">{error}</p>
            <button onClick={() => fetchInsights()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
               Retry Connection
            </button>
         </div>
      );
   }

   const MetricCard = ({ title, value, subtitle, icon: Icon, color, bg, border }) => (
      <motion.div
         whileHover={{ y: -5 }}
         className={`bg-white dark:bg-[#0f1014] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:${border} shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group relative overflow-hidden`}
      >
         <div className={`absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-all duration-500 ${color}`}>
            <Icon size={160} />
         </div>

         <div className="relative z-10">
            <div className={`p-4 rounded-2xl ${bg} ${color} w-fit mb-6 shadow-lg shadow-black/5`}>
               <Icon size={28} />
            </div>

            <div className="space-y-1">
               <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</p>
               <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
               <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`}></span>
                  {subtitle}
               </p>
            </div>
         </div>
      </motion.div>
   );

   return (
      <motion.div
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         className="max-w-7xl mx-auto py-12 px-6 md:px-10"
      >
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
               <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 w-fit rounded-full">
                  <TrendingUp size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Insight Engine v2.0</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Analytics</span>
               </h1>
               <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2 font-serif italic">Real-time performance metrics and ecosystem health.</p>
            </div>

            <button
               onClick={() => fetchInsights(true)}
               disabled={refreshing}
               className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl dark:shadow-white/5 flex items-center gap-2 text-sm disabled:opacity-50"
            >
               {refreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
               Refresh Insights
            </button>
         </div>

         {/* ===== GRID SECTION ===== */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricCard
               title="Active Listings"
               value={insights?.jobs?.totalJobs ?? 0}
               subtitle={`${insights?.jobs?.openJobs ?? 0} Open • ${insights?.jobs?.closedJobs ?? 0} Closed`}
               icon={Briefcase}
               color="text-blue-600"
               bg="bg-blue-50 dark:bg-blue-500/10"
               border="border-blue-500/20"
            />
            <MetricCard
               title="Corporate Partners"
               value={insights?.recruiters?.totalRecruiters ?? 0}
               subtitle={`${insights?.recruiters?.approvedRecruiters ?? 0} Verified • ${insights?.recruiters?.pendingRecruiters ?? 0} Waitlist`}
               icon={Users}
               color="text-fuchsia-600"
               bg="bg-fuchsia-50 dark:bg-fuchsia-500/10"
               border="border-fuchsia-500/20"
            />
            <MetricCard
               title="Pipeline Engagement"
               value={insights?.applicants?.totalApplicants ?? 0}
               subtitle={`${insights?.applicants?.last7dApplicants ?? 0} fresh applications in 7 days`}
               icon={UserCheck}
               color="text-indigo-600"
               bg="bg-indigo-50 dark:bg-indigo-500/10"
               border="border-indigo-500/20"
            />
         </div>

         <div className="mt-12 flex items-center justify-between p-6 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
               <span className="text-xs font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Platform Sync Status: Normal</span>
            </div>
            <div className="flex items-center gap-2">
               <Clock size={14} className="text-slate-400" />
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Last Update: {new Date(insights?.generatedAt || Date.now()).toLocaleTimeString()}
               </span>
            </div>
         </div>
      </motion.div>
   );
}
