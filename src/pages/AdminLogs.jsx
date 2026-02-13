import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import {
   FileText, Search, Trash2, Filter, RefreshCw, Loader, CheckSquare, Square, AlertTriangle, ChevronLeft, ChevronRight
} from "lucide-react";
import StunningLoader from "../components/StunningLoader";

export default function AdminLogs() {
   const { get, del } = useApi();
   const { role: userRole } = useAuth();
   const { showToast } = useToast();

   const [logs, setLogs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [actionFilter, setActionFilter] = useState("all");
   const [page, setPage] = useState(1);
   const [pages, setPages] = useState(1);
   const [selected, setSelected] = useState([]);

   const pageSize = 10;
   const isElevated = ["admin", "superadmin"].includes(userRole?.toLowerCase());
   const isSuper = userRole?.toLowerCase() === "superadmin";

   const loadLogs = async () => {
      try {
         setLoading(true);
         const data = await get(
            `/audit?page=${page}&limit=${pageSize}&search=${encodeURIComponent(search)}&action=${actionFilter}`
         );
         setLogs(data.logs || []);
         setPages(data.pages || 1);
         setSelected([]);
      } catch (err) {
         console.error(err);
         showToast("Failed to fetch logs", "error");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (isElevated) loadLogs();
   }, [page, actionFilter, isElevated]); // Re-fetch on filter change

   const handleSearch = () => {
      setPage(1);
      loadLogs();
   };

   const handleBulkDelete = async () => {
      if (!isSuper) return;
      if (selected.length === 0) return;
      if (!window.confirm(`Delete ${selected.length} logs?`)) return;

      try {
         await del("/audit/bulk", { ids: selected });
         showToast("Selected logs deleted", "success");
         setLogs((prev) => prev.filter((log) => !selected.includes(log._id)));
         setSelected([]);
      } catch (err) {
         showToast("Failed to delete logs", "error");
      }
   };

   const handleDeleteFiltered = async () => {
      if (!isSuper) return;
      if (!window.confirm("WARNING: Delete ALL logs matching current filters?")) return;

      try {
         await del(`/audit/bulk/all?search=${encodeURIComponent(search)}&action=${actionFilter}`);
         showToast("All filtered logs deleted", "success");
         loadLogs();
      } catch (err) {
         showToast("Failed to delete filtered logs", "error");
      }
   };

   const toggleSelect = (id) => {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
   };

   const toggleSelectAll = () => {
      if (selected.length === logs.length) setSelected([]);
      else setSelected(logs.map(l => l._id));
   };

   if (!isElevated) return <div className="text-center py-20 font-bold text-red-500 bg-slate-50 dark:bg-[#0a0a0a] min-h-screen pt-32">Access Denied</div>;

   return (
      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-20 min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[100px] transition-colors" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[100px] transition-colors" />
         </div>

         <div className="relative z-10">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                     <FileText size={14} /> System Activity
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                     Audit Logs
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mt-2">Track security events and user actions in real-time.</p>
               </div>
               {isSuper && (
                  <div className="flex gap-3">
                     <button onClick={handleBulkDelete} disabled={selected.length === 0} className="px-5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/30 transition-all disabled:opacity-50 text-sm flex items-center gap-2">
                        <Trash2 size={16} /> Delete Selected
                     </button>
                     <button onClick={handleDeleteFiltered} className="px-5 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all text-sm flex items-center gap-2 hover:scale-105 active:scale-95">
                        <AlertTriangle size={16} /> Delete Filtered
                     </button>
                  </div>
               )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#0f1014] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-2xl mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="md:col-span-2 relative group">
                  <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                  <input
                     type="text"
                     placeholder="Search logs by email, ID, or details..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleSearch()}
                     className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-500/50 font-medium transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600"
                  />
               </div>
               <div className="relative group">
                  <Filter className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                  <select
                     value={actionFilter}
                     onChange={e => setActionFilter(e.target.value)}
                     className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-500/50 font-medium transition-colors appearance-none text-slate-700 dark:text-white cursor-pointer"
                  >
                     <option value="all" className="bg-white dark:bg-[#1a1a1a]">All Actions</option>
                     <option value="CREATE_EVENT" className="bg-white dark:bg-[#1a1a1a]">Create Event</option>
                     <option value="UPDATE_EVENT" className="bg-white dark:bg-[#1a1a1a]">Update Event</option>
                     <option value="DELETE_EVENT" className="bg-white dark:bg-[#1a1a1a]">Delete Event</option>
                     <option value="REGISTER_EVENT" className="bg-white dark:bg-[#1a1a1a]">Register Event</option>
                  </select>
               </div>
               <button onClick={handleSearch} className="px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-95">
                  <RefreshCw size={18} /> Refresh
               </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-xl overflow-hidden min-h-[400px]">
               {loading ? (
                  <StunningLoader message="Analyzing Audit Transmissions..." />
               ) : logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-500">
                     <FileText size={48} className="mb-4 opacity-20" />
                     <p className="font-bold">No logs found matching your criteria.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-white/5">
                              {isSuper && (
                                 <th className="px-6 py-5 w-16 text-center">
                                    <button onClick={toggleSelectAll} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors">
                                       {selected.length === logs.length && logs.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                 </th>
                              )}
                              <th className="px-6 py-5">Action</th>
                              <th className="px-6 py-5">Performed By</th>
                              <th className="px-6 py-5">Target / Details</th>
                              <th className="px-6 py-5">Timestamp</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                           {logs.map((log) => (
                              <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                 {isSuper && (
                                    <td className="px-6 py-4 text-center">
                                       <button onClick={() => toggleSelect(log._id)} className={`${selected.includes(log._id) ? 'text-purple-600 dark:text-purple-500' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>
                                          {selected.includes(log._id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                       </button>
                                    </td>
                                 )}
                                 <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${log.action.includes('DELETE') ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-100 dark:border-red-500/20' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20'}`}>
                                       {log.action}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {log.performedBy ? log.performedBy.name : <span className="text-slate-500 italic">System</span>}
                                    {log.performedBy && <div className="text-xs text-slate-500 font-medium mt-0.5">{log.performedBy.email}</div>}
                                 </td>
                                 <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                    {log.targetUser && <div className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> To: {log.targetUser.email}</div>}
                                    <div className="truncate max-w-xs text-xs font-mono bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded border border-slate-200 dark:border-white/5 opacity-80" title={log.details}>{log.details || "—"}</div>
                                 </td>
                                 <td className="px-6 py-4 text-slate-500 text-xs font-bold font-mono">
                                    {new Date(log.createdAt).toLocaleString()}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
               <div className="mt-8 flex justify-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1">
                     <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="px-6 py-2 bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center">Page {page} of {pages}</span>
                  <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1">
                     Next <ChevronRight size={16} />
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}
