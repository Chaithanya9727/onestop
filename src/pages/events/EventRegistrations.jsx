import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useToast } from "../../components/ToastProvider.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
   ArrowLeft, Search, RefreshCw, Download, Edit3, Trophy, ChevronLeft, ChevronRight, X, AlertTriangle, Check, Github, ExternalLink, FileText, Globe
} from "lucide-react";

/**
 * Custom Modal
 */
const Modal = ({ open, onClose, title, children, actions }) => {
   if (!open) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
         <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#0f1014] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
         >
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
               <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
               <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-6">
               {children}
            </div>
            {actions && (
               <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-end gap-3">
                  {actions}
               </div>
            )}
         </motion.div>
      </div>
   );
};

export default function EventRegistrations() {
   const { get, post } = useApi();
   const { role } = useAuth();
   const { showToast } = useToast();
   const navigate = useNavigate();
   const { id: eventId } = useParams();

   const canScore = ["admin", "mentor", "superadmin"].includes((role || "").toLowerCase());

   // Server pagination state
   const [serverPage, setServerPage] = useState(0);
   const [rowsPerPage, setRowsPerPage] = useState(10);
   const [totalCount, setTotalCount] = useState(0);

   // Data + UI state
   const [rows, setRows] = useState([]);
   const [loading, setLoading] = useState(false);

   // Search & Sort
   const [searchInput, setSearchInput] = useState("");
   const [search, setSearch] = useState("");
   const [orderBy, setOrderBy] = useState("registeredAt");
   const [order, setOrder] = useState("desc");

   // Inline scoring dialog
   const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
   const [selectedRow, setSelectedRow] = useState(null);
   const [scoreValue, setScoreValue] = useState("");
   const [feedbackValue, setFeedbackValue] = useState("");
   const [roundId, setRoundId] = useState(1);
   const [evalStatus, setEvalStatus] = useState("qualified");
   const [event, setEvent] = useState(null);

   const loadEvent = async () => {
      try {
         const res = await get(`/events/${eventId}`);
         setEvent(res);
      } catch (err) { console.error(err); }
   };

   useEffect(() => { loadEvent(); }, [eventId]);

   const load = async (pageIndex = serverPage, pageSize = rowsPerPage) => {
      if (!eventId) {
         showToast("Invalid event ID.", "error");
         return;
      }
      setLoading(true);
      try {
         const apiPage = pageIndex + 1;
         const data = await get(`/events/${eventId}/registrations`, {
            params: { page: apiPage, limit: pageSize },
         });
         const list = data?.data || [];
         setRows(list);
         setTotalCount(data?.total ?? list.length);
      } catch (err) {
         console.error("EventRegistrations load error:", err);
         showToast("❌ Failed to load registrations", "error");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      setServerPage(0);
   }, [eventId]);

   useEffect(() => {
      const t = setTimeout(() => setSearch(searchInput.trim()), 300);
      return () => clearTimeout(t);
   }, [searchInput]);

   useEffect(() => {
      load(serverPage, rowsPerPage);
   }, [serverPage, rowsPerPage, eventId]);

   const comparator = (a, b, key) => {
      const av = a?.[key];
      const bv = b?.[key];
      if (key === "registeredAt" || key === "lastUpdated") {
         return (av ? new Date(av).getTime() : 0) - (bv ? new Date(bv).getTime() : 0);
      }
      if (key === "score") {
         return (typeof av === "number" ? av : -Infinity) - (typeof bv === "number" ? bv : -Infinity);
      }
      return (String(av || "").toLowerCase() < String(bv || "").toLowerCase() ? -1 : 1);
   };

   const sortedFilteredRows = useMemo(() => {
      const term = (search || "").toLowerCase();
      const filtered = rows.filter(
         (r) =>
            (r.name || "").toLowerCase().includes(term) ||
            (r.email || "").toLowerCase().includes(term) ||
            (r.teamName || "").toLowerCase().includes(term)
      );
      const arr = [...filtered].sort((a, b) => comparator(a, b, orderBy));
      if (order === "desc") arr.reverse();
      return arr;
   }, [rows, search, orderBy, order]);

   const toCsvValue = (v) => {
      if (v === null || v === undefined) return "";
      return `"${String(v).replace(/"/g, '""')}"`;
   };

   const handleExportCSV = () => {
      const headers = ["Name", "Email", "Team Name", "Registered At", "Status", "Score", "Feedback", "Last Updated"];
      const lines = [headers.join(",")];

      sortedFilteredRows.forEach((r) => {
         lines.push([
            toCsvValue(r.name || "—"),
            toCsvValue(r.email || "—"),
            toCsvValue(r.teamName || "—"),
            toCsvValue(r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "—"),
            toCsvValue(r.submissionStatus || "not_submitted"),
            toCsvValue(r.score ?? ""),
            toCsvValue(r.feedback || "—"),
            toCsvValue(r.lastUpdated ? new Date(r.lastUpdated).toLocaleString() : "—"),
         ].join(","));
      });

      const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `event_${eventId}_registrations_page${serverPage + 1}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("📄 Exported to CSV", "success");
   };

   const openScoreDialog = (row) => {
      setSelectedRow(row);
      setScoreValue(row?.score ?? "");
      setFeedbackValue(row?.feedback ?? "");
      setRoundId(row?.currentRound || 1);
      setEvalStatus("qualified");
      setScoreDialogOpen(true);
   };

   const submitScore = async () => {
      if (!selectedRow?.userId) return showToast("Invalid user.", "error");

      const parsedScore = scoreValue === "" ? null : Number(scoreValue);
      if (parsedScore !== null && (Number.isNaN(parsedScore) || parsedScore < 0)) {
         return showToast("Score must be a valid number ≥ 0.", "error");
      }

      const body = {
         userId: selectedRow.userId,
         score: parsedScore,
         feedback: feedbackValue || "",
         roundId,
         status: evalStatus
      };

      try {
         await post(`/events/${eventId}/evaluate`, body);
         showToast(`✅ ${evalStatus === 'qualified' ? 'Qualified' : 'Evaluated'} successfully`, "success");

         setRows((prev) => prev.map((r) => String(r.userId) === String(selectedRow.userId) ? {
            ...r,
            score: body.score,
            submissionStatus: evalStatus === "disqualified" ? "rejected" : (r.currentRound < (event?.rounds?.length || 0) ? "not_submitted" : "reviewed"),
            currentRound: evalStatus === 'qualified' ? r.currentRound + 1 : r.currentRound,
            lastUpdated: new Date().toISOString(),
            feedback: body.feedback,
         } : r));

         setScoreDialogOpen(false);
         setSelectedRow(null);
      } catch (err) {
         console.error("Evaluate error:", err);
         showToast("❌ Failed to update score", "error");
      }
   };

   const handleSort = (key) => {
      setOrderBy(key);
      setOrder(prev => orderBy === key && prev === "asc" ? "desc" : "asc");
   };

   const SortIcon = ({ col }) => {
      if (orderBy !== col) return null;
      return <span className="ml-1 text-slate-400 dark:text-slate-500">{order === 'asc' ? '↑' : '↓'}</span>;
   };

   const renderStatus = (r) => {
      if (r.submissionStatus === 'rejected') return <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-black">Rejected</span>;
      if (r.submissionStatus === 'reviewed') return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-black">Qualified</span>;
      if (r.submissionStatus === 'submitted') return <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-black">Submitted</span>;
      return <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-black">Round {r.currentRound || 1}</span>;
   };

   return (
      <div className="bg-slate-50 dark:bg-[#0a0a0a] min-h-screen py-10 px-6 transition-colors duration-300">
         <div className="max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
               <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-600 dark:text-slate-300">
                     <ArrowLeft size={20} />
                  </button>
                  <div>
                     <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Registrations</h1>
                     <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">Total: {totalCount}</span>
                        <span className="px-3 py-1 bg-green-200 dark:bg-green-500/20 text-green-800 dark:text-green-400 rounded-lg text-xs font-bold">Submitted: {rows.filter(r => r.submissionStatus !== 'not_submitted').length}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-3">
                  <div className="relative group">
                     <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                     <input
                        type="text"
                        placeholder="Search..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:bg-slate-50 dark:focus:bg-white/10 shadow-sm w-64 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                     />
                  </div>
                  <button onClick={() => load(serverPage, rowsPerPage)} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors shadow-sm" title="Reload">
                     <RefreshCw size={20} />
                  </button>
                  <button onClick={handleExportCSV} disabled={sortedFilteredRows.length === 0} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400 transition-colors shadow-sm disabled:opacity-50" title="Export CSV">
                     <Download size={20} />
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] shadow-xl dark:shadow-none border border-slate-200 dark:border-white/5 overflow-hidden">
               {loading ? (
                  <div className="p-24 text-center text-slate-400 font-bold flex flex-col items-center gap-4">
                     <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                     Loading data...
                  </div>
               ) : (
                  <>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest cursor-pointer">
                                 <th className="p-6 w-16 text-center">#</th>
                                 <th className="p-6 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
                                 <th className="p-6 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={() => handleSort('email')}>Email <SortIcon col="email" /></th>
                                 <th className="p-6 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={() => handleSort('teamName')}>Team <SortIcon col="teamName" /></th>
                                 <th className="p-6 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={() => handleSort('registeredAt')}>Registered <SortIcon col="registeredAt" /></th>
                                 <th className="p-6">Status</th>
                                 <th className="p-6">Project</th>
                                 <th className="p-6 text-right hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={() => handleSort('score')}>Score <SortIcon col="score" /></th>
                                 <th className="p-6 text-right">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {sortedFilteredRows.length === 0 ? (
                                 <tr><td colSpan={9} className="p-16 text-center text-slate-400 font-medium">No registrations found.</td></tr>
                              ) : sortedFilteredRows.map((r, i) => (
                                 <tr key={r._id || i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="p-6 text-center text-slate-400 dark:text-slate-600 text-xs font-bold">{serverPage * rowsPerPage + i + 1}</td>
                                    <td className="p-6 font-bold text-slate-900 dark:text-white text-base">{r.name || "—"}</td>
                                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">{r.email || "—"}</td>
                                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-bold">{r.teamName || "—"}</td>
                                    <td className="p-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : "—"}</td>
                                    <td className="p-6">{renderStatus(r)}</td>
                                    <td className="p-6">
                                       <div className="flex items-center gap-3">
                                          {r.submissionLink ? (
                                             <a
                                                href={r.submissionLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:scale-110 transition-transform"
                                                title="View Website/Project"
                                             >
                                                {r.submissionLink.includes('github.com') ? <Github size={16} /> : <Globe size={16} />}
                                             </a>
                                          ) : null}
                                          {r.fileUrl ? (
                                             <a
                                                href={r.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:scale-110 transition-transform"
                                                title="Download Project File"
                                             >
                                                <FileText size={16} />
                                             </a>
                                          ) : null}
                                          {!r.submissionLink && !r.fileUrl && <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">No Submission</span>}
                                       </div>
                                    </td>
                                    <td className="p-6 text-right font-black text-slate-700 dark:text-slate-300 text-lg">{r.score != null ? r.score : "—"}</td>
                                    <td className="p-6 text-right">
                                       <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => navigate(`/events/${eventId}/leaderboard`)} className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors" title="Leaderboard">
                                             <Trophy size={18} />
                                          </button>
                                          {canScore && (
                                             <button onClick={() => openScoreDialog(r)} className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors" title="Edit Score">
                                                <Edit3 size={18} />
                                             </button>
                                          )}
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rows per page:</span>
                           <select
                              value={rowsPerPage}
                              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setServerPage(0); }}
                              className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300"
                           >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                           </select>
                        </div>
                        <div className="flex gap-2">
                           <button
                              disabled={serverPage === 0}
                              onClick={() => setServerPage(p => p - 1)}
                              className="p-2.5 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
                           >
                              <ChevronLeft size={18} />
                           </button>
                           <button
                              disabled={(serverPage + 1) * rowsPerPage >= totalCount}
                              onClick={() => setServerPage(p => p + 1)}
                              className="p-2.5 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
                           >
                              <ChevronRight size={18} />
                           </button>
                        </div>
                     </div>
                  </>
               )}
            </div>

            <Modal
               open={scoreDialogOpen}
               onClose={() => setScoreDialogOpen(false)}
               title="Evaluate Submission"
               actions={
                  <>
                     <button onClick={() => setScoreDialogOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">Cancel</button>
                     <button onClick={submitScore} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-colors">Save Score</button>
                  </>
               }
            >
               <div className="space-y-6">
                  {selectedRow && (
                     <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 text-sm">
                        <p className="text-slate-900 dark:text-white mb-1"><strong className="text-slate-500 dark:text-slate-400">Participant:</strong> {selectedRow.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 ml-2">{selectedRow.email}</p>
                     </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Evaluating Round</label>
                        <select
                           value={roundId}
                           onChange={e => setRoundId(Number(e.target.value))}
                           className="w-full p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                        >
                           {event?.rounds?.map(r => (
                              <option key={r.roundNumber} value={r.roundNumber}>Round {r.roundNumber}: {r.title}</option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Decision</label>
                        <select
                           value={evalStatus}
                           onChange={e => setEvalStatus(e.target.value)}
                           className="w-full p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                        >
                           <option value="qualified">Qualify to Next Round</option>
                           <option value="disqualified">Disqualify / Reject</option>
                           <option value="pending">Keep Pending</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Score</label>
                     <input
                        type="number"
                        className="w-full p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. 85"
                        value={scoreValue}
                        onChange={e => setScoreValue(e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Feedback</label>
                     <textarea
                        className="w-full p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 min-h-[100px] transition-colors resize-none"
                        placeholder="Optional feedback..."
                        value={feedbackValue}
                        onChange={e => setFeedbackValue(e.target.value)}
                     />
                  </div>

                  {selectedRow?.customResponses?.length > 0 && (
                     <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                        <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3 block">Custom Registration Data</label>
                        <div className="space-y-2">
                           {selectedRow.customResponses.map((cr, idx) => (
                              <div key={idx} className="flex justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                 <span className="text-xs font-bold text-slate-500">{cr.label}:</span>
                                 <span className="text-xs font-black text-slate-900 dark:text-white">{String(cr.value)}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </Modal>

         </div>
      </div>
   );
}
