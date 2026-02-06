import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
   Calendar, MapPin, ArrowRight, Loader, Plus, Search, Filter, Sparkles, Clock, CalendarDays
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import AuthModal from "../../components/AuthModal";

export default function EventsList() {
   const { get } = useApi();
   const navigate = useNavigate();
   const { user, role, isAuthenticated } = useAuth();
   const isAdmin = ["admin", "superadmin", "mentor", "recruiter"].includes(role);

   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'

   // Auth Modal
   const [isAuthModalOpen, setAuthModalOpen] = useState(false);

   // Filters
   const [activeCategory, setActiveCategory] = useState("all");
   const [activeStatus, setActiveStatus] = useState("upcoming");
   const [searchQuery, setSearchQuery] = useState("");

   useEffect(() => {
      fetchEvents();
   }, [activeCategory, activeStatus, searchQuery]);

   const fetchEvents = async () => {
      try {
         setLoading(true);
         const params = new URLSearchParams();
         if (activeCategory !== "all") params.append("category", activeCategory);
         if (activeStatus !== "all") params.append("status", activeStatus);
         if (searchQuery) params.append("search", searchQuery);

         const res = await get(`/events?${params.toString()}`);
         setEvents(res.events || []);
      } catch (err) {
         console.error("Error fetching events:", err);
      } finally {
         setLoading(false);
      }
   };

   const handleEventClick = (event) => {
      if (!isAuthenticated) {
         setAuthModalOpen(true);
         return;
      }

      if (eventSource === 'internal') {
         navigate(`/events/${event._id || event.id}`);
      } else {
         window.open(event.link, '_blank');
      }
   };

   const categories = [
      { id: "all", label: "All Events" },
      { id: "hackathon", label: "Hackathons" },
      { id: "workshop", label: "Workshops" },
      { id: "quiz", label: "Quizzes" },
      { id: "job-challenge", label: "Hiring Challenges" }
   ];

   const statuses = [
      { id: "all", label: "All Time" },
      { id: "ongoing", label: "Live Now" },
      { id: "upcoming", label: "Upcoming" },
      { id: "ended", label: "Past" }
   ];

   // External Events Logic
   const [eventSource, setEventSource] = useState("internal"); // 'internal' | 'external'
   const [externalEvents, setExternalEvents] = useState([]);

   useEffect(() => {
      if (eventSource === 'external') fetchExternalEvents();
   }, [eventSource]);

   const fetchExternalEvents = async () => {
      setLoading(true);
      // SIMULATED API CALL to an External Aggregator
      setTimeout(() => {
         setExternalEvents([
            {
               id: "ext-1",
               title: "Global AI Hackathon 2026",
               organizer: "Devpost",
               platform: "Devpost",
               date: "2026-12-15",
               image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
               link: "https://devpost.com",
               category: "Hackathon",
               location: "Online"
            },
            {
               id: "ext-quiz-1",
               title: "Daily Coding Quiz",
               organizer: "GeeksforGeeks",
               platform: "GFG",
               date: "2026-02-10",
               image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=1000",
               link: "https://practice.geeksforgeeks.org/explore?page=1&category[]=Quiz",
               category: "Quiz",
               location: "Online"
            },
            {
               id: "ext-2",
               title: "Google Hash Code 2026",
               organizer: "Google",
               platform: "Google",
               date: "2026-03-20",
               image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000",
               link: "https://codingcompetitions.withgoogle.com/hashcode",
               category: "Coding Contest",
               location: "Global"
            },
            {
               id: "ext-quiz-2",
               title: "General Knowledge Trivia",
               organizer: "Sporcle",
               platform: "Sporcle",
               date: "2026-01-25",
               image: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?auto=format&fit=crop&q=80&w=1000",
               link: "https://www.sporcle.com/",
               category: "Quiz",
               location: "Online"
            },
            {
               id: "ext-3",
               title: "NASA Space Apps Challenge",
               organizer: "NASA",
               platform: "Space Apps",
               date: "2026-10-01",
               image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
               link: "https://www.spaceappschallenge.org/",
               category: "Hackathon",
               location: "Hybrid"
            },
            {
               id: "ext-quiz-3",
               title: "AWS Cloud Quest",
               organizer: "Amazon",
               platform: "AWS",
               date: "2026-04-01",
               image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
               link: "https://aws.amazon.com/training/digital/aws-cloud-quest/",
               category: "Quiz",
               location: "Online"
            },
            {
               id: "ext-4",
               title: "Smart India Hackathon 2026",
               organizer: "Govt of India",
               platform: "SIH",
               date: "2026-08-15",
               image: "https://images.unsplash.com/photo-1531297461136-82lw9z2l3b2a?auto=format&fit=crop&q=80&w=1000",
               link: "https://sih.gov.in/",
               category: "Hackathon",
               location: "India"
            },
            {
               id: "ext-quiz-4",
               title: "Python Challenge 2026",
               organizer: "HackerRank",
               platform: "HackerRank",
               date: "2026-02-15",
               image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=1000",
               link: "https://www.hackerrank.com/domains/python",
               category: "Quiz",
               location: "Online"
            },
            {
               id: "ext-5",
               title: "Meta Hacker Cup 2026",
               organizer: "Meta",
               platform: "Meta",
               date: "2026-07-20",
               image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
               link: "https://www.facebook.com/codingcompetitions/hacker-cup",
               category: "Coding Contest",
               location: "Online"
            }
         ]);
         setLoading(false);
      }, 800);
   };

   const location = useLocation();
   const isRecruiter = location.pathname.includes("/rpanel");

   return (
      <div className={`relative overflow-hidden transition-colors duration-300 ${isRecruiter ? 'min-h-full bg-slate-50 dark:bg-[#0a0a0a] rounded-3xl p-6 md:p-8' : 'min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-6 md:p-12'}`}>
         {/* Background Gradients */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors" />
         </div>

         <div className="max-w-7xl mx-auto relative z-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
               <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
               >
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-sm mb-2">
                     <Sparkles size={16} /> Elite Competitions
                  </div>
                  <h1 className={`${isRecruiter ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl'} font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight`}>
                     Explore <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">Global Events</span>
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
                     Join world-class hackathons, workshops, and hiring challenges designed to accelerate your career.
                  </p>
               </motion.div>

               <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-4 items-end"
               >
                  {/* Source Toggle */}
                  <div className="bg-white dark:bg-[#1a1a1a] p-1.5 rounded-xl border border-slate-200 dark:border-white/10 flex shadow-sm w-full md:w-auto">
                     <button
                        onClick={() => setEventSource("internal")}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${eventSource === 'internal' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                     >
                        Onestop Events
                     </button>
                     <button
                        onClick={() => setEventSource("external")}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${eventSource === 'external' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                     >
                        External <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-md ml-1">NEW</span>
                     </button>
                  </div>

                  <div className="flex items-center gap-3">
                     {isAdmin && eventSource === 'internal' && (
                        <button
                           onClick={() => navigate("/manage/events/create")}
                           className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 transition-all"
                        >
                           <Plus size={18} /> Create
                        </button>
                     )}

                     {/* View Toggle */}
                     <div className="bg-white dark:bg-[#1a1a1a] p-1.5 rounded-xl border border-slate-200 dark:border-white/10 flex shadow-sm">
                        <button
                           onClick={() => setViewMode("list")}
                           className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                           <Filter size={16} />
                        </button>
                        <button
                           onClick={() => setViewMode("calendar")}
                           className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                           <CalendarDays size={16} />
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>

            {/* Controls Bar (Only in List View & Internal) */}
            {eventSource === 'internal' && viewMode === "list" && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col xl:flex-row gap-6 mb-12 sticky top-24 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none"
               >
                  {/* Search */}
                  <div className="relative group min-w-[300px]">
                     <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                     <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all font-medium"
                     />
                  </div>

                  {/* Filters */}
                  <div className="flex-1 flex flex-col md:flex-row gap-4 justify-between overflow-x-auto pb-2 md:pb-0 items-center scrollbar-hide">

                     <div className="flex gap-2">
                        {statuses.map(status => (
                           <button
                              key={status.id}
                              onClick={() => setActiveStatus(status.id)}
                              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${activeStatus === status.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}`}
                           >
                              {status.label}
                           </button>
                        ))}
                     </div>

                     <div className="flex gap-2 items-center">
                        <div className="flex gap-2 mr-4">
                           {categories.map(cat => (
                              <button
                                 key={cat.id}
                                 onClick={() => setActiveCategory(cat.id)}
                                 className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === cat.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                              >
                                 {cat.label}
                              </button>
                           ))}
                        </div>

                        <div className="flex items-center gap-2 border-l pl-4 border-slate-200 dark:border-white/10">
                           {user && (
                              <button
                                 onClick={() => navigate("/events/my/registrations")}
                                 className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                                 title="My Registrations"
                              >
                                 <Calendar size={20} />
                              </button>
                           )}

                           {isAdmin && (
                              <button
                                 onClick={() => navigate("/manage/events")}
                                 className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                                 title="Manage Events"
                              >
                                 <Filter size={20} />
                              </button>
                           )}
                        </div>
                     </div>

                  </div>
               </motion.div>
            )}

            {/* Loading State */}
            {loading ? (
               <div className="min-h-[400px] flex items-center justify-center">
                  <Loader className="animate-spin text-blue-600 dark:text-blue-500" size={40} />
               </div>
            ) : viewMode === "list" ? (
               // LIST VIEW
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                     {(eventSource === 'internal' ? events : externalEvents).map((event, index) => (
                        <motion.div
                           key={event.id || event._id}
                           initial={{ opacity: 0, y: 30 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           whileHover={{ y: -10 }}
                           viewport={{ once: true }}
                           transition={{ delay: index * 0.05 }}
                           onClick={() => handleEventClick(event)}
                           className="bg-white dark:bg-[#0f1014] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-500/30 transition-all duration-300 group flex flex-col h-full cursor-pointer"
                        >
                           {/* Image */}
                           <div className="h-56 bg-slate-100 dark:bg-white/5 relative overflow-hidden">
                              {event.image || event.coverImage?.url ? (
                                 <img
                                    src={event.image || event.coverImage.url}
                                    alt={event.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                    <Calendar className="text-slate-300 dark:text-white/20 w-16 h-16" />
                                 </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 dark:opacity-80 transition-opacity" />

                              {eventSource === 'external' ? (
                                 <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-white shadow-lg flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> {event.platform}
                                 </div>
                              ) : (
                                 <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-white shadow-lg capitalize">
                                    {event.category || "General"}
                                 </div>
                              )}

                              {event.status === 'ongoing' && (
                                 <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-white"></span> LIVE NOW
                                 </div>
                              )}
                           </div>

                           {/* Content */}
                           <div className="p-8 flex-1 flex flex-col relative z-10">
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                 {event.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed font-medium">
                                 {event.subtitle || event.description || (eventSource === 'external' && `Hosted by ${event.organizer}`) || "No description available."}
                              </p>

                              <div className="space-y-3 mb-8">
                                 <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-bold">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500"><MapPin size={16} /></div>
                                    <span className="truncate">{event.location || "Online"}</span>
                                 </div>
                                 <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-bold">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500"><Calendar size={16} /></div>
                                    <span>{event.date || (event.startDate ? new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBA")}</span>
                                 </div>
                              </div>

                              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-blue-600 dark:text-blue-400 font-black text-sm uppercase tracking-wider group-hover:text-blue-500">
                                 <span>{eventSource === 'external' ? 'Visit Website' : 'View Details'}</span>
                                 <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-500/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ArrowRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            ) : (
               // CALENDAR VIEW (Enhanced)
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#0f1014] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden"
               >
                  <style>{`
                  .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 800 !important; color: inherit; }
                  .fc-button-primary { background-color: #2563eb !important; border-color: #2563eb !important; font-weight: bold !important; border-radius: 0.75rem !important; padding: 0.5rem 1.25rem !important; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; transition: all 0.2s; }
                  .fc-button-primary:hover { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; transform: scale(1.05); }
                  .fc-daygrid-day { border-color: rgba(148, 163, 184, 0.2) !important; transition: background-color 0.2s; }
                  .fc-daygrid-day:hover { background-color: rgba(241, 245, 249, 0.5) !important; }
                  .fc-col-header-cell { border-color: rgba(148, 163, 184, 0.2) !important; padding: 1rem 0; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
                  .fc-col-header-cell-cushion { color: #64748b; font-weight: 800; }
                  .fc { border-color: rgba(148, 163, 184, 0.2) !important; }
                  .fc-theme-standard td, .fc-theme-standard th { border-color: rgba(148, 163, 184, 0.2) !important; }
                  .fc-day-today { background-color: rgba(37, 99, 235, 0.05) !important; }
                  .fc-daygrid-day-number { color: inherit; font-weight: 700; margin: 0.5rem; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
                  .fc-day-today .fc-daygrid-day-number { background-color: #2563eb; color: white; }
                  .fc-event { border: none !important; background-color: rgba(37, 99, 235, 0.1) !important; color: #2563eb !important; font-size: 0.85rem !important; border-radius: 0.5rem !important; padding: 4px 8px !important; font-weight: 700 !important; margin-bottom: 4px; border-left: 3px solid #2563eb !important; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                  .fc-event:hover { background-color: #2563eb !important; color: white !important; cursor: pointer; transform: scale(1.02); transition: all 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
                  
                  /* Dark Mode Overrides */
                  body.dark-mode .fc-daygrid-day { border-color: rgba(255,255,255,0.05) !important; }
                  body.dark-mode .fc-daygrid-day:hover { background-color: rgba(255,255,255,0.05) !important; }
                  body.dark-mode .fc-col-header-cell { border-color: rgba(255,255,255,0.05) !important; }
                  body.dark-mode .fc-col-header-cell-cushion { color: #94a3b8; }
                  body.dark-mode .fc { border-color: rgba(255,255,255,0.05) !important; }
                  body.dark-mode .fc-theme-standard td, body.dark-mode .fc-theme-standard th { border-color: rgba(255,255,255,0.05) !important; }
                  body.dark-mode .fc-daygrid-day-number { color: #cbd5e1; }
                  body.dark-mode .fc-button-primary { background-color: #3b82f6 !important; border-color: #3b82f6 !important; }
                   body.dark-mode .fc-event { background-color: rgba(59, 130, 246, 0.2) !important; color: #60a5fa !important; border-left: 3px solid #3b82f6 !important; }
                  body.dark-mode .fc-event:hover { background-color: #3b82f6 !important; color: white !important; }
               `}</style>
                  <FullCalendar
                     plugins={[dayGridPlugin, interactionPlugin]}
                     initialView="dayGridMonth"
                     headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek'
                     }}
                     events={(eventSource === 'internal' ? events : externalEvents).map((ev) => ({
                        id: ev.id || ev._id,
                        title: ev.title,
                        start: ev.startDate || ev.date,
                        extendedProps: {
                           location: ev.location,
                           description: ev.description,
                           link: ev.link, // Pass link to extended props
                           _originalEvent: ev // Pass full event just in case
                        }
                     }))}
                     eventClick={(info) => handleEventClick(info.event.extendedProps._originalEvent || {
                        id: info.event.id,
                        _id: info.event.id,
                        link: info.event.extendedProps.link
                     })}
                     height="auto"
                  />
               </motion.div>
            )}
         </div>
         <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
   );
}
