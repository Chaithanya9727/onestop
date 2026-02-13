import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import {
   User, Edit, MessageSquare, BookOpen, AlertTriangle, CheckCircle,
   Loader, X, Send, Plus, Trash2, Clock, Calendar, DollarSign, Briefcase, Video,
   TrendingUp, Settings, ChevronRight, BarChart, Users, Phone, Zap, Award
} from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { useSocket } from "../socket";
import StunningLoader from "../components/StunningLoader";

export default function MentorDashboard() {
   const { user, refreshUser } = useAuth();
   const { get, post, put, patch } = useApi();
   const { showToast } = useToast();
   const { socket } = useSocket();

   const [loading, setLoading] = useState(true);
   const [mentees, setMentees] = useState([]);
   const [mentorProfile, setMentorProfile] = useState({});
   const [activeTab, setActiveTab] = useState("overview"); // overview, sessions, settings, mentees
   const [openEdit, setOpenEdit] = useState(false);

   const [editForm, setEditForm] = useState({
      expertise: "", experience: "", bio: "", company: ""
   });
   const [services, setServices] = useState([]);
   const [availability, setAvailability] = useState([]);

   const [feedback, setFeedback] = useState("");
   const [selectedStudent, setSelectedStudent] = useState(null);
   const [updating, setUpdating] = useState(false);
   const [sendingFeedback, setSendingFeedback] = useState(false);
   const [stats, setStats] = useState({ earnings: 0, hours: 0, sessions: 0, pending: 0 });
   const [sessions, setSessions] = useState([]);
   const [processingSessionId, setProcessingSessionId] = useState(null);

   // Link Update Modal State
   const [linkUpdateModal, setLinkUpdateModal] = useState(false);
   const [updatingSession, setUpdatingSession] = useState(null); // { id, currentStatus, isJitsiFix: boolean }
   const [newLinkInput, setNewLinkInput] = useState("");

   const openLinkUpdateModal = (session, isJitsiFix = false) => {
      setUpdatingSession({ ...session, isJitsiFix });
      setNewLinkInput(session.meetingLink && !isJitsiFix ? session.meetingLink : "");
      setLinkUpdateModal(true);
   };

   const submitLinkUpdate = async () => {
      if (!updatingSession || !newLinkInput.trim()) return;

      try {
         await handleStatusUpdate(updatingSession._id, updatingSession.status, newLinkInput.trim());
         setLinkUpdateModal(false);
         setNewLinkInput("");
         setUpdatingSession(null);

         // If it was a Jitsi fix, open the new link immediately
         if (updatingSession.isJitsiFix) {
            window.open(newLinkInput.trim(), '_blank');
         } else {
            showToast("Meeting link updated successfully!", "success");
         }
      } catch (err) {
         console.error(err);
      }
   };

   const loadData = async () => {
      try {
         setLoading(true);
         const [profileData, menteesData, sessionsData, statsData] = await Promise.all([
            get("/users/me"),
            get("/mentor/mentees"),
            get("/mentorship/sessions/my"),
            get("/mentorship/stats")
         ]);

         const mProfile = profileData.mentorProfile || {};
         setMentorProfile(mProfile);
         setMentees(menteesData.mentees || []);
         setSessions(sessionsData || []);
         setStats(statsData || { earnings: 0, hours: 0, sessions: 0, pending: 0 });

         setEditForm({
            expertise: mProfile.expertise || "",
            experience: mProfile.experience || "",
            bio: mProfile.bio || "",
            company: mProfile.company || ""
         });
         setServices(mProfile.services || []);

         // Normalize availability: Backend stores objects, Frontend uses strings
         const normalizedAvailability = (mProfile.availability || []).map(day => ({
            ...day,
            slots: day.slots.map(s => typeof s === 'object' ? s.startTime : s)
         }));

         setAvailability(normalizedAvailability.length > 0 ? normalizedAvailability : generateDefaultAvailability());

      } catch (error) {
         console.error("Error fetching mentor dashboard data:", error);
         showToast("Failed to load mentor dashboard", "error");
      } finally {
         setLoading(false);
      }
   };

   const handleStatusUpdate = async (sessionId, newStatus, meetingLink = "") => {
      try {
         setProcessingSessionId(sessionId);
         await patch(`/mentorship/sessions/${sessionId}/status`, {
            status: newStatus,
            meetingLink: meetingLink || undefined
         });
         showToast(`Session ${newStatus}`, "success");
         loadData();
      } catch (err) {
         showToast("Failed to update session", "error");
      } finally {
         setProcessingSessionId(null);
      }
   };

   const pendingSessions = sessions.filter(s => s.status === 'pending');
   const upcomingSessions = sessions.filter(s => s.status === 'confirmed');
   const completedSessions = sessions.filter(s => s.status === 'completed');

   const generateDefaultAvailability = () => {
      return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => ({
         day, slots: []
      }));
   };

   useEffect(() => {
      loadData();

      if (socket) {
         socket.on("session_request_received", (data) => {
            showToast(`New Request: ${data.menteeName} booked a session!`, "info");
            loadData(); // Refresh list to show the new pending session
         });
      }

      return () => {
         if (socket) socket.off("session_request_received");
      };
   }, [socket]);

   const addService = () => setServices([...services, { title: "New Session", type: "1:1 Call", price: 0, duration: 30, description: "" }]);
   const updateService = (index, field, value) => {
      const newServices = [...services];
      newServices[index][field] = value;
      setServices(newServices);
   };
   const removeService = (index) => setServices(services.filter((_, i) => i !== index));

   const validSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];
   const toggleSlot = (dayIndex, slot) => {
      const newAvail = [...availability];
      const currentSlots = newAvail[dayIndex].slots || [];
      newAvail[dayIndex].slots = currentSlots.includes(slot) ? currentSlots.filter(s => s !== slot) : [...currentSlots, slot].sort();
      setAvailability(newAvail);
   };

   const handleSaveSettings = async () => {
      try {
         setUpdating(true);

         // Transform availability strings to objects for backend schema
         const formattedAvailability = availability.map(dayObj => ({
            day: dayObj.day,
            slots: dayObj.slots.map(slotTime => ({
               startTime: slotTime,
               endTime: slotTime, // Simplified: implies 1hr slot or just start time reference
               isBooked: false
            }))
         }));

         await put("/mentorship/settings", { ...editForm, services, availability: formattedAvailability });
         await refreshUser();
         await loadData();
         setOpenEdit(false);
         showToast("Profile & Settings Updated!", "success");
      } catch (error) {
         showToast("Failed to update settings.", "error");
      } finally {
         setUpdating(false);
      }
   };

   const handleAddFeedback = async (studentId) => {
      if (!feedback.trim()) return showToast("Feedback cannot be empty", "warning");
      try {
         setSendingFeedback(true);
         await post(`/mentor/feedback/${studentId}`, { feedback });
         setFeedback("");
         setSelectedStudent(null);
         showToast("Feedback submitted successfully!", "success");
      } catch (error) {
         showToast("Failed to submit feedback.", "error");
      } finally {
         setSendingFeedback(false);
      }
   };

   if (loading) return <StunningLoader message="Calibrating Mentor Protocols..." />;

   return (
      <div className="absolute inset-0 bg-[#050505] text-white font-sans selection:bg-blue-500/20 overflow-hidden flex">
         {/* Background Elements */}
         <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
         </div>

         {/* Modern Floating Sidebar */}
         <div className="w-20 lg:w-72 h-full flex flex-col items-center lg:items-stretch py-6 z-20 border-r border-white/5 bg-black/20 backdrop-blur-2xl">
            <div className="px-8 mb-12 flex items-center gap-4 group cursor-pointer transition-all duration-300 hover:opacity-90">
               <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative z-10 group-hover:scale-105 transition-transform duration-500">
                  <Zap size={20} className="text-blue-600 fill-blue-600" />
               </div>
               <div className="flex flex-col hidden lg:flex">
                  <div className="flex items-center gap-1">
                     <span className="font-display font-black text-2xl leading-none tracking-tight text-white uppercase">OneStop</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                     <span className="font-display font-bold text-[10px] uppercase tracking-[0.4em] text-blue-500/90">MENTOR</span>
                  </div>
               </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 w-full">
               {[
                  { id: 'overview', icon: TrendingUp, label: 'Command Center' },
                  { id: 'sessions', icon: Calendar, label: 'Mission Log' },
                  { id: 'mentees', icon: Users, label: 'Cadet Roster' },
                  { id: 'settings', icon: Settings, label: 'Configuration' },
               ].map(item => (
                  <button
                     key={item.id}
                     onClick={() => { setActiveTab(item.id); setOpenEdit(false); }}
                     className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${activeTab === item.id ? 'text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  >
                     {activeTab === item.id && (
                        <motion.div layoutId="activeTab" className="absolute inset-0 bg-blue-600" initial={false} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                     )}
                     <span className="relative z-10 flex items-center gap-3">
                        <item.icon size={20} className={activeTab === item.id ? "text-white" : "group-hover:scale-110 transition-transform"} />
                        <span className="hidden lg:block">{item.label}</span>
                     </span>
                  </button>
               ))}
            </nav>

            {/* Sidebar Divider */}
            <div className="px-8 my-6">
               <div className="h-px bg-white/5 w-full" />
            </div>

            <div className="p-4 mt-auto">
               <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 backdrop-blur-md flex items-center gap-3 group cursor-pointer hover:border-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all bg-white/5 flex items-center justify-center">
                     {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" />
                     ) : (
                        <User size={20} className="text-slate-500" />
                     )}
                  </div>
                  <div className="hidden lg:block overflow-hidden">
                     <p className="text-sm font-bold truncate text-white group-hover:text-blue-400 transition-colors">{user.name}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/80 mt-0.5">Mentor Tier</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth">
            <div className="p-6 lg:p-12 max-w-[1600px] mx-auto pb-32">

               {/* Header Section */}
               <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div>
                     <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500">
                        Hello, {user.name.split(' ')[0]}
                     </h1>
                     <p className="text-slate-400 font-medium text-lg">Your daily mentorship briefing is ready.</p>
                  </div>

                  <div className="flex gap-4">
                     {!user.mentorApproved && (
                        <div className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg shadow-amber-500/10 animate-pulse">
                           <AlertTriangle size={16} /> <span>Profile Under Review</span>
                        </div>
                     )}
                     <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-sm font-bold text-slate-300">
                        <Clock size={16} className="text-blue-500" />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                     </div>
                  </div>
               </header>



               {/* Overview Tab */}
               {activeTab === 'overview' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                     {/* STATS BENTO GRID */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Revenue Card */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] relative group overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
                           <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-300"><DollarSign size={24} /></div>
                                 <div className="px-3 py-1 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/10">Revenue</div>
                              </div>
                              <h3 className="text-4xl font-black text-white mb-1 tracking-tight">₹{stats.earnings.toLocaleString()}</h3>
                              <p className="text-slate-500 text-sm font-bold">Total Earnings</p>
                           </div>
                        </div>

                        {/* Mentees Card */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] relative group overflow-hidden hover:border-blue-500/30 transition-all duration-500">
                           <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300"><Users size={24} /></div>
                                 <div className="px-3 py-1 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/10">Active</div>
                              </div>
                              <h3 className="text-4xl font-black text-white mb-1 tracking-tight">{mentees.length}</h3>
                              <p className="text-slate-500 text-sm font-bold">Cadets enrolled</p>
                           </div>
                        </div>

                        {/* Sessions Card */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] relative group overflow-hidden hover:border-purple-500/30 transition-all duration-500">
                           <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform duration-300"><CheckCircle size={24} /></div>
                                 <div className="px-3 py-1 bg-purple-500/5 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/10">{stats.hours}h</div>
                              </div>
                              <h3 className="text-4xl font-black text-white mb-1 tracking-tight">{stats.sessions}</h3>
                              <p className="text-slate-500 text-sm font-bold">Missions Complete</p>
                           </div>
                        </div>

                        {/* Performance Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-20"><BarChart size={100} /></div>
                           <div className="relative z-10 h-full flex flex-col justify-between">
                              <div>
                                 <h3 className="text-xl font-black text-white mb-1">Top Tier</h3>
                                 <p className="text-blue-200 text-xs font-medium leading-relaxed max-w-[150px]">You are in the top 10% of mentors this month.</p>
                              </div>
                              <button
                                 onClick={() => document.getElementById('activity-feed')?.scrollIntoView({ behavior: 'smooth' })}
                                 className="w-full py-2.5 bg-white text-blue-700 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors shadow-lg mt-4 active:scale-95"
                              >
                                 View Operational Feed
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* OPERATIONAL STATUS BREAKDOWN (NEW REVENUE TREND MINI) */}
                     <div id="activity-feed" className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]" />
                        <div className="flex justify-between items-center mb-10">
                           <div>
                              <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                 <Zap size={16} className="text-blue-500" /> Operational Activity
                              </h2>
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Real-time performance metrics</p>
                           </div>
                           <div className="flex gap-2">
                              {['Sessions', 'Earnings', 'Growth'].map(tag => (
                                 <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{tag}</span>
                              ))}
                           </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                           <div className="space-y-6">
                              <div className="flex justify-between items-end">
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Training Success</span>
                                 <span className="text-2xl font-black text-emerald-400">98%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="flex justify-between items-end">
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Response</span>
                                 <span className="text-2xl font-black text-blue-400">1.2h</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="flex justify-between items-end">
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mentor Score</span>
                                 <span className="text-2xl font-black text-purple-400">4.9</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '95%' }} className="h-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* MAIN CONTENT SPLIT */}
                     <div className="grid lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN: 2/3 */}
                        <div className="lg:col-span-2 space-y-8">

                           {/* PENDING REQUESTS */}
                           {pendingSessions.length > 0 && (
                              <div className="space-y-4">
                                 <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Incoming Transmissions
                                 </h2>
                                 {pendingSessions.map(session => (
                                    <div key={session._id} className="bg-[#0a0a0a] border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                                       <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none" />

                                       <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                                          <div className="flex items-center gap-5 w-full sm:w-auto">
                                             <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/5 bg-white/5 flex items-center justify-center">
                                                {session.mentee?.avatar ? (
                                                   <img src={session.mentee?.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                   <Users size={24} className="text-slate-600" />
                                                )}
                                             </div>
                                             <div>
                                                <h3 className="text-xl font-bold text-white mb-1">{session.mentee?.name}</h3>
                                                <div className="flex items-center gap-3">
                                                   <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded border border-blue-500/20">{session.serviceTitle}</span>
                                                   <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                                      <Calendar size={12} className="text-slate-600" />
                                                      {new Date(session.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                      <span className="w-1 h-1 bg-slate-700 rounded-full mx-1" />
                                                      <Clock size={12} className="text-slate-600" />
                                                      {session.scheduledTime?.startTime || session.scheduledTime?.toString()}
                                                   </span>
                                                </div>
                                             </div>
                                          </div>

                                          <div className="flex gap-3 w-full sm:w-auto">
                                             <button
                                                disabled={processingSessionId === session._id}
                                                onClick={() => handleStatusUpdate(session._id, 'cancelled')}
                                                className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                                             >
                                                Decline
                                             </button>
                                             <button
                                                disabled={processingSessionId === session._id}
                                                onClick={() => openLinkUpdateModal(session, false)}
                                                className="px-8 py-3 bg-white text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                             >
                                                Accept Mission
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}

                           {/* UPCOMING OPERATIONS */}
                           <div>
                              <div className="flex justify-between items-end mb-6">
                                 <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={16} className="text-blue-500" /> Upcoming Operations
                                 </h2>
                                 <button onClick={() => setActiveTab('sessions')} className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">View All Schedule</button>
                              </div>

                              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-2">
                                 {upcomingSessions.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-slate-600">
                                       <Calendar size={48} className="mb-4 opacity-20" />
                                       <p className="text-sm font-bold uppercase tracking-widest">No operations scheduled</p>
                                    </div>
                                 ) : (
                                    <div className="space-y-1">
                                       {upcomingSessions.slice(0, 4).map((session, i) => (
                                          <div key={session._id} className="group p-4 hover:bg-white/5 rounded-2xl transition-colors flex items-center justify-between">
                                             <div className="flex items-center gap-5">
                                                {/* Date Widget */}
                                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-white/5 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-colors">
                                                   <span className="text-[10px] font-black text-blue-500 uppercase">{new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                   <span className="text-xl font-black text-white leading-none">{new Date(session.scheduledDate).getDate()}</span>
                                                </div>

                                                <div>
                                                   <h4 className="font-bold text-white text-lg">{session.mentee?.name}</h4>
                                                   <div className="flex items-center gap-2 mt-0.5">
                                                      <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest">{session.serviceTitle}</span>
                                                      <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                      <span className="text-xs font-bold text-slate-500">{session.scheduledTime?.startTime || session.scheduledTime?.toString()}</span>
                                                   </div>
                                                </div>
                                             </div>

                                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {session.meetingLink && (
                                                   <button
                                                      onClick={() => session.meetingLink.includes('jit.si') ? openLinkUpdateModal(session, true) : window.open(session.meetingLink, '_blank')}
                                                      className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                                                   >
                                                      <Video size={18} />
                                                   </button>
                                                )}
                                                <button
                                                   onClick={() => openLinkUpdateModal(session, false)}
                                                   className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                   <Edit size={16} />
                                                </button>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* RIGHT COLUMN: 1/3 (Quick Actions) */}
                        <div className="space-y-6">
                           <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Quick Protocols</h3>
                              <div className="space-y-3">
                                 <button onClick={() => { setActiveTab('settings'); }} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-4 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-slate-400 group-hover:text-white transition-colors"><Settings size={20} /></div>
                                    <div className="text-left">
                                       <div className="font-bold text-white">System Config</div>
                                       <div className="text-xs text-slate-500">Update profile & availability</div>
                                    </div>
                                    <ChevronRight className="ml-auto text-slate-600 group-hover:text-white" size={16} />
                                 </button>

                                 <button onClick={() => setActiveTab('mentees')} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-4 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-slate-400 group-hover:text-white transition-colors"><Users size={20} /></div>
                                    <div className="text-left">
                                       <div className="font-bold text-white">Cadet Roster</div>
                                       <div className="text-xs text-slate-500">Manage your mentees</div>
                                    </div>
                                    <ChevronRight className="ml-auto text-slate-600 group-hover:text-white" size={16} />
                                 </button>

                                 <button onClick={() => { addService(); setActiveTab('settings'); }} className="w-full p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 hover:from-blue-900/30 hover:to-purple-900/30 border border-blue-500/20 rounded-2xl flex items-center gap-4 transition-all group mt-6">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><Plus size={20} /></div>
                                    <div className="text-left">
                                       <div className="font-bold text-white">New Service</div>
                                       <div className="text-xs text-blue-200">Create a new offering</div>
                                    </div>
                                    <ChevronRight className="ml-auto text-blue-200 group-hover:translate-x-1 transition-transform" size={16} />
                                 </button>
                              </div>
                           </div>
                        </div>

                     </div>
                  </div>
               )}

               {/* Sessions Tab */}
               {activeTab === 'sessions' && (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                     <div className="flex justify-between items-center mb-8">
                        <div>
                           <h2 className="text-3xl font-black text-white">Mission Logs</h2>
                           <p className="text-slate-400">Complete history of all mentorship operations.</p>
                        </div>
                     </div>

                     {sessions.length === 0 ? (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-20 text-center">
                           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                              <Calendar size={40} />
                           </div>
                           <h3 className="text-xl font-bold text-white mb-2">No Missions Found</h3>
                           <p className="text-slate-500">Your logbook is currently empty.</p>
                        </div>
                     ) : (
                        <div className="grid gap-4">
                           {sessions.map(session => (
                              <div key={session._id} className="bg-[#0a0a0a] border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all group flex flex-col md:flex-row items-center gap-6">
                                 <div className="flex items-center gap-5 flex-1">
                                    <div className="relative">
                                       <img src={session.mentee?.avatar} className="w-14 h-14 rounded-2xl object-cover bg-black ring-2 ring-white/5 shadow-xl" />
                                       <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${session.status === 'confirmed' ? 'bg-blue-500' :
                                          session.status === 'completed' ? 'bg-emerald-500' :
                                             session.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                          }`} />
                                    </div>
                                    <div>
                                       <h3 className="font-black text-xl text-white tracking-tight leading-tight">{session.mentee?.name}</h3>
                                       <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{session.serviceTitle}</span>
                                          <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                          <span className="text-xs font-bold text-slate-500">{new Date(session.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} @ {session.scheduledTime?.startTime || session.scheduledTime?.toString()}</span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${session.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                       session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                          session.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                             'bg-red-500/10 text-red-500 border-red-500/20'
                                       }`}>
                                       {session.status}
                                    </div>

                                    <div className="flex items-center gap-2 ml-auto md:ml-0">
                                       {session.status === 'confirmed' && (
                                          <button
                                             onClick={() => handleStatusUpdate(session._id, 'completed')}
                                             className="px-6 py-2.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-600/20 transition-all active:scale-95"
                                          >
                                             Finalize
                                          </button>
                                       )}
                                       {session.meetingLink && session.status === 'confirmed' && (
                                          <button
                                             onClick={() => window.open(session.meetingLink, '_blank')}
                                             className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                                          >
                                             <Video size={18} />
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* Mentees Tab */}
               {activeTab === 'mentees' && (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                     <div className="flex justify-between items-center mb-8">
                        <div>
                           <h2 className="text-3xl font-black text-white">Cadet Roster</h2>
                           <p className="text-slate-400">Manage and track your active mentorship connections.</p>
                        </div>
                     </div>

                     {mentees.length === 0 ? (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-20 text-center">
                           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                              <Users size={40} />
                           </div>
                           <h3 className="text-xl font-bold text-white mb-2">No Cadets Found</h3>
                           <p className="text-slate-500">Wait for your first training request.</p>
                        </div>
                     ) : (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                           {mentees.map(mentee => (
                              <div key={mentee._id} className="group bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

                                 <div className="flex flex-col items-center text-center relative z-10 mb-8">
                                    <div className="relative mb-4">
                                       {mentee.avatar ? (
                                          <img src={mentee.avatar} className="w-24 h-24 rounded-[2rem] object-cover bg-black ring-4 ring-white/5 group-hover:ring-blue-500/30 transition-all" />
                                       ) : (
                                          <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-500 ring-4 ring-white/5 group-hover:ring-blue-500/30 transition-all">
                                             <Users size={32} />
                                          </div>
                                       )}
                                       <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                                       </div>
                                    </div>
                                    <h3 className="font-black text-2xl text-white mb-1 tracking-tight">{mentee.name}</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">{mentee.email}</p>
                                 </div>

                                 <div className="grid grid-cols-3 gap-4 mb-8">
                                    <button onClick={() => window.open(`https://wa.me/${mentee.mobile?.replace(/\D/g, '')}`, '_blank')} className="py-4 bg-white/5 hover:bg-green-500/20 hover:text-green-400 rounded-2xl text-slate-400 transition-all flex justify-center border border-white/5 hover:border-green-500/20 shadow-inner group-hover:scale-105" title="WhatsApp Connect">
                                       <Phone size={20} />
                                    </button>
                                    <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="py-4 bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 rounded-2xl text-slate-400 transition-all flex justify-center border border-white/5 hover:border-purple-500/20 shadow-inner group-hover:scale-105" title="Google Meet">
                                       <Video size={20} />
                                    </button>
                                    <button onClick={() => window.location.href = `/chat?chatWith=${mentee._id}`} className="py-4 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-2xl text-slate-400 transition-all flex justify-center border border-white/5 hover:border-blue-500/20 shadow-inner group-hover:scale-105" title="Direct Message">
                                       <MessageSquare size={20} />
                                    </button>
                                 </div>

                                 <button
                                    onClick={() => setSelectedStudent(mentee)}
                                    className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-3 group/rev"
                                 >
                                    <Award size={20} className="text-blue-600 group-hover/rev:rotate-12 transition-transform" />
                                    Performance Review
                                 </button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* Configuration Tab */}
               {activeTab === 'settings' && (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                     <div className="flex justify-between items-end mb-8">
                        <div>
                           <h2 className="text-3xl font-black text-white">System Config</h2>
                           <p className="text-slate-400 font-medium">Calibrate your profile and mentorship protocols.</p>
                        </div>
                        <button
                           onClick={handleSaveSettings}
                           disabled={updating}
                           className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                        >
                           {updating ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} className="text-blue-600" />}
                           Save Calibration
                        </button>
                     </div>

                     <div className="grid lg:grid-cols-3 gap-12">
                        {/* LEFT: Identity & Bio */}
                        <div className="lg:col-span-2 space-y-12">
                           {/* Profile Section */}
                           <section className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-5"><User size={120} /></div>
                              <h3 className="text-sm font-bold text-blue-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                 <div className="w-1.5 h-6 bg-blue-600 rounded-full" /> Public Identity
                              </h3>
                              <div className="grid md:grid-cols-2 gap-8">
                                 <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Enterprise</label>
                                    <input type="text" value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-bold placeholder:text-slate-700" placeholder="e.g. Google, SpaceX" />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Years of Service</label>
                                    <input type="number" value={editForm.experience} onChange={e => setEditForm({ ...editForm, experience: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-bold" />
                                 </div>
                              </div>
                              <div className="mt-8 space-y-3">
                                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Specialization Tags</label>
                                 <input type="text" value={editForm.expertise} onChange={e => setEditForm({ ...editForm, expertise: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="Frontend, System Design, Career Guidance" />
                              </div>
                              <div className="mt-8 space-y-3">
                                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Personal Mission Statement</label>
                                 <textarea rows={5} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none resize-none transition-all font-medium leading-relaxed" placeholder="Briefly describe your mentorship philosophy..." />
                              </div>
                           </section>

                           {/* Services Section */}
                           <section className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-5"><DollarSign size={120} /></div>
                              <div className="flex justify-between items-center mb-8">
                                 <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full" /> Service Matrix
                                 </h3>
                                 <button onClick={addService} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                                    <Plus size={20} />
                                 </button>
                              </div>

                              <div className="space-y-4">
                                 {services.map((service, idx) => (
                                    <div key={idx} className="group bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 p-6 rounded-3xl flex flex-wrap gap-6 items-end relative transition-all">
                                       <button onClick={() => removeService(idx)} className="absolute -top-2 -right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75 group-hover:scale-100"><Trash2 size={14} /></button>

                                       <div className="flex-1 min-w-[250px] space-y-2">
                                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Protocol Title</label>
                                          <input type="text" value={service.title} onChange={e => updateService(idx, 'title', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors" />
                                       </div>
                                       <div className="w-48 space-y-2">
                                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment Type</label>
                                          <select value={service.type} onChange={e => updateService(idx, 'type', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none cursor-pointer appearance-none">
                                             <option value="1:1 Call">1:1 Call</option>
                                             <option value="Resume Review">Resume Review</option>
                                             <option value="Mock Interview">Mock Interview</option>
                                          </select>
                                       </div>
                                       <div className="w-32 space-y-2">
                                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Credit Value (₹)</label>
                                          <input type="number" value={service.price} onChange={e => updateService(idx, 'price', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-mono" />
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </section>
                        </div>

                        {/* RIGHT: Availability Grid */}
                        <div className="space-y-8">
                           <section className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 h-fit">
                              <h3 className="text-sm font-bold text-purple-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                 <div className="w-1.5 h-6 bg-purple-600 rounded-full" /> Availability Mesh
                              </h3>

                              <div className="space-y-6">
                                 {availability.map((dayObj, dayIdx) => (
                                    <div key={dayObj.day} className="space-y-3">
                                       <div className="flex items-center justify-between">
                                          <span className="text-xs font-black text-white uppercase tracking-widest">{dayObj.day}</span>
                                          <span className="text-[10px] font-bold text-slate-500">{dayObj.slots.length} Slots Active</span>
                                       </div>
                                       <div className="grid grid-cols-3 gap-2">
                                          {validSlots.map(slot => (
                                             <button
                                                key={slot}
                                                onClick={() => toggleSlot(dayIdx, slot)}
                                                className={`py-2 rounded-lg text-[10px] font-black transition-all border ${dayObj.slots.includes(slot)
                                                   ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                   : 'bg-white/[0.02] text-slate-600 border-transparent hover:border-white/10 hover:text-slate-400'
                                                   }`}
                                             >
                                                {slot.split(' ')[0]}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </section>
                        </div>
                     </div>
                  </div>
               )}

            </div>
         </div >

         {/* Modals Still Exist for fallback or specific actions */}
         <AnimatePresence>
            {openEdit && activeTab !== 'settings' && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                  {/* (Existing modal content can stay or be removed if tab is enough. 
                     I'll keep it as a fallback but suggest using the tab.) */}
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="bg-[#050505] border border-white/10 rounded-[2.5rem] w-full max-w-4xl h-[85vh] shadow-2xl shadow-blue-900/20相对 flex flex-col overflow-hidden"
                  >
                     {/* Modal Header */}
                     <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-20">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                           <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Settings size={24} /></div>
                           Quick Configuration
                        </h2>
                        <button onClick={() => setOpenEdit(false)} className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 text-slate-400 transition-colors"><X size={20} /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">

                        {/* Section: Profile */}
                        <div className="space-y-6">
                           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <User size={16} /> Public Identity
                           </h3>

                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-slate-400 ml-1">Company / Organization</label>
                                 <div className="relative group">
                                    <Briefcase className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input type="text" value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium" placeholder="Where do you work?" />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-slate-400 ml-1">Experience (Years)</label>
                                 <div className="relative group">
                                    <Clock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input type="number" value={editForm.experience} onChange={e => setEditForm({ ...editForm, experience: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium" />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">Expertise Tags (Comma Separated)</label>
                              <input type="text" value={editForm.expertise} onChange={e => setEditForm({ ...editForm, expertise: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium" placeholder="e.g. Frontend, System Design, Career Growth" />
                           </div>

                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 ml-1">Bio & Mentorship Style</label>
                              <textarea rows={4} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-slate-600 font-medium leading-relaxed" placeholder="Write a short intro regarding your mentorship style..." />
                           </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        {/* Section: Services */}
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                 <DollarSign size={16} /> Service Matrix
                              </h3>
                              <button onClick={addService} className="text-xs font-bold bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-blue-600/20 hover:border-blue-600"><Plus size={14} /> Add Protocol</button>
                           </div>

                           <div className="grid gap-4">
                              {services.map((service, idx) => (
                                 <div key={idx} className="bg-[#0a0a0a] border border-white/5 hover:border-white/10 p-5 rounded-2xl flex flex-wrap gap-4 items-end relative group transition-all">
                                    <button onClick={() => removeService(idx)} className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75 group-hover:scale-100"><Trash2 size={14} /></button>

                                    <div className="flex-1 min-w-[200px] space-y-1.5">
                                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service Title</label>
                                       <input type="text" value={service.title} onChange={e => updateService(idx, 'title', e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors font-medium" placeholder="Service Name" />
                                    </div>
                                    <div className="w-40 space-y-1.5">
                                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</label>
                                       <div className="relative">
                                          <select value={service.type} onChange={e => updateService(idx, 'type', e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl pl-3 pr-8 py-2 text-sm text-white focus:border-blue-500 outline-none appearance-none font-medium cursor-pointer">
                                             <option value="1:1 Call" className="bg-[#111]">1:1 Call</option>
                                             <option value="Resume Review" className="bg-[#111]">Resume Review</option>
                                             <option value="Mock Interview" className="bg-[#111]">Mock Interview</option>
                                          </select>
                                          <ChevronRight className="absolute right-3 top-2.5 text-slate-500 rotate-90 pointer-events-none" size={14} />
                                       </div>
                                    </div>
                                    <div className="w-28 space-y-1.5">
                                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                                       <input type="number" value={service.price} onChange={e => updateService(idx, 'price', Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-colors font-mono" />
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        {/* Section: Availability */}
                        <div className="space-y-6">
                           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Clock size={16} /> Temporal Availability
                           </h3>
                           <div className="grid gap-3">
                              {availability.map((dayObj, dayIdx) => (
                                 <div key={dayObj.day} className="flex flex-col xl:flex-row gap-4 xl:items-center bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
                                    <div className="w-28 font-bold text-white flex items-center gap-2">
                                       <div className={`w-2 h-2 rounded-full ${dayObj.slots.length > 0 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`} />
                                       {dayObj.day}
                                    </div>
                                    <div className="flex-1 flex flex-wrap gap-2">
                                       {validSlots.map(slot => (
                                          <button
                                             key={slot}
                                             onClick={() => toggleSlot(dayIdx, slot)}
                                             className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${dayObj.slots.includes(slot)
                                                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20'
                                                : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10 hover:text-slate-300'
                                                }`}
                                          >
                                             {slot}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                     </div>

                     {/* Modal Footer */}
                     <div className="p-6 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex justify-end gap-3 z-20">
                        <button onClick={() => setOpenEdit(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-white transition-colors">Abort</button>
                        <button
                           onClick={handleSaveSettings}
                           disabled={updating}
                           className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg shadow-white/10 hover:scale-[1.02] active:scale-[0.98]"
                        >
                           {updating && <Loader className="animate-spin" size={18} />} Save Configuration
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}

            {/* Feedback Modal */}
            {selectedStudent && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#050505] border border-white/10 rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                     <button onClick={() => setSelectedStudent(null)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors"><X size={20} /></button>

                     <h2 className="text-2xl font-black mb-2 text-white">Direct Feedback</h2>
                     <p className="text-slate-400 text-sm mb-8">Send a review for <span className="text-blue-400 font-bold">{selectedStudent.name}</span></p>

                     <div className="space-y-6">
                        <textarea rows={6} value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-white focus:border-blue-500 outline-none resize-none placeholder:text-slate-600 leading-relaxed" placeholder={`Write helpful feedback for ${selectedStudent.name}...`} />
                        <div className="flex justify-end">
                           <button onClick={() => handleAddFeedback(selectedStudent._id)} disabled={sendingFeedback} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]">
                              {sendingFeedback ? <Loader className="animate-spin" size={20} /> : <Send size={20} />} Transmit Feedback
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}

            {/* Link Update Custom Modal */}
            {linkUpdateModal && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="bg-[#050505] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
                  >
                     <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
                     <button onClick={() => setLinkUpdateModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors"><X size={20} /></button>

                     <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <Video size={36} className="text-blue-500" />
                     </div>

                     <h2 className="text-2xl font-black mb-2 text-white text-center">Update Uplink</h2>
                     <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed px-4">
                        {updatingSession?.isJitsiFix
                           ? "Legacy connection detected. Establish a new Google Meet channel."
                           : "Provide a secure Google Meet link for this session."}
                     </p>

                     <div className="space-y-4">
                        <button
                           onClick={() => window.open('https://meet.google.com/new', '_blank')}
                           className="w-full py-4 bg-white/5 hover:bg-white/10 text-blue-400 font-bold rounded-2xl text-sm flex items-center justify-center gap-3 border border-white/5 transition-all group"
                        >
                           <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Generate New Frequency
                        </button>

                        <div className="relative group">
                           <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                              <Video size={18} className="text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                           </div>
                           <input
                              type="text"
                              value={newLinkInput}
                              onChange={e => setNewLinkInput(e.target.value)}
                              className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-white focus:border-blue-500 outline-none text-sm transition-all placeholder:text-slate-600 font-mono"
                              placeholder="Paste secure link..."
                           />
                        </div>

                        <button
                           onClick={submitLinkUpdate}
                           disabled={!newLinkInput.trim()}
                           className="w-full py-4 bg-white text-black hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] mt-2"
                        >
                           Update Protocol
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
