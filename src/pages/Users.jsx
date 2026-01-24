import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { 
  Lock, Trash2, Edit, Search, UserPlus, Shield, Smartphone, Mail, User, CheckCircle, X, Loader, Filter 
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

  if (!isElevated) return <div className="text-center py-20 font-bold text-red-500">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 pb-20">
      
      {/* Header */}
      <div className="mb-8">
         <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><User size={28} /></span>
            Users Management
         </h1>
         <p className="text-slate-500 font-medium mt-2 ml-1">Manage system users, roles, and permissions.</p>
      </div>

      {(err || success) && (
         <div className={`p-4 mb-6 rounded-xl font-bold border flex items-center gap-2 ${err ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
            {err ? <X size={20} /> : <CheckCircle size={20} />}
            {err || success}
         </div>
      )}

      {/* Create Admin (SuperAdmin) */}
      {isSuper && (
         <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
               <Shield className="text-blue-400" size={24} />
               <h3 className="text-lg font-bold">Create New SuperAdmin</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
               <input 
                  type="text" placeholder="Full Name" 
                  value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                  className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 font-medium"
               />
               <input 
                  type="email" placeholder="Email Address" 
                  value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 font-medium"
               />
               <input 
                  type="password" placeholder="Password" 
                  value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 font-medium"
               />
               <input 
                  type="text" placeholder="Mobile (Optional)" 
                  value={newAdmin.mobile} onChange={e => setNewAdmin({...newAdmin, mobile: e.target.value})}
                  className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 font-medium"
               />
               <button onClick={createAdmin} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-2 px-4 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                  <UserPlus size={18} /> Create
               </button>
            </div>
         </motion.div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 shadow-sm"
            />
         </div>
         <button type="submit" className="bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-slate-700 transition-colors shadow-lg">
            Search
         </button>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
         {loading ? (
            <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-600" size={32} /></div>
         ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
               <User size={48} className="mb-4 opacity-20" />
               <p className="font-bold">No users found.</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                     {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{u.name}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2 text-slate-600"><Mail size={14} className="text-slate-400"/> {u.email}</div>
                                 {u.mobile && <div className="flex items-center gap-2 text-slate-500 text-xs"><Smartphone size={14} className="text-slate-400"/> {u.mobile}</div>}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border
                                 ${u.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                   u.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                   'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                 {u.role}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => { setSelectedUser(u); setOpenReset(true); }} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="Reset Password">
                                    <Lock size={16} />
                                 </button>
                                 {isSuper && (
                                    <>
                                       <button onClick={() => { setSelectedUser(u); setNewRole(u.role); setOpenRole(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Change Role">
                                          <Edit size={16} />
                                       </button>
                                       <button onClick={() => { setSelectedUser(u); setOpenDelete(true); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Delete User">
                                          <Trash2 size={16} />
                                       </button>
                                    </>
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

      {/* Modals */}
      <AnimatePresence>
         {/* Reset Password Modal */}
         {openReset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                  <h3 className="text-xl font-black text-slate-800 mb-2">Reset Password</h3>
                  <p className="text-sm text-slate-500 mb-4">Set a new password for <b>{selectedUser?.email}</b></p>
                  <input 
                     type="password" placeholder="New Password" 
                     value={newPassword} onChange={e => setNewPassword(e.target.value)}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium mb-6"
                  />
                  <div className="flex justify-end gap-3">
                     <button onClick={() => setOpenReset(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                     <button onClick={handleResetPassword} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Update</button>
                  </div>
               </motion.div>
            </div>
         )}

         {/* Change Role Modal */}
         {openRole && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                  <h3 className="text-xl font-black text-slate-800 mb-2">Change User Role</h3>
                  <p className="text-sm text-slate-500 mb-4">Select new role for <b>{selectedUser?.email}</b></p>
                  <select 
                     value={newRole} onChange={e => setNewRole(e.target.value)}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium mb-6 appearance-none"
                  >
                     <option value="candidate">Candidate</option>
                     <option value="recruiter">Recruiter</option>
                     <option value="superadmin">SuperAdmin</option>
                  </select>
                  <div className="flex justify-end gap-3">
                     <button onClick={() => setOpenRole(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                     <button onClick={handleChangeRole} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Update Role</button>
                  </div>
               </motion.div>
            </div>
         )}

         {/* Delete Confirmation Modal */}
         {openDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                  <h3 className="text-xl font-black text-red-600 mb-2 flex items-center gap-2"><Trash2 size={24}/> Delete User?</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                     Are you sure you want to permanently delete <b>{selectedUser?.email}</b>? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3">
                     <button onClick={() => setOpenDelete(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                     <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200">Yes, Delete</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
