import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import {
   Lock, Trash2, Edit, Search, UserPlus, Shield, Smartphone, Mail, User, CheckCircle, X, Loader, Filter,
   Activity, ShieldAlert, UserCheck, Key, Settings, MoreHorizontal, ChevronRight, AlertCircle, Loader2,
   Building2, Users as UsersIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Users() {
   const { role } = useAuth();
   const { get, put, del, post } = useApi();

   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [err, setErr] = useState("");
   const [success, setSuccess] = useState("");
   const [search, setSearch] = useState("");

   // New Admin Form
   const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", mobile: "" });

   // Dialogs
   const [openReset, setOpenReset] = useState(false);
   const [openRole, setOpenRole] = useState(false);
   const [openDelete, setOpenDelete] = useState(false);

   const [selectedUser, setSelectedUser] = useState(null);
   const [newPassword, setNewPassword] = useState("");
   const [newRole, setNewRole] = useState("");

   const isElevated = ["admin", "superadmin"].includes(role?.toLowerCase());
   const isSuper = role?.toLowerCase() === "superadmin";

   const load = async () => {
      try {
         setLoading(true);
         const data = await get(`/users?search=${search}`);
         setUsers(data || []);
         setErr("");
      } catch {
         setErr("Failed to load users");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (isElevated) load();
   }, [isElevated]);

   const handleSearch = (e) => {
      e.preventDefault();
      load();
   };

   const createAdmin = async () => {
      const { name, email, password, mobile } = newAdmin;
      if (!name || !email || !password) return setErr("All fields required to create admin");

      try {
         await post(`/users/create-admin`, { name, email, password, mobile });
         setSuccess("Admin created successfully!");
         setNewAdmin({ name: "", email: "", password: "", mobile: "" });
         load();
      } catch {
         setErr("Failed to create admin");
      }
   };

   const handleResetPassword = async () => {
      try {
         await put(`/users/${selectedUser._id}/reset-password`, { newPassword });
         setSuccess("Password reset successfully!");
         setOpenReset(false);
         setNewPassword("");
         load();
      } catch {
         setErr("Password reset failed");
      }
   };

   const handleChangeRole = async () => {
      try {
         await put(`/users/${selectedUser._id}/role`, { role: newRole });
         setSuccess("Role updated successfully!");
         setOpenRole(false);
         setNewRole("");
         load();
      } catch {
         setErr("Role change failed");
      }
   };

   const handleDeleteUser = async () => {
      try {
         await del(`/users/${selectedUser._id}`);
         setSuccess("User deleted successfully!");
         setOpenDelete(false);
         load();
      } catch {
         setErr("Failed to delete user");
      }
   };

   const stats = useMemo(() => ({
      total: users.length,
      admins: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
      recruiters: users.filter(u => u.role === 'recruiter').length,
      candidates: users.filter(u => u.role === 'candidate').length,
   }), [users]);

   const StatItem = ({ label, count, color, icon: Icon }) => (
      <div className="bg-white dark:bg-[#121214] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
         <div className="flex items-start justify-between">
            <div>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white">{count}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-')}/10`}>
               <Icon className={color} size={24} />
            </div>
         </div>
      </div>
   );

   if (!isElevated) return (
      <div className="flex flex-col items-center justify-center py-40">
         <ShieldAlert size={48} className="text-red-500 mb-4" />
         <h2 className="text-2xl font-bold">Admin Only Access</h2>
         <p className="text-slate-500">You need administrative clearance to view this page.</p>
      </div>
   );

   return (
      <div className="max-w-7xl mx-auto p-4 md:p-10 pb-24">
         {/* Stats Row */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatItem label="Total Units" count={stats.total} color="text-slate-600" icon={UsersIcon} />
            <StatItem label="Privileged" count={stats.admins} color="text-indigo-600" icon={Shield} />
            <StatItem label="Corporate" count={stats.recruiters} color="text-blue-600" icon={Building2} />
            <StatItem label="General" count={stats.candidates} color="text-emerald-600" icon={UserCheck} />
         </div>

         {/* Alerts */}
         <AnimatePresence>
            {(err || success) && (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 mb-8 rounded-2xl flex items-center justify-between font-bold ${err ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                  <div className="flex items-center gap-3">
                     {err ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                     <span>{err || success}</span>
                  </div>
                  <button onClick={() => { setErr(""); setSuccess(""); }}><X size={20} /></button>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Search & Actions */}
         <div className="mb-12 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <form onSubmit={handleSearch}>
                  <input
                     type="text"
                     placeholder="Search identities by name, email or mobile..."
                     value={search} onChange={e => setSearch(e.target.value)}
                     className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 rounded-2xl focus:outline-none focus:border-indigo-500 shadow-sm font-bold dark:text-white"
                  />
               </form>
            </div>
            <button onClick={load} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2">
               Reload Flux
            </button>
         </div>

         {/* Privilege Escalation (Superadmin Only) */}
         {isSuper && (
            <div className="mb-12 bg-indigo-600 text-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Shield size={120} strokeWidth={0.5} />
               </div>
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                     <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Privilege Escalation</h2>
                     <p className="text-indigo-100 font-medium">Provision new administrative authorities directly into the system matrix.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="text" placeholder="Designation (Name)" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className="bg-indigo-700/50 border border-white/20 rounded-xl px-4 py-3 placeholder-white/50 outline-none focus:bg-indigo-700 transition-all font-bold" />
                     <input type="email" placeholder="Terminal Hub (Email)" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="bg-indigo-700/50 border border-white/20 rounded-xl px-4 py-3 placeholder-white/50 outline-none focus:bg-indigo-700 transition-all font-bold" />
                     <input type="password" placeholder="Access Cipher" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        className="bg-indigo-700/50 border border-white/20 rounded-xl px-4 py-3 placeholder-white/50 outline-none focus:bg-indigo-700 transition-all font-bold" />
                     <button onClick={createAdmin} className="bg-white text-indigo-600 font-black py-3 rounded-xl hover:bg-indigo-50 transition-all uppercase tracking-widest text-[10px]">Establish Admin</button>
                  </div>
               </div>
            </div>
         )}

         {/* Identities Grid */}
         {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
               <AnimatePresence>
                  {users.map((u) => (
                     <motion.div key={u._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-[#121214] rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl border border-slate-200 dark:border-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-2xl object-cover" /> : u.name?.charAt(0)}
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{u.name}</h4>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${u.role === 'candidate' ? 'text-emerald-500' : 'text-indigo-500 animate-pulse'}`}>
                                 {u.role}
                              </p>
                           </div>
                        </div>

                        <div className="space-y-3 mb-8">
                           <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                              <Mail size={14} className="shrink-0" /> <span className="truncate">{u.email}</span>
                           </div>
                           <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                              <Smartphone size={14} className="shrink-0" /> <span>{u.mobile || "N/A"}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                           <button onClick={() => { setSelectedUser(u); setOpenRole(true); setNewRole(u.role); }}
                              className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Modify</button>
                           <button onClick={() => { setSelectedUser(u); setOpenReset(true); }}
                              className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">Reset</button>
                        </div>
                        {isSuper && u.role !== 'superadmin' && (
                           <button onClick={() => { setSelectedUser(u); setOpenDelete(true); }}
                              className="w-full mt-3 py-2 text-rose-500 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20">Purge</button>
                        )}
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         )}

         {/* Modals Sub-system */}
         <AnimatePresence>
            {/* Reset Cipher Modal */}
            {openReset && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0f1014] rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-200 dark:border-white/10">
                     <h3 className="text-xl font-black mb-1 uppercase tracking-tight">Cipher Update</h3>
                     <p className="text-xs text-slate-500 mb-8 font-bold">Resetting access for {selectedUser?.name}</p>
                     <input type="password" placeholder="New Access Cipher" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-amber-500 transition-all font-bold mb-6" />
                     <div className="flex gap-3">
                        <button onClick={() => setOpenReset(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-bold rounded-xl uppercase tracking-widest text-[9px]">Abort</button>
                        <button onClick={handleResetPassword} className="flex-1 py-4 bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 uppercase tracking-widest text-[9px]">Execute</button>
                     </div>
                  </motion.div>
               </div>
            )}

            {/* Role Mutation Modal */}
            {openRole && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0f1014] rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-200 dark:border-white/10">
                     <h3 className="text-xl font-black mb-1 uppercase tracking-tight">Authority Mutation</h3>
                     <p className="text-xs text-slate-500 mb-8 font-bold">Adjusting clearance for {selectedUser?.name}</p>
                     <div className="grid grid-cols-1 gap-2 mb-8">
                        {['candidate', 'recruiter', 'admin', 'superadmin'].map(r => (
                           <button key={r} onClick={() => setNewRole(r)}
                              className={`p-3 rounded-xl border transition-all font-bold uppercase tracking-widest text-[9px] ${newRole === r ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500'}`}>
                              {r}
                           </button>
                        ))}
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => setOpenRole(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-bold rounded-xl uppercase tracking-widest text-[9px]">Cancel</button>
                        <button onClick={handleChangeRole} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-[9px]">Mutate</button>
                     </div>
                  </motion.div>
               </div>
            )}

            {/* Purge Confirmation Modal */}
            {openDelete && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0f1014] rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-200 dark:border-white/10 text-center">
                     <div className="w-16 h-16 bg-rose-50/50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="text-rose-600" size={32} />
                     </div>
                     <h3 className="text-xl font-black mb-1 uppercase tracking-tight">Permanent Purge</h3>
                     <p className="text-xs text-slate-500 mb-8 font-bold leading-relaxed px-4">Identify dissolution for <span className="text-rose-500">{selectedUser?.name}</span>? This action is irreversible.</p>
                     <div className="flex gap-3">
                        <button onClick={() => setOpenDelete(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-bold rounded-xl uppercase tracking-widest text-[9px]">Shield</button>
                        <button onClick={handleDeleteUser} className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 uppercase tracking-widest text-[9px]">Purge Identity</button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
