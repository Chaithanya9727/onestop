import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  CheckCircle,
  Trophy,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  Loader
} from "lucide-react";

// 🎨 Stunning Stat Card Component
const StatCard = ({ label, value, icon: Icon, color, bg, trend }) => (
  <div className="relative overflow-hidden bg-white dark:bg-[#0f1014] p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 group hover:border-blue-300 dark:hover:border-blue-500/30 transition-all duration-300">
    <div className={`absolute -right-6 -top-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-500 scale-150 text-slate-900 dark:text-white`}>
      <Icon size={140} />
    </div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-xl ${bg} dark:bg-white/5 ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        {trend && (
           <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
              <TrendingUp size={12} /> {trend}
           </div>
        )}
      </div>
      
      <h3 className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wide uppercase mb-1">{label}</h3>
      <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</div>
    </div>
  </div>
);

export default function RecruiterOverview() {
  const api = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get("/recruiter/rpanel/overview");
        setData(res);
        setLoading(false);
      } catch (err) {
        console.error("Overview Load Error:", err);
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="animate-spin text-blue-600 dark:text-blue-400" size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center mt-12 bg-white dark:bg-[#0f1014] p-8 rounded-3xl shadow-sm border border-red-100 dark:border-red-500/20 text-red-500 dark:text-red-400">
         <Activity size={48} className="mx-auto mb-4 opacity-20"/>
         <h3 className="text-xl font-bold text-slate-800 dark:text-white">Unable to load data</h3>
         <p className="text-slate-500 dark:text-slate-400">Please try refreshing the page.</p>
      </div>
    );
  }

  const { totalJobs, totalApplications, hiredCount, recentJobs } = data;

  const stats = [
    {
      label: "Active Jobs",
      value: totalJobs,
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50",
      trend: "+2 this week",
    },
    {
      label: "Total Applicants",
      value: totalApplications,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50",
      trend: "+12% vs last month",
    },
    {
      label: "Hired Candidates",
      value: hiredCount,
      icon: Trophy,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50",
      trend: "Great progress!",
    },
    {
      label: "In Review",
      value: "0", 
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50",
      trend: "Pending action",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
           <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Overview of your hiring pipeline</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0f1014] px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
           <Calendar size={16}/> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
             <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <div>
             <h3 className="text-lg font-black text-slate-800 dark:text-white">Recent Job Posts</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your latest opportunities</p>
          </div>
          <Link
            to="/rpanel/jobs"
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-4 py-2 rounded-xl transition-all flex items-center gap-2 group"
          >
            View All Jobs <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <Briefcase size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No active jobs found.</p>
            <p className="text-sm">Post your first opportunity to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#0a0a0a] text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-5">Job Title</th>
                  <th className="px-8 py-5">Location</th>
                  <th className="px-8 py-5">Posted Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                {recentJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-base mb-0.5">
                        {job.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-white/10 inline-block px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5">
                        {job.type || "Full-time"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400 font-medium">
                       <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>{job.location}</span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        to={`/rpanel/jobs/${job._id}/applications`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white font-bold rounded-xl transition-all text-xs"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Recent Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <div>
             <h3 className="text-lg font-black text-slate-800 dark:text-white">Recent Events</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Competitions active under your organization</p>
          </div>
          <Link
            to="/rpanel/events"
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-4 py-2 rounded-xl transition-all flex items-center gap-2 group"
          >
            Manage Events <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {!data.recentEvents || data.recentEvents.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No events found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#0a0a0a] text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-5">Event Title</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Registrations</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                {data.recentEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-800 dark:text-slate-200">
                      {event.title}
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400 capitalize">
                      {event.category}
                    </td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(event.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400 font-bold">
                      {event.registrations}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${
                          event.status === 'ongoing' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-red-100 dark:ring-red-500/20' :
                          event.status === 'upcoming' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-100 dark:ring-blue-500/20' :
                          'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-white/10'
                      }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                               event.status === 'ongoing' ? 'bg-red-500 animate-pulse' :
                               event.status === 'upcoming' ? 'bg-blue-500' :
                               'bg-slate-500'
                          }`}></div> 
                          <span className="capitalize">{event.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
