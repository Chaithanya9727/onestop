import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  Search, Calendar as CalendarIcon, List as ListIcon, MapPin, Plus, Edit2, Trash2, Clock, CheckCircle, AlertCircle, Loader, X, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Events() {
  const { get, post, put, del } = useApi();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Filters + view
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const pageSize = 6;
  const isAdmin = role?.toLowerCase() === "admin";
  const isSuperAdmin = role?.toLowerCase() === "superadmin";

  const load = async () => {
    try {
      setLoading(true);
      const data = await get(`/events?search=${search}&page=${page}&limit=${pageSize}`);
      setEvents(data.events || []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Load events failed:", err);
      setErr("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    load();
  };

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this event?")) return;
    try {
      await del(`/events/${id}`);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      setSuccess("Event deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setErr("Failed to delete event");
      setTimeout(() => setErr(""), 3000);
    }
  };

  if (loading && page === 1) return (
     <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <Loader className="animate-spin text-indigo-500" size={40} />
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] py-10 px-6 relative overflow-hidden transition-colors duration-300">
        {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[100px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/5 rounded-full blur-[100px] transition-colors" />
       </div>

       <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <CalendarIcon size={14} /> Official Schedule
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                   Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Events</span>
                </motion.h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium mt-2 max-w-lg">Discover workshops, meetups, and conferences curated for your career growth.</p>
             </div>
             {(isAdmin || isSuperAdmin) && (
                <Link to="/events/create" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
                   <Plus size={20}/> Create Event
                </Link>
             )}
          </div>

          {/* Feedback */}
          <AnimatePresence>
             {success && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-xl font-bold flex items-center gap-2">
                   <CheckCircle size={20}/> {success}
                </motion.div>
             )}
             {err && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl font-bold flex items-center gap-2">
                   <AlertCircle size={20}/> {err}
                </motion.div>
             )}
          </AnimatePresence>

          {/* Toolbar */}
          <div className="bg-white dark:bg-[#0f1014] p-4 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center group focus-within:border-indigo-500/30 transition-colors">
             <div className="relative w-full md:w-96 group/search">
                <Search size={20} className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"/>
                <input 
                   type="text" 
                   value={search} 
                   onChange={e => setSearch(e.target.value)} 
                   onKeyDown={e => e.key === 'Enter' && handleSearch()}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl font-medium outline-none focus:border-indigo-500/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all"
                   placeholder="Search events..."
                />
             </div>

             <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1a1a1a] p-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                <button 
                   onClick={() => setViewMode("list")} 
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                   <ListIcon size={16}/> List
                </button>
                <button 
                   onClick={() => setViewMode("calendar")} 
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                   <CalendarIcon size={16}/> Calendar
                </button>
             </div>
          </div>

          {/* Content */}
          {viewMode === "list" ? (
             <div className="space-y-8">
                {events.length === 0 ? (
                   <div className="text-center py-32 text-slate-500 bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5">
                      <CalendarIcon size={64} className="mx-auto mb-6 opacity-20"/>
                      <p className="text-xl font-bold mb-2">No events found</p>
                      <p className="text-slate-600 dark:text-slate-400">Try adjusting your search criteria.</p>
                   </div>
                ) : (
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <AnimatePresence>
                      {events.map((ev, i) => (
                         <motion.div 
                            key={ev._id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-lg hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col h-full"
                            onClick={() => navigate(`/events/${ev._id}`)}
                         >
                            <div className="h-52 bg-slate-100 dark:bg-[#1a1a1a] relative overflow-hidden">
                               {ev.coverImage?.url ? (
                                  <img src={ev.coverImage.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 dark:opacity-80 group-hover:opacity-100"/>
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-200 dark:text-indigo-500/50">
                                     <CalendarIcon size={48}/>
                                  </div>
                               )}
                               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 dark:opacity-60"></div>
                               <div className="absolute top-4 left-4">
                                  <span className="px-3 py-1 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg text-slate-900 dark:text-white border border-white/20 dark:border-white/10">
                                     {ev.category || "General"}
                                  </span>
                               </div>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-1">
                               <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                  <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-500 dark:text-indigo-400"/> {new Date(ev.startDate || ev.date).toLocaleDateString()}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-pink-500 dark:text-pink-400"/> {ev.location || "Online"}</span>
                               </div>
                               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{ev.title}</h3>
                               <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 h-10 leading-relaxed font-medium">{ev.description}</p>
                               
                               <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 dark:border-white/5">
                                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-white transition-colors flex items-center gap-1">View Details <ChevronRight size={14}/></span>
                                  
                                  {(isAdmin || isSuperAdmin) && (
                                     <div className="flex gap-2">
                                        <button onClick={(e) => {e.stopPropagation(); navigate(`/events/create?edit=${ev._id}`)}} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                           <Edit2 size={16}/>
                                        </button>
                                        <button onClick={(e) => remove(ev._id, e)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20">
                                           <Trash2 size={16}/>
                                        </button>
                                     </div>
                                  )}
                               </div>
                            </div>
                         </motion.div>
                      ))}
                      </AnimatePresence>
                   </div>
                )}

                {/* Pagination */}
                {pages > 1 && (
                   <div className="flex justify-center items-center gap-4 pt-12 text-slate-900 dark:text-white">
                      <button 
                         disabled={page === 1} 
                         onClick={() => setPage(p => p - 1)}
                         className="px-5 py-2.5 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-500 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                      >
                         <ChevronLeft size={16}/> Previous
                      </button>
                      <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#1a1a1a] px-4 py-2 rounded-lg border border-slate-200 dark:border-white/5">Page {page} of {pages}</span>
                      <button 
                         disabled={page === pages} 
                         onClick={() => setPage(p => p + 1)}
                         className="px-5 py-2.5 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-500 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                      >
                         Next <ChevronRight size={16}/>
                      </button>
                   </div>
                )}
             </div>
          ) : (
             <div className="bg-white dark:bg-[#0f1014] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl">
                <style>{`
                   .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 800 !important; color: inherit; }
                   .fc-button-primary { background-color: #4f46e5 !important; border-color: #4f46e5 !important; font-weight: bold !important; border-radius: 0.75rem !important; padding: 0.5rem 1rem !important; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
                   .fc-button-primary:hover { background-color: #4338ca !important; border-color: #4338ca !important; }
                   .fc-daygrid-day { border-color: rgba(148, 163, 184, 0.2) !important; }
                   .fc-col-header-cell { border-color: rgba(148, 163, 184, 0.2) !important; color: #94a3b8; padding: 1rem 0; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
                   .fc { border-color: rgba(148, 163, 184, 0.2) !important; }
                   .fc-theme-standard td, .fc-theme-standard th { border-color: rgba(148, 163, 184, 0.2) !important; }
                   .fc-day-today { background-color: rgba(79, 70, 229, 0.05) !important; }
                   .fc-daygrid-day-number { color: inherit; font-weight: 600; margin: 0.5rem; }
                   .fc-event { border: none !important; background-color: rgba(79, 70, 229, 0.2) !important; color: #818cf8 !important; font-size: 0.85rem !important; border-radius: 0.5rem !important; padding: 4px 8px !important; font-weight: 700 !important; margin-bottom: 4px; border-left: 3px solid #6366f1 !important; }
                   .fc-event:hover { background-color: rgba(79, 70, 229, 0.3) !important; cursor: pointer; transform: scale(1.02); transition: all 0.2s; }
                   body.dark-mode .fc-daygrid-day { border-color: rgba(255,255,255,0.05) !important; }
                   body.dark-mode .fc-col-header-cell { border-color: rgba(255,255,255,0.05) !important; }
                   body.dark-mode .fc { border-color: rgba(255,255,255,0.05) !important; }
                   body.dark-mode .fc-theme-standard td, body.dark-mode .fc-theme-standard th { border-color: rgba(255,255,255,0.05) !important; }
                   body.dark-mode .fc-daygrid-day-number { color: #cbd5e1; }
                `}</style>
                <FullCalendar
                   plugins={[dayGridPlugin, interactionPlugin]}
                   initialView="dayGridMonth"
                   headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,dayGridWeek'
                   }}
                   events={events.map((ev) => ({
                      id: ev._id,
                      title: ev.title,
                      start: ev.startDate || ev.date,
                      extendedProps: { location: ev.location, description: ev.description }
                   }))}
                   eventClick={(info) => navigate(`/events/${info.event.id}`)}
                   height="auto"
                />
             </div>
          )}

       </div>
    </div>
  );
}
