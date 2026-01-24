import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { Briefcase, Users, UserCheck, Clock, TrendingUp } from "lucide-react";

export default function AdminMetrics() {
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await get("/admin/insights");
        setInsights(res.data);
      } catch (err) {
        console.error("Error fetching system insights:", err);
        setError("Failed to load admin insights.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
     return <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error) {
     return <div className="text-center py-10 text-red-500 font-bold">{error}</div>;
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
       <div className={`p-4 rounded-2xl ${bg} ${color} w-min mb-4`}>
          <Icon size={24} />
       </div>
       <h3 className="text-3xl font-black text-slate-800 mb-1">{value}</h3>
       <p className="text-slate-500 font-bold uppercase text-xs tracking-wider mb-2">{title}</p>
       <p className="text-sm font-medium text-slate-400">{subtitle}</p>
       <div className={`absolute -right-6 -bottom-6 opacity-10 ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={100} />
       </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto py-10"
    >
      <div className="mb-8">
         <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> System Insights Dashboard
         </h1>
         <p className="text-slate-500 font-medium">Real-time platform metrics and hiring data.</p>
      </div>

      {/* ===== GRID SECTION ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard 
            title="Total Jobs" 
            value={insights?.jobs?.totalJobs ?? 0}
            subtitle={`${insights?.jobs?.openJobs ?? 0} Open • ${insights?.jobs?.closedJobs ?? 0} Closed`}
            icon={Briefcase}
            color="text-blue-600"
            bg="bg-blue-50"
         />
         <MetricCard 
            title="Recruiters" 
            value={insights?.recruiters?.totalRecruiters ?? 0}
            subtitle={`${insights?.recruiters?.approvedRecruiters ?? 0} Approved • ${insights?.recruiters?.pendingRecruiters ?? 0} Pending`}
            icon={Users}
            color="text-pink-600"
            bg="bg-pink-50"
         />
         <MetricCard 
            title="Total Applicants" 
            value={insights?.applicants?.totalApplicants ?? 0}
            subtitle={`${insights?.applicants?.last7dApplicants ?? 0} in last 7 days`}
            icon={UserCheck}
            color="text-indigo-600"
            bg="bg-indigo-50"
         />
      </div>

      <div className="mt-8 text-center bg-slate-50 p-4 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider">
         Last synced: {new Date(insights?.generatedAt || Date.now()).toLocaleString()}
      </div>
    </motion.div>
  );
}
