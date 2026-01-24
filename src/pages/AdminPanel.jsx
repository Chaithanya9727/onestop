import React, { useEffect, useState } from "react";
import { 
  Users, UserCheck, School, FileText, Mail, Send, Activity, 
  Trash2, Shield, Lock, AlertTriangle, CheckCircle, Plus, X 
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });

  // Load users & logs
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [userData, auditData] = await Promise.all([
           get("/users"),
           get("/users/audit")
        ]);
        setUsers(userData);
        setLogs(auditData.logs || []);
      } catch (err) {
        console.error("Admin data fetch failed", err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    if (role === "admin" || role === "superadmin") load();
  }, [role]);

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
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalCandidates = users.filter((u) => u.role === "candidate").length;
  const totalLogs = logs.length;

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-8 lg:p-12 pb-24 relative overflow-hidden transition-colors duration-300">
        {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[100px] transition-colors" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[100px] transition-colors" />
       </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row justify-between md:items-center gap-6">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <Shield size={14} /> System Administration
               </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                 {role === "superadmin" ? "SuperAdmin Control" : "Admin Panel"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium mt-2 text-lg">Monitor system activity, manage users, and view logs.</p>
           </div>
           
           {role === "superadmin" && (
              <button 
                 onClick={() => setOpenDialog(true)}
                 className="px-8 py-4 bg-white dark:bg-white text-slate-900 dark:text-black font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors shadow-xl shadow-slate-200/50 dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 hover:scale-105 active:scale-95 border border-slate-200 dark:border-transparent"
              >
                 <Plus size={18} /> Create New Admin
              </button>
           )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <StatCard title="Total Users" count={totalUsers} icon={Users} color="text-blue-500" border="border-blue-500/30" />
           <StatCard title="Admins" count={totalAdmins} icon={Shield} color="text-orange-500" border="border-orange-500/30" />
           <StatCard title="Candidates" count={totalCandidates} icon={School} color="text-emerald-500" border="border-emerald-500/30" />
           <StatCard title="Audit Logs" count={totalLogs} icon={FileText} color="text-purple-500" border="border-purple-500/30" />
        </div>
        
        {/* Quick Links / Dashboard Sections (To be expanded) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div onClick={() => navigate('/admin/logs')} className="p-10 bg-white dark:bg-[#0f1014] rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-500 mb-8 border border-purple-100 dark:border-purple-500/20 group-hover:scale-110 transition-transform">
                      <FileText size={28}/>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Audit Logs</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">View detailed logs of all system activities, potential security breaches, and user actions.</p>
             </div>
             
             <div onClick={() => navigate('/users')} className="p-10 bg-white dark:bg-[#0f1014] rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-500 mb-8 border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                      <Users size={28}/>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">User Management</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">Manage user roles, ban/unban users, and update user profiles directly.</p>
             </div>
        </div>

        {/* Create Admin Dialog */}
        <AnimatePresence>
        {openDialog && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
              <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}} className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2rem] p-10 w-full max-w-lg shadow-2xl relative">
                 <button onClick={() => setOpenDialog(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20}/></button>
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                    <Shield className="text-blue-600 dark:text-blue-500" size={32} /> New Admin
                 </h2>
                 <div className="space-y-4">
                    <input type="text" placeholder="Full Name" className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-black" 
                       value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                    <input type="email" placeholder="Email Address" className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-black" 
                       value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                    <input type="password" placeholder="Password" className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-black" 
                       value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                    <input type="text" placeholder="Mobile (Optional)" className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-black" 
                       value={newAdmin.mobile} onChange={e => setNewAdmin({...newAdmin, mobile: e.target.value})} />
                 </div>
                 <div className="flex gap-4 mt-10">
                    <button onClick={() => setOpenDialog(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleCreateAdmin} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]">Create Admin</button>
                 </div>
              </motion.div>
           </div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
}
