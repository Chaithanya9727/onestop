import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import { MessageSquare, Search, Trash2, Reply, CheckSquare, Square, Loader, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMessages() {
   const { get, post, del } = useApi();
   const { role } = useAuth();
   const { showToast } = useToast();
   const isSuper = role === "superadmin";

   const [messages, setMessages] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [page, setPage] = useState(1);
   const [pages, setPages] = useState(1);
   const [selected, setSelected] = useState([]);
   const [replyText, setReplyText] = useState("");
   const [replyId, setReplyId] = useState(null);
   const [status, setStatus] = useState({ type: "", msg: "" });

   const pageSize = 10;

   const loadMessages = async () => {
      try {
         setLoading(true);
         const data = await get(`/contact`);
         setMessages(Array.isArray(data) ? data : (data.messages || []));
         setPages(1);
         setSelected([]);
      } catch (err) {
         console.error(err);
         setStatus({ type: "error", msg: "Failed to load messages" });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { loadMessages(); }, [page]);

   const handleDelete = async (id) => {
      if (!window.confirm("Delete this message?")) return;
      try {
         await del(`/contact/${id}`);
         setMessages((prev) => prev.filter((m) => m._id !== id));
         setStatus({ type: "success", msg: "Message deleted" });
      } catch {
         setStatus({ type: "error", msg: "Failed to delete" });
      }
   };

   const handleBulkDelete = async () => {
      if (!isSuper) return;
      if (selected.length === 0) return;
      if (!window.confirm(`Delete ${selected.length} inquiries?`)) return;
      try {
         await post("/contact/bulk/delete", { ids: selected });
         setMessages((prev) => prev.filter(m => !selected.includes(m._id)));
         setSelected([]);
         setStatus({ type: "success", msg: "All selected inquiries deleted" });
      } catch {
         setStatus({ type: "error", msg: "Bulk delete failed" });
      }
   };

   const handleSendReply = async () => {
      if (!replyText.trim()) return;
      try {
         await post(`/contact/${replyId}/reply`, { reply: replyText });
         setReplyText("");
         setReplyId(null);
         loadMessages();
         setStatus({ type: "success", msg: "Reply sent!" });
      } catch {
         setStatus({ type: "error", msg: "Failed to reply" });
      }
   };

   const toggleSelect = (id) => {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
   };

   const toggleSelectAll = () => {
      if (selected.length === messages.length) setSelected([]);
      else setSelected(messages.map(m => m._id));
   };

   if (!["admin", "superadmin"].includes(role?.toLowerCase())) return <div className="text-center py-20 font-bold text-red-500 bg-white dark:bg-[#0a0a0a] min-h-screen pt-32">Access Denied</div>;

   return (
      <div className="max-w-7xl mx-auto p-6 md:p-12 pb-24 min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-100 dark:bg-cyan-600/5 rounded-full blur-[100px] transition-colors" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[100px] transition-colors" />
         </div>

         <div className="relative z-10">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
                     <MessageSquare size={14} /> Inbox
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                     Message Center
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage user inquiries and support requests.</p>
               </div>
            </div>

            <AnimatePresence>
               {status.msg && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 mb-8 rounded-xl font-bold border flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20'}`}>
                     {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                     {status.msg}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="bg-white dark:bg-[#0f1014] p-4 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-2xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center group focus-within:border-cyan-500/30 transition-colors">
               <div className="relative w-full md:w-96 group/search">
                  <Search className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 group-focus-within/search:text-cyan-500 dark:group-focus-within/search:text-cyan-400 transition-colors" size={18} />
                  <input
                     type="text"
                     placeholder="Search messages..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && loadMessages()}
                     className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-cyan-500/50 font-medium transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600"
                  />
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={loadMessages} className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20 flex-1 md:flex-none text-center active:scale-95">
                     Search
                  </button>
                  {isSuper && (
                     <button onClick={handleBulkDelete} disabled={selected.length === 0} className="px-6 py-3 bg-white dark:bg-[#1a1a1a] text-red-500 dark:text-red-400 border border-slate-200 dark:border-white/10 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 transition-all flex items-center gap-2 disabled:opacity-50 flex-1 md:flex-none justify-center">
                        <Trash2 size={18} /> Delete Selected
                     </button>
                  )}
               </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-xl overflow-hidden min-h-[400px]">
               {loading ? (
                  <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-cyan-500" size={32} /></div>
               ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                     <MessageSquare size={48} className="mb-4 opacity-20" />
                     <p className="font-bold">No inquiries found.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-white/5">
                              {isSuper && (
                                 <th className="px-6 py-5 w-16 text-center">
                                    <button onClick={toggleSelectAll} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors">
                                       {selected.length === messages.length && messages.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                 </th>
                              )}
                              <th className="px-6 py-5">Sender</th>
                              <th className="px-6 py-5">Subject</th>
                              <th className="px-6 py-5 w-1/3">Message</th>
                              <th className="px-6 py-5">Date</th>
                              <th className="px-6 py-5 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                           {messages.map((m) => (
                              <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                 {isSuper && (
                                    <td className="px-6 py-4 text-center">
                                       <button onClick={() => toggleSelect(m._id)} className={`${selected.includes(m._id) ? 'text-cyan-600 dark:text-cyan-500' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>
                                          {selected.includes(m._id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                       </button>
                                    </td>
                                 )}
                                 <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    <span>{m.name}<br /><span className="text-xs text-slate-500 font-medium">{m.email}</span></span>
                                 </td>
                                 <td className="px-6 py-4 text-cyan-600 dark:text-cyan-400 font-bold">
                                    {m.subject}
                                 </td>
                                 <td className="px-6 py-4 text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs truncate">
                                    {m.message}
                                 </td>
                                 <td className="px-6 py-4 text-slate-500 text-xs font-bold font-mono">
                                    {new Date(m.createdAt).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                       <button onClick={() => setReplyId(m._id)} className="p-2 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors border border-cyan-100 dark:border-cyan-500/20" title="Reply">
                                          <Reply size={16} />
                                       </button>
                                       <button onClick={() => handleDelete(m._id)} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-100 dark:border-red-500/20" title="Delete">
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
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
                  <span className="px-6 py-2 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center">Page {page} of {pages}</span>
                  <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1">
                     Next <ChevronRight size={16} />
                  </button>
               </div>
            )}

            {/* Reply Modal */}
            <AnimatePresence>
               {replyId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white">Reply to Message</h3>
                           <button onClick={() => setReplyId(null)} className="p-2 bg-slate-100 dark:bg-[#1a1a1a] rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={18} /></button>
                        </div>
                        <textarea
                           className="w-full p-5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-cyan-500/50 min-h-[150px] font-medium resize-none mb-6 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600"
                           placeholder="Type your reply here..."
                           value={replyText}
                           onChange={e => setReplyText(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                           <button onClick={() => setReplyId(null)} className="px-6 py-3 bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
                           <button onClick={handleSendReply} className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-lg shadow-cyan-600/20 transition-all active:scale-95">Send Reply</button>
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
}
