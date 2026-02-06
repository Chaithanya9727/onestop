import React, { useEffect, useState } from "react";
import {
   Users, UserCheck, School, FileText, Mail, Send, Activity,
   Trash2, Shield, Lock, AlertTriangle, CheckCircle, Plus, X,
   Calendar, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";

export default function AdminPanel() {
   const { role } = useAuth();
   const { get, post, put, del } = useApi();
   const { showToast } = useToast();
   const navigate = useNavigate();

   const [users, setUsers] = useState([]);
   const [logs, setLogs] = useState([]);
   const [jobs, setJobs] = useState([]);
   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [openDialog, setOpenDialog] = useState(false);
   const [newAdmin, setNewAdmin] = useState({
      name: "",
      email: "",
      password: "",
      mobile: "",
   });

   // Load users, logs, jobs, events
   useEffect(() => {
      const load = async () => {
         try {
            setLoading(true);
            const [userData, auditData, jobData, eventData] = await Promise.all([
               get("/users"),
               get("/users/audit"),
               get("/jobs"),
               get("/events")
            ]);
            setUsers(userData || []);
            setLogs(auditData.logs || []);
            setJobs(jobData?.data?.jobs || jobData?.jobs || []);
            setEvents(eventData?.events || eventData || []);
         } catch (err) {
            console.error("Admin data fetch failed", err);
            setError("Failed to load admin data");
         } finally {
            setLoading(false);
         }
      };
      if (role === "admin" || role === "superadmin") load();
   }, [role, get]);

   const handleCreateAdmin = async () => {
      if (!newAdmin.name || !newAdmin.email || !newAdmin.password)
         return showToast("All fields are required", "error");

      if (role !== "superadmin")
         return showToast("Only SuperAdmin can create new admins", "error");

      try {
         await post("/users/create-admin", newAdmin);
         showToast("Admin created successfully!", "success");
         // Reload users
         const userData = await get("/users");
         setUsers(userData);
         setNewAdmin({ name: "", email: "", password: "", mobile: "" });
         setOpenDialog(false);
      } catch (err) {
         showToast("Failed to create admin", "error");
      }
   };

   const totalUsers = users.length;
   const totalAdmins = users.filter((u) => u.role === "admin" || u.role === "superadmin").length;
   const totalRecruiters = users.filter((u) => u.role === "recruiter").length;
   const totalEvents = events.length;
   const totalJobs = jobs.length;
   const totalLogs = logs.length;

   if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

   if (role !== "admin" && role !== "superadmin") {
      return (
         <div className="flex flex-col items-center justify-center h-screen text-center bg-slate-50 dark:bg-[#0a0a0a]">
            <Shield size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
            <p className="text-slate-500">You do not have permission to view this page.</p>
         </div>
      );
   }

   /* 🎨 Agency Style Stat Card */
   const StatCard = ({ title, count, icon: Icon, color, border }) => (
      <motion.div
         whileHover={{ y: -5 }}
         className={`bg-white dark:bg-[#0f1014] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:${border} shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group relative overflow-hidden`}
      >
         <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
            <Icon size={100} />
         </div>
         <div className="relative z-10 flex items-start justify-between">
            <div>
               <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-2">{title}</p>
               <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{count}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-')}/10 border ${border} bg-opacity-10`}>
               <Icon size={24} className={color} />
            </div>
         </div>
         <div className="mt-6 flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <Activity size={12} />
            <span>+12% vs last month</span>
         </div>
      </motion.div>
   );

   return (
      <div className="p-8 lg:p-12 pb-24 relative overflow-x-hidden transition-colors duration-300 text-slate-900 dark:text-white">
         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/5 rounded-full blur-[100px] transition-colors" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[100px] transition-colors" />
         </div>

         <div className="max-w-7xl mx-auto relative z-10">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row justify-between md:items-center gap-6">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                     <Shield size={14} /> System Administration
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                     {role === "superadmin" ? "SuperAdmin Control" : "Admin Panel"}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mt-2 text-lg">Platform health and operations command center.</p>
               </div>

               {role === "superadmin" && (
                  <button
                     onClick={() => setOpenDialog(true)}
                     className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-600/30 flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                     <Plus size={18} /> Create New Admin
                  </button>
               )}
            </motion.div>

            {/* Dashboard Status Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0f1014] rounded-2xl border border-slate-200 dark:border-white/5 mb-8 shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                     <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">System Status: Normal</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200 dark:bg-white/10"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Sync Active • {new Date().toLocaleTimeString()}</span>
               </div>
               <div className="flex items-center gap-2 text-slate-400">
                  <Activity size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Real-time monitoring enabled</span>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               <StatCard title="Total Platform Users" count={totalUsers} icon={Users} color="text-blue-500" border="border-blue-500/30" />
               <StatCard title="Active Events" count={totalEvents} icon={Calendar} color="text-yellow-500" border="border-yellow-500/30" />
               <StatCard title="Open Opportunities" count={totalJobs} icon={Briefcase} color="text-emerald-500" border="border-emerald-500/30" />
               <StatCard title="Audit Activity" count={totalLogs} icon={FileText} color="text-purple-500" border="border-purple-500/30" />
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
               <div onClick={() => navigate('/admin/jobs')} className="lg:col-span-2 p-10 bg-white dark:bg-[#0f1014] rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-colors"></div>
                  <div className="relative z-10">
                     <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                        <Briefcase size={28} />
                     </div>
                     <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Job & Recruiter Pipeline</h3>
                     <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">Manage the verification queue for new recruiters and approve job listings before they go live on the platform.</p>
                     <div className="mt-8 flex items-center gap-6">
                        <div className="flex flex-col">
                           <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{totalRecruiters}</span>
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Recruiters</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100 dark:bg-white/10"></div>
                        <div className="flex flex-col">
                           <span className="text-2xl font-black text-emerald-500">{totalJobs}</span>
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verified Listings</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div onClick={() => navigate('/admin/users')} className="p-10 bg-white dark:bg-[#0f1014] rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-500 mb-8 border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                     <Users size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">Users</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">Manage system access, roles, and user state directly from the global directory.</p>
               </div>
            </div>

            {/* Secondary Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div onClick={() => navigate('/admin/logs')} className="p-6 bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:rotate-12 transition-transform">
                     <FileText size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Audit Logs</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Track all sensitive actions.</p>
               </div>
               <div onClick={() => navigate('/manage/events')} className="p-6 bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-yellow-300 dark:hover:border-yellow-500/30 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-600 mb-4 group-hover:rotate-12 transition-transform">
                     <Calendar size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Events</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Oversee ecosystem events.</p>
               </div>
               <div onClick={() => navigate('/admin/messages')} className="p-6 bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:rotate-12 transition-transform">
                     <Mail size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Messages</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Global support inbox.</p>
               </div>
               <div onClick={() => navigate('/admin/mentor-approvals')} className="p-6 bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:rotate-12 transition-transform">
                     <UserCheck size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Mentors</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vetting and approvals.</p>
               </div>
            </div>

            {/* Create Admin Dialog */}
            <AnimatePresence>
               {openDialog && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2rem] p-10 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setOpenDialog(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                           <Shield className="text-blue-600 dark:text-blue-500" size={32} /> New Admin
                        </h2>
                        <div className="space-y-4">
                           <input type="text" placeholder="Full Name" className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 outline-none focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-black"
                              value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} />
                           <input type="email" placeholder="Email Address" className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 outline-none focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-black"
                              value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                           <input type="password" placeholder="Password" className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 outline-none focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-black"
                              value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                           <input type="text" placeholder="Mobile (Optional)" className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 outline-none focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-black"
                              value={newAdmin.mobile} onChange={e => setNewAdmin({ ...newAdmin, mobile: e.target.value })} />
                        </div>
                        <div className="flex gap-4 mt-10">
                           <button onClick={() => setOpenDialog(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
                           <button onClick={handleCreateAdmin} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]">Create Admin</button>
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>

         </div>
      </div>
   );
}
