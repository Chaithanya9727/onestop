import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { useAuth } from "../../context/AuthContext";
import {
   Users, Trophy, Edit3, Trash2, Plus, RefreshCw, Search, X, Check, Filter, ChevronLeft, ChevronRight, AlertTriangle, AlignLeft, Calendar, Scroll, HelpCircle
} from "lucide-react";

/**
 * Custom Modal Component
 */
const Modal = ({ open, onClose, title, children, actions, maxWidth = "max-w-md" }) => {
   if (!open) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`bg-white dark:bg-[#0f1014] rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-white/10`}
         >
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
               <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
               <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
               {children}
            </div>
            {actions && (
               <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex justify-end gap-3">
                  {actions}
               </div>
            )}
         </motion.div>
      </div>
   );
};

const CATEGORIES = [
   { value: "", label: "All Categories" },
   { value: "hackathon", label: "Hackathon" },
   { value: "quiz", label: "Quiz" },
   { value: "case", label: "Case Study" },
   { value: "job-challenge", label: "Job Challenge" },
   { value: "workshop", label: "Workshop" },
   { value: "other", label: "Other" },
];

const getStatusMeta = (event) => {
   const now = new Date();
   const start = new Date(event.startDate);
   const end = new Date(event.endDate);
   if (end < now) return { key: "completed", label: "Completed", color: "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400" };
   if (start > now) return { key: "upcoming", label: "Upcoming", color: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" };
   return { key: "ongoing", label: "Ongoing", color: "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" };
};

export default function AdminEventManager() {
   const { role } = useAuth();
   const { get, del, put } = useApi();
   const { showToast } = useToast();
   const navigate = useNavigate();

   const [serverPage, setServerPage] = useState(0);
   const [rowsPerPage, setRowsPerPage] = useState(10);
   const [totalCount, setTotalCount] = useState(0);

   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(false);

   const [tabStatus, setTabStatus] = useState("all");
   const [category, setCategory] = useState("");
   const [searchInput, setSearchInput] = useState("");
   const [search, setSearch] = useState("");

   const [editEvent, setEditEvent] = useState(null);
   const [confirmDelete, setConfirmDelete] = useState(null);

   const load = async (pageIndex = serverPage, limit = rowsPerPage, cat = category, q = search) => {
      setLoading(true);
      try {
         const apiPage = pageIndex + 1;
         const res = await get("/events", {
            params: { page: apiPage, limit, category: cat || undefined, search: q || undefined },
         });
         setEvents(res?.events || []);
         setTotalCount(res?.total ?? 0);
      } catch (err) {
         console.error("FetchEvents error:", err);
         showToast("❌ Failed to load events", "error");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load(0, rowsPerPage, category, search);
      setServerPage(0);
   }, [category, search]);

   useEffect(() => {
      const t = setTimeout(() => setSearch(searchInput.trim()), 400);
      return () => clearTimeout(t);
   }, [searchInput]);

   const filteredByStatus = useMemo(() => {
      if (tabStatus === "all") return events;
      return events.filter((e) => getStatusMeta(e).key === tabStatus);
   }, [events, tabStatus]);

   const handleDelete = async () => {
      try {
         await del(`/events/${confirmDelete._id}`);
         showToast(`🗑️ Deleted event: ${confirmDelete.title}`, "success");
         setConfirmDelete(null);
         load(serverPage, rowsPerPage, category, search);
      } catch (err) {
         console.error("DeleteEvent error:", err);
         showToast("❌ Failed to delete event", "error");
      }
   };

   const handleEditSave = async () => {
      try {
         const fd = new FormData();

         // Basic fields
         const basicFields = ['title', 'subtitle', 'description', 'organizer', 'category', 'location', 'maxTeamSize', 'linkedJob'];
         basicFields.forEach(key => {
            if (editEvent[key] !== undefined) fd.append(key, editEvent[key]);
         });

         // Dates
         fd.append('startDate', new Date(editEvent.startDate).toISOString());
         fd.append('endDate', new Date(editEvent.endDate).toISOString());
         fd.append('registrationDeadline', new Date(editEvent.registrationDeadline).toISOString());

         // Arrays
         fd.append('tags', JSON.stringify(editEvent.tags || []));
         fd.append('prizes', JSON.stringify(editEvent.prizes || []));
         fd.append('rules', JSON.stringify(editEvent.rules || []));
         fd.append('faqs', JSON.stringify((editEvent.faqs || []).map(f => ({ question: f.question, answer: f.answer }))));
         fd.append('rounds', JSON.stringify(editEvent.rounds || []));
         fd.append('customFields', JSON.stringify(editEvent.customFields || []));
         fd.append('certificateConfig', JSON.stringify(editEvent.certificateConfig || {}));
         fd.append('teamFinderEnabled', editEvent.teamFinderEnabled);
         if (editEvent.coverFile) {
            fd.append('cover', editEvent.coverFile);
         }

         await put(`/events/${editEvent._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
         showToast("✅ Event updated successfully", "success");
         setEditEvent(null);
         load(serverPage, rowsPerPage, category, search);
      } catch (err) {
         console.error("EditEvent error:", err);
         showToast("❌ Failed to update event", "error");
      }
   };

   // Helper for array modifications in edit state
   const updateEditArr = (key, idx, val, isDelete = false) => {
      setEditEvent(prev => {
         const arr = [...(prev[key] || [])];
         if (isDelete) arr.splice(idx, 1);
         else if (idx === -1) arr.push(val);
         else arr[idx] = val;

         // re-index rounds
         if (key === 'rounds') {
            return { ...prev, [key]: arr.map((r, i) => ({ ...r, roundNumber: i + 1 })) };
         }
         return { ...prev, [key]: arr };
      });
   };

   const updateRound = (idx, field, val) => {
      setEditEvent(prev => {
         const rounds = [...(prev.rounds || [])];
         rounds[idx] = { ...rounds[idx], [field]: val };
         return { ...prev, rounds };
      });
   };

   const updateCustomField = (idx, field, val) => {
      setEditEvent(prev => {
         const fields = [...(prev.customFields || [])];
         fields[idx] = { ...fields[idx], [field]: val };
         return { ...prev, customFields: fields };
      });
   };

   return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 dark:bg-[#0a0a0a] min-h-screen py-10 px-6 transition-colors duration-300">
         <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
               <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Manage Events</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium italic">Create, edit, and moderate world-class opportunities.</p>
               </div>

               <div className="flex flex-wrap items-center gap-3">

                  <div className="relative group">
                     <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                     <input
                        type="text"
                        placeholder="Search events..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-sm transition-all"
                     />
                  </div>

                  <div className="relative group">
                     <Filter className="absolute left-3 top-3 text-slate-400" size={16} />
                     <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="pl-10 pr-8 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-sm appearance-none min-w-[180px] cursor-pointer"
                     >
                        {CATEGORIES.map(c => <option key={c.value} value={c.value} className="dark:bg-[#0f1014]">{c.label}</option>)}
                     </select>
                  </div>

                  <button onClick={() => load(serverPage, rowsPerPage, category, search)} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors shadow-sm">
                     <RefreshCw size={18} />
                  </button>

                  <button onClick={() => navigate("/manage/events/create")} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm uppercase tracking-wider">
                     <Plus size={18} /> Create Event
                  </button>
               </div>
            </div>

            {/* Tabs */}
            <div className="mb-8 flex overflow-x-auto border-b border-slate-200 dark:border-white/5 scrollbar-hide">
               {["all", "upcoming", "ongoing", "completed"].map(status => (
                  <button
                     key={status}
                     onClick={() => setTabStatus(status)}
                     className={`px-8 py-4 font-black text-sm border-b-2 transition-all capitalize whitespace-nowrap tracking-wide ${tabStatus === status ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                  >
                     {status}
                  </button>
               ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 overflow-hidden transition-colors">
               {loading ? (
                  <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading amazing events...</div>
               ) : (
                  <>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] transition-colors">
                                 <th className="p-6">Title</th>
                                 <th className="p-6">Category</th>
                                 <th className="p-6">Organizer</th>
                                 <th className="p-6">Timeline</th>
                                 <th className="p-6">Status</th>
                                 <th className="p-6 text-center">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {filteredByStatus.length === 0 ? (
                                 <tr><td colSpan={6} className="p-16 text-center text-slate-400 font-medium">No events found matching criteria.</td></tr>
                              ) : filteredByStatus.map(event => {
                                 const s = getStatusMeta(event);
                                 return (
                                    <tr key={event._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                                       <td className="p-6">
                                          <div className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{event.title}</div>
                                          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">{event._id}</div>
                                       </td>
                                       <td className="p-6">
                                          <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">{event.category}</span>
                                       </td>
                                       <td className="p-6 text-sm font-bold text-slate-500 dark:text-slate-400 italic line-clamp-1">{event.organizer || "—"}</td>
                                       <td className="p-6 text-xs font-black text-slate-600 dark:text-slate-500">
                                          <div className="flex items-center gap-2">
                                             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                             <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                             <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                             <span>{new Date(event.endDate).toLocaleDateString()}</span>
                                          </div>
                                       </td>
                                       <td className="p-6">
                                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] ${s.color}`}>
                                             {s.label}
                                          </span>
                                       </td>
                                       <td className="p-6">
                                          <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                             <button onClick={() => navigate(`/manage/events/registrations/${event._id}`)} className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all" title="Registrations">
                                                <Users size={16} />
                                             </button>
                                             {event.category === 'quiz' && (
                                                <button onClick={() => navigate(`/manage/events/${event._id}/manage-quiz`)} className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all" title="Manage Quiz">
                                                   <Plus size={16} />
                                                </button>
                                             )}
                                             <button onClick={() => navigate(`/events/${event._id}/leaderboard`)} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all" title="Leaderboard">
                                                <Trophy size={16} />
                                             </button>
                                             <button onClick={() => setEditEvent({
                                                ...event,
                                                startDate: new Date(event.startDate).toISOString().slice(0, 16),
                                                endDate: new Date(event.endDate).toISOString().slice(0, 16),
                                                registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : "",
                                                prizes: event.prizes || [""],
                                                rules: event.rules || [""],
                                                faqs: event.faqs ? event.faqs.map(f => ({ question: f.question, answer: f.answer })) : [{ question: "", answer: "" }],
                                                tags: event.tags || [],
                                             })} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all" title="Edit">
                                                <Edit3 size={16} />
                                             </button>
                                             <button onClick={() => setConfirmDelete(event)} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all" title="Delete">
                                                <Trash2 size={16} />
                                             </button>
                                          </div>
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>

                     {/* Pagination */}
                     <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between transition-colors">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           Total Pipeline: {totalCount} events
                        </div>
                        <div className="flex gap-2">
                           <button
                              disabled={serverPage === 0}
                              onClick={() => { setServerPage(p => p - 1); load(serverPage - 1) }}
                              className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-400"
                           >
                              <ChevronLeft size={18} />
                           </button>
                           <button
                              disabled={serverPage >= Math.ceil(totalCount / rowsPerPage) - 1}
                              onClick={() => { setServerPage(p => p + 1); load(serverPage + 1) }}
                              className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-400"
                           >
                              <ChevronRight size={18} />
                           </button>
                        </div>
                     </div>
                  </>
               )}
            </div>

            {/* Edit Modal - Full Parity with Create Event */}
            <Modal
               open={!!editEvent}
               onClose={() => setEditEvent(null)}
               title="Edit Opportunity Details"
               maxWidth="max-w-4xl"
               actions={
                  <>
                     <button onClick={() => setEditEvent(null)} className="px-6 py-2.5 font-black text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors uppercase text-xs tracking-widest">Cancel</button>
                     <button onClick={handleEditSave} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase text-xs tracking-[0.15em]">Sync Changes</button>
                  </>
               }
            >
               <div className="space-y-12 pb-10">
                  {/* Section 01: Identity & Timeline */}
                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-4 border-b border-indigo-500/20 pb-2 flex items-center gap-2"><AlignLeft size={14} /> 01. General Identity</h4>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Event Title *</label>
                           <input
                              className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                              value={editEvent?.title || ""}
                              onChange={e => setEditEvent(prev => ({ ...prev, title: e.target.value }))}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tagline / Subtitle</label>
                           <input
                              className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all"
                              value={editEvent?.subtitle || ""}
                              onChange={e => setEditEvent(prev => ({ ...prev, subtitle: e.target.value }))}
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Category</label>
                              <select
                                 className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-slate-800 dark:text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                                 value={editEvent?.category || ""}
                                 onChange={e => setEditEvent(prev => ({ ...prev, category: e.target.value }))}
                              >
                                 {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value} className="dark:bg-[#0f1014]">{c.label}</option>)}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Organizer</label>
                              <input
                                 className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                 value={editEvent?.organizer || ""}
                                 onChange={e => setEditEvent(prev => ({ ...prev, organizer: e.target.value }))}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-pink-500 tracking-[0.2em] mb-4 border-b border-pink-500/20 pb-2 flex items-center gap-2"><Calendar size={14} /> 02. Opportunity Timeline & Venue</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Start Date *</label>
                              <input
                                 type="datetime-local"
                                 className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                 value={editEvent?.startDate || ""}
                                 onChange={e => setEditEvent(prev => ({ ...prev, startDate: e.target.value }))}
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">End Date *</label>
                              <input
                                 type="datetime-local"
                                 className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                 value={editEvent?.endDate || ""}
                                 onChange={e => setEditEvent(prev => ({ ...prev, endDate: e.target.value }))}
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Registration Deadline *</label>
                           <input
                              type="datetime-local"
                              className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                              value={editEvent?.registrationDeadline || ""}
                              onChange={e => setEditEvent(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Location / Venue</label>
                              <input
                                 className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                 value={editEvent?.location || ""}
                                 onChange={e => setEditEvent(prev => ({ ...prev, location: e.target.value }))}
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Max Team Size</label>
                              <input
                                 type="number"
                                 className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                 value={editEvent?.maxTeamSize || 1}
                                 onChange={e => setEditEvent(prev => ({ ...prev, maxTeamSize: parseInt(e.target.value) }))}
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Section 02: Description & Integration */}
                  <div className="space-y-6">
                     <h4 className="text-[11px] font-black uppercase text-amber-500 tracking-[0.2em] mb-4 border-b border-amber-500/20 pb-2">03. Description & Integration</h4>
                     <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Full Event Description</label>
                           <textarea
                              rows={5}
                              className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-medium text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
                              value={editEvent?.description || ""}
                              onChange={e => setEditEvent(prev => ({ ...prev, description: e.target.value }))}
                           />
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Linked Job (Hiring ID)</label>
                              <input
                                 className="w-full p-4 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200/50 dark:border-indigo-500/10 rounded-2xl font-black text-indigo-600 outline-none focus:border-indigo-500"
                                 value={editEvent?.linkedJob || ""}
                                 onChange={e => setEditEvent(prev => ({ ...prev, linkedJob: e.target.value }))}
                                 placeholder="Paste Job ID..."
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tags (Comma Separated)</label>
                              <input
                                 className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                                 value={editEvent?.tags?.join(', ') || ""}
                                 onChange={e => setEditEvent(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Section 03: Prizes, Rules & FAQs */}
                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-yellow-500/20 pb-2">
                           <h4 className="text-[11px] font-black uppercase text-yellow-600 tracking-[0.2em] flex items-center gap-2"><Trophy size={14} /> 04. Prizes</h4>
                           <button onClick={() => updateEditArr('prizes', -1, "")} className="p-1.5 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-lg text-yellow-600"><Plus size={16} /></button>
                        </div>
                        <div className="space-y-3">
                           {editEvent?.prizes?.map((p, i) => (
                              <div key={i} className="flex gap-2">
                                 <input
                                    className="flex-1 p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-yellow-500"
                                    value={p}
                                    onChange={e => updateEditArr('prizes', i, e.target.value)}
                                    placeholder={`Prize #${i + 1}`}
                                 />
                                 <button onClick={() => updateEditArr('prizes', i, null, true)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-red-500/20 pb-2">
                           <h4 className="text-[11px] font-black uppercase text-red-600 tracking-[0.2em] flex items-center gap-2"><Scroll size={14} /> 05. Rules</h4>
                           <button onClick={() => updateEditArr('rules', -1, "")} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-600"><Plus size={16} /></button>
                        </div>
                        <div className="space-y-3">
                           {editEvent?.rules?.map((r, i) => (
                              <div key={i} className="flex gap-2">
                                 <input
                                    className="flex-1 p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-red-500"
                                    value={r}
                                    onChange={e => updateEditArr('rules', i, e.target.value)}
                                    placeholder={`Rule #${i + 1}`}
                                 />
                                 <button onClick={() => updateEditArr('rules', i, null, true)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Section 04: FAQs */}
                  {/* Section 04: FAQs */}
                  <div className="space-y-6">
                     <div className="flex justify-between items-center border-b border-blue-500/20 pb-2">
                        <h4 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2"><HelpCircle size={14} /> 06. Frequently Asked Questions</h4>
                        <button onClick={() => updateEditArr('faqs', -1, { question: "", answer: "" })} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg text-blue-600"><Plus size={16} /></button>
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        {editEvent?.faqs?.map((f, i) => (
                           <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 relative group">
                              <button onClick={() => updateEditArr('faqs', i, null, true)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                              <input
                                 className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 font-black text-xs text-slate-800 dark:text-white mb-2 pb-2 outline-none focus:border-blue-500"
                                 value={f.question}
                                 onChange={e => {
                                    const newFaq = { ...f, question: e.target.value };
                                    updateEditArr('faqs', i, newFaq);
                                 }}
                                 placeholder="Question"
                              />
                              <textarea
                                 className="w-full bg-transparent text-xs font-medium text-slate-500 dark:text-slate-400 resize-none outline-none focus:text-slate-700 dark:focus:text-slate-200"
                                 rows={2}
                                 value={f.answer}
                                 onChange={e => {
                                    const newFaq = { ...f, answer: e.target.value };
                                    updateEditArr('faqs', i, newFaq);
                                 }}
                                 placeholder="Detailed Answer..."
                              />
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Section 06: Advanced Pipeline */}
                  <div className="space-y-6">
                     <div className="flex justify-between items-center border-b border-orange-500/20 pb-2">
                        <h4 className="text-[11px] font-black uppercase text-orange-600 tracking-[0.2em] flex items-center gap-2"><Trophy size={14} /> 08. Multi-Round Pipeline</h4>
                        <button onClick={() => updateEditArr('rounds', -1, { roundNumber: (editEvent.rounds?.length || 0) + 1, title: "", type: "submission", isElimination: true })} className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg text-orange-600"><Plus size={16} /></button>
                     </div>
                     <div className="space-y-4">
                        {editEvent?.rounds?.map((r, i) => (
                           <div key={i} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 relative group grid grid-cols-1 md:grid-cols-3 gap-4">
                              <button onClick={() => updateEditArr('rounds', i, null, true)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Round Title</label>
                                 <input className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 font-bold text-sm" value={r.title} onChange={e => updateRound(i, 'title', e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Type</label>
                                 <select className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 font-bold text-sm" value={r.type} onChange={e => updateRound(i, 'type', e.target.value)}>
                                    <option value="submission">Submission</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="interview">Interview</option>
                                 </select>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                 <input type="checkbox" checked={r.isElimination} onChange={e => updateRound(i, 'isElimination', e.target.checked)} />
                                 <label className="text-[9px] font-black uppercase text-slate-400">Elimination Round</label>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Section 07: Custom Registration Fields */}
                  <div className="space-y-6">
                     <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                        <h4 className="text-[11px] font-black uppercase text-purple-600 tracking-[0.2em] flex items-center gap-2"><Scroll size={14} /> 09. Custom Registration Fields</h4>
                        <button onClick={() => updateEditArr('customFields', -1, { id: Date.now().toString(), label: "", type: "text", required: false })} className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg text-purple-600"><Plus size={16} /></button>
                     </div>
                     <div className="space-y-4">
                        {editEvent?.customFields?.map((f, i) => (
                           <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 relative group flex flex-col md:flex-row gap-4">
                              <button onClick={() => updateEditArr('customFields', i, null, true)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                              <div className="flex-1 space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Field Label</label>
                                 <input className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 font-bold text-sm" value={f.label} onChange={e => updateCustomField(i, 'label', e.target.value)} />
                              </div>
                              <div className="w-32 space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Type</label>
                                 <select className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 font-bold text-sm" value={f.type} onChange={e => updateCustomField(i, 'type', e.target.value)}>
                                    <option value="text">Short Text</option>
                                    <option value="dropdown">Dropdown</option>
                                    <option value="url">URL</option>
                                    <option value="file">File Upload</option>
                                 </select>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Section 05: Cover Media */}
                  <div className="space-y-6">
                     <h4 className="text-[11px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-4 border-b border-emerald-500/20 pb-2">07. Cover Media</h4>
                     <div className="flex flex-col md:flex-row items-center gap-8 bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10">
                        <div className="w-full md:w-64 h-36 bg-slate-200 dark:bg-white/5 rounded-2xl overflow-hidden relative group shadow-lg">
                           <img
                              src={editEvent?.coverFile ? URL.createObjectURL(editEvent.coverFile) : (editEvent?.coverImage?.url || 'https://via.placeholder.com/800x400?text=No+Cover+Image')}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                           />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white cursor-pointer hover:bg-white/40"><Plus size={24} /><input type="file" hidden accept="image/*" onChange={e => setEditEvent(prev => ({ ...prev, coverFile: e.target.files[0] }))} /></label>
                           </div>
                        </div>
                        <div className="flex-1 space-y-2">
                           <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Update Banner</p>
                           <p className="text-xs text-slate-500 font-medium">Recommended size: 1200x600 pixels. Supported formats: JPG, PNG, WEBP.</p>
                           <label className="inline-block mt-4 px-6 py-2.5 bg-emerald-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Upload New Image<input type="file" hidden accept="image/*" onChange={e => setEditEvent(prev => ({ ...prev, coverFile: e.target.files[0] }))} /></label>
                        </div>
                     </div>
                  </div>
               </div>
            </Modal>


            {/* Delete Modal */}
            <Modal
               open={!!confirmDelete}
               onClose={() => setConfirmDelete(null)}
               title="Critical Action: Delete Opportunity"
               actions={
                  <>
                     <button onClick={() => setConfirmDelete(null)} className="px-6 py-2.5 font-black text-slate-500 hover:text-slate-800 transition-colors uppercase text-xs tracking-widest">Cancel</button>
                     <button onClick={handleDelete} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-xl shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase text-xs tracking-[0.15em]">Confirm Destruction</button>
                  </>
               }
            >
               <div className="flex flex-col items-center gap-6 p-4 text-center">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-600 shrink-0 shadow-inner">
                     <AlertTriangle size={36} />
                  </div>
                  <div>
                     <p className="font-black text-slate-900 dark:text-white text-2xl tracking-tight mb-2">Are you absolutely sure?</p>
                     <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        You are about to permanently delete <strong className="text-red-600 dark:text-red-400">{confirmDelete?.title}</strong>.
                        This operation is irreversible and all associated data, including registrations and quiz results, will be lost forever.
                     </p>
                  </div>
               </div>
            </Modal>

         </div>
      </motion.div>
   );
}

