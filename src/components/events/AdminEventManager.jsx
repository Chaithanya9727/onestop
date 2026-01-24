import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { useAuth } from "../../context/AuthContext";
import { 
  Users, Trophy, Edit3, Trash2, Plus, RefreshCw, Search, X, Check, Filter, ChevronLeft, ChevronRight, AlertTriangle 
} from "lucide-react";

/**
 * Custom Modal Component
 */
const Modal = ({ open, onClose, title, children, actions }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6">
          {children}
        </div>
        {actions && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
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
  if (end < now) return { key: "completed", label: "Completed", color: "bg-slate-100 text-slate-600" };
  if (start > now) return { key: "upcoming", label: "Upcoming", color: "bg-blue-100 text-blue-700" };
  return { key: "ongoing", label: "Ongoing", color: "bg-green-100 text-green-700" };
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
      await put(`/events/${editEvent._id}`, editEvent);
      showToast("✅ Event updated successfully", "success");
      setEditEvent(null);
      load(serverPage, rowsPerPage, category, search);
    } catch (err) {
      console.error("EditEvent error:", err);
      showToast("❌ Failed to update event", "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 min-h-screen py-10 px-6">
       <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
             <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Manage Events</h1>
                <p className="text-slate-500 font-medium">Create, edit, and moderate events.</p>
             </div>
             
             <div className="flex flex-wrap items-center gap-3">
                
                <div className="relative group">
                   <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
                   <input 
                      type="text" 
                      placeholder="Search events..." 
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 shadow-sm"
                   />
                </div>

                <div className="relative group">
                   <Filter className="absolute left-3 top-3 text-slate-400" size={16}/>
                   <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 shadow-sm appearance-none min-w-[180px]"
                   >
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                   </select>
                </div>

                <button onClick={() => load(serverPage, rowsPerPage, category, search)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
                   <RefreshCw size={18}/>
                </button>

                <button onClick={() => navigate("/admin/create-event")} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2 text-sm">
                   <Plus size={18}/> Create Event
                </button>
             </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex overflow-x-auto border-b border-slate-200">
             {["all", "upcoming", "ongoing", "completed"].map(status => (
                <button
                   key={status}
                   onClick={() => setTabStatus(status)}
                   className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors capitalize whitespace-nowrap ${tabStatus === status ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                   {status}
                </button>
             ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             {loading ? (
                <div className="p-12 text-center text-slate-400">Loading events...</div>
             ) : (
                <>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Organizer</th>
                            <th className="p-4">Period</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {filteredByStatus.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">No events found matching criteria.</td></tr>
                         ) : filteredByStatus.map(event => {
                            const s = getStatusMeta(event);
                            return (
                               <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 font-bold text-slate-900">{event.title}</td>
                                  <td className="p-4 text-sm text-slate-600 capitalize">{event.category}</td>
                                  <td className="p-4 text-sm text-slate-500">{event.organizer || "—"}</td>
                                  <td className="p-4 text-xs font-medium text-slate-500">
                                     <div className="flex flex-col">
                                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                        <span className="text-slate-400 text-[10px]">to</span>
                                        <span>{new Date(event.endDate).toLocaleDateString()}</span>
                                     </div>
                                  </td>
                                  <td className="p-4">
                                     <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${s.color}`}>
                                        {s.label}
                                     </span>
                                  </td>
                                  <td className="p-4">
                                     <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => navigate(`/admin/events/registrations/${event._id}`)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Registrations">
                                           <Users size={16}/>
                                        </button>
                                        {event.category === 'quiz' && (
                                           <button onClick={() => navigate(`/events/${event._id}/manage-quiz`)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Manage Quiz">
                                              <HelpCircle size={16}/>
                                           </button>
                                        )}
                                        <button onClick={() => navigate(`/events/${event._id}/leaderboard`)} className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Leaderboard">
                                           <Trophy size={16}/>
                                        </button>
                                        <button onClick={() => setEditEvent(event)} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title="Edit">
                                           <Edit3 size={16}/>
                                        </button>
                                        <button onClick={() => setConfirmDelete(event)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                                           <Trash2 size={16}/>
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
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                   <div className="text-xs font-bold text-slate-500">
                      Total: {totalCount} events
                   </div>
                   <div className="flex gap-2">
                      <button 
                        disabled={serverPage === 0}
                        onClick={() => {setServerPage(p => p - 1); load(serverPage - 1)}}
                        className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-colors"
                      >
                         <ChevronLeft size={16}/>
                      </button>
                      <button 
                         onClick={() => {setServerPage(p => p + 1); load(serverPage + 1)}}
                         className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                         <ChevronRight size={16}/>
                      </button>
                   </div>
                </div>
                </>
             )}
          </div>
          
          {/* Edit Modal */}
          <Modal 
            open={!!editEvent} 
            onClose={() => setEditEvent(null)}
            title="Edit Event"
            actions={
               <>
                  <button onClick={() => setEditEvent(null)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                  <button onClick={handleEditSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-colors">Save Changes</button>
               </>
            }
          >
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-400">Title</label>
                   <input 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      value={editEvent?.title || ""}
                      onChange={e => setEditEvent(prev => ({...prev, title: e.target.value}))}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-400">Organizer</label>
                   <input 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      value={editEvent?.organizer || ""}
                      onChange={e => setEditEvent(prev => ({...prev, organizer: e.target.value}))}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-400">Category</label>
                   <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 appearance-none"
                      value={editEvent?.category || ""}
                      onChange={e => setEditEvent(prev => ({...prev, category: e.target.value}))}
                   >
                      {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                   </select>
                </div>
             </div>
          </Modal>

          {/* Delete Modal */}
          <Modal 
             open={!!confirmDelete} 
             onClose={() => setConfirmDelete(null)}
             title="Delete Event"
             actions={
                <>
                   <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                   <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-colors">Delete Event</button>
                </>
             }
          >
             <div className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                   <AlertTriangle size={24}/>
                </div>
                <div>
                   <p className="font-bold text-slate-800 text-lg">Are you sure?</p>
                   <p className="text-slate-500 text-sm">You are about to delete <strong>{confirmDelete?.title}</strong>. This action cannot be undone.</p>
                </div>
             </div>
          </Modal>

       </div>
    </motion.div>
  );
}
