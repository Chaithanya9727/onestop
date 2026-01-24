import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Edit, MessageSquare, BookOpen, AlertTriangle, CheckCircle, 
  Loader, X, Send, Plus, Trash2, Clock, Calendar, DollarSign, Briefcase, Video 
} from "lucide-react";
import { useToast } from "../components/ToastProvider";

export default function MentorDashboard() {
  const { user, refreshUser } = useAuth();
  const { get, post, put, patch } = useApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [mentorProfile, setMentorProfile] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
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
  const [sessions, setSessions] = useState([]);
  const [processingSessionId, setProcessingSessionId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, menteesData, sessionsData] = await Promise.all([
        get("/users/me"), 
        get("/mentor/mentees"),
        get("/mentorship/sessions/my")
      ]);
      
      const mProfile = profileData.mentorProfile || {};
      setMentorProfile(mProfile);
      setMentees(menteesData.mentees || []);
      setSessions(sessionsData || []);
      
      setEditForm({
        expertise: mProfile.expertise || "",
        experience: mProfile.experience || "",
        bio: mProfile.bio || "",
        company: mProfile.company || ""
      });
      setServices(mProfile.services || []);
      setAvailability(mProfile.availability && mProfile.availability.length > 0 ? mProfile.availability : generateDefaultAvailability());

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

  const generateDefaultAvailability = () => {
     return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => ({
        day, slots: []
     }));
  };

  useEffect(() => {
    loadData();
  }, []);

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
      await put("/mentorship/settings", { ...editForm, services, availability });
      await refreshUser();
      await loadData();
      setOpenEdit(false);
      showToast("Mentor settings updated successfully!", "success");
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white"><Loader className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-6 md:p-10 pb-20 overflow-hidden relative transition-colors duration-300">
       {/* Background */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px] transition-colors" />
       </div>

       <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="relative">
                   <div className="w-20 h-20 rounded-2xl border border-slate-200 dark:border-white/10 p-1 bg-white dark:bg-white/5">
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-1.5 border-2 border-slate-50 dark:border-[#0a0a0a]">
                      <User size={14} className="text-white"/>
                   </div>
                </div>
                <div>
                   <h1 className="text-3xl font-black text-slate-900 dark:text-white">Mentor Dashboard</h1>
                   <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your profile, services, and sessions.</p>
                </div>
             </div>
             
             <button 
                onClick={() => setOpenEdit(true)} 
                className="px-6 py-3 bg-white dark:bg-white text-slate-900 dark:text-black font-bold rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-200 flex items-center gap-2 shadow-lg hover:shadow-xl border border-slate-200 dark:border-transparent"
             >
                <Edit size={18} /> Manage Profile
             </button>
          </div>

          {!user.mentorApproved && (
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center gap-2 font-bold justify-center">
                <AlertTriangle size={20} /> Your mentor profile is under review by admins.
             </motion.div>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
             <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors shadow-xl shadow-slate-200/50 dark:shadow-none">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block">Available Services</span>
                <span className="text-4xl font-black text-slate-900 dark:text-white">{mentorProfile.services?.length || 0}</span>
             </div>
             <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 rounded-3xl p-6 hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors shadow-xl shadow-slate-200/50 dark:shadow-none">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block">Total Mentees</span>
                <span className="text-4xl font-black text-slate-900 dark:text-white">{mentees.length}</span>
             </div>
             <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 rounded-3xl p-6 hover:border-pink-300 dark:hover:border-pink-500/30 transition-colors shadow-xl shadow-slate-200/50 dark:shadow-none">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block">Current Company</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 line-clamp-1">{mentorProfile.company || "Not set"}</span>
             </div>
          </div>

          {/* Main Area */}
          <div>
             {/* Pending */}
             {pendingSessions.length > 0 && (
                <div className="mb-12">
                   <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-amber-500">
                      <Clock size={24}/> Pending Requests 
                      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-black">{pendingSessions.length}</span>
                   </h2>
                   <div className="space-y-4">
                      {pendingSessions.map(session => (
                         <div key={session._id} className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-white/10">
                                  <img src={session.mentee?.avatar} alt={session.mentee?.name} className="w-full h-full object-cover"/>
                               </div>
                               <div>
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{session.mentee?.name}</h3>
                                  <p className="text-amber-600 dark:text-amber-400/80 font-medium text-sm">{session.serviceTitle} • {session.duration} min</p>
                                  <div className="flex gap-4 mt-2 text-sm text-slate-500 font-medium">
                                     <span className="flex items-center gap-1"><Calendar size={14}/> {session.scheduledDate}</span>
                                     <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 px-2 rounded-md">{session.scheduledTime}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                               <button 
                                  onClick={() => handleStatusUpdate(session._id, 'confirmed', `https://meet.jit.si/OneStop-${session._id}`)}
                                  disabled={processingSessionId === session._id}
                                  className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                               >
                                  {processingSessionId === session._id ? <Loader className="animate-spin" size={18}/> : <CheckCircle size={18}/>} Accept
                               </button>
                               <button 
                                  onClick={() => handleStatusUpdate(session._id, 'cancelled')}
                                  disabled={processingSessionId === session._id}
                                  className="flex-1 px-6 py-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent font-bold rounded-xl transition-all"
                               >
                                  Decline
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             )}

             {/* Upcoming */}
             <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><Calendar size={28} className="text-blue-500"/> Upcoming Sessions</h2>
                
                {upcomingSessions.length === 0 ? (
                   <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 rounded-3xl p-10 text-center shadow-lg shadow-slate-200/50 dark:shadow-none">
                      <p className="text-slate-500 font-medium">No confirmed sessions available.</p>
                   </div>
                ) : (
                   <div className="grid md:grid-cols-2 gap-4">
                      {upcomingSessions.map(session => (
                         <div key={session._id} className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group transition-all shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{session.serviceTitle}</h3>
                                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1"><User size={12}/> {session.mentee?.name}</p>
                               </div>
                               <div className="text-right">
                                  <div className="text-xl font-black text-slate-900 dark:text-white">{session.scheduledTime}</div>
                                  <div className="text-xs font-bold text-slate-500 uppercase">{session.scheduledDate}</div>
                               </div>
                            </div>
                            
                            <div className="flex gap-2 mt-6">
                               {session.meetingLink && (
                                  <a href={session.meetingLink} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                                     <Video size={16}/> Join Call
                                  </a>
                               )}
                               <button 
                                  onClick={() => handleStatusUpdate(session._id, 'completed')}
                                  disabled={processingSessionId === session._id}
                                  className="px-4 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white rounded-xl transition-all border border-slate-200 dark:border-white/5 hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-500"
                                  title="Mark Complete"
                               >
                                  <CheckCircle size={18} />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><BookOpen size={28} className="text-purple-500"/> Your Mentees</h2>
             
             {mentees.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none">
                   <User size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                   <p className="text-slate-500 font-bold">No students assigned yet.</p>
                </div>
             ) : (
                <div className="grid md:grid-cols-2 gap-4">
                   {mentees.map((student) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                        key={student._id}
                        className="bg-white dark:bg-[#0f1014] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col items-center md:flex-row md:justify-between gap-6 shadow-xl shadow-slate-200/50 dark:shadow-none"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10">
                               <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <h3 className="font-bold text-lg text-slate-900 dark:text-white">{student.name}</h3>
                               <p className="text-slate-500 dark:text-slate-400 text-sm">{student.email}</p>
                            </div>
                         </div>
                         
                         <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => window.location.href=`/chat?user=${student._id}`} className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-white/10 transition-colors flex items-center justify-center gap-2">
                               <MessageSquare size={16} />
                            </button>
                            <button onClick={() => setSelectedStudent(student)} className="flex-1 md:flex-none px-4 py-2 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                               Feedback
                            </button>
                         </div>
                      </motion.div>
                   ))}
                </div>
             )}
          </div>
       </div>

       {/* MANAGER MODAL */}
       <AnimatePresence>
          {openEdit && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xl">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
                   className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2rem] w-full max-w-4xl h-[85vh] shadow-2xl relative flex flex-col overflow-hidden"
                >
                   <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-[#0a0a0a]">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                         Settings
                      </h2>
                      <button onClick={() => setOpenEdit(false)} className="p-2 bg-slate-200 dark:bg-white/5 rounded-full hover:bg-slate-300 dark:hover:bg-white/10 text-slate-500 dark:text-white transition-colors"><X size={20}/></button>
                   </div>

                   <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] px-6 gap-6">
                      {['profile', 'services', 'availability'].map(tab => (
                         <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 font-bold text-sm uppercase tracking-wider transition-all border-b-2
                            ${activeTab === tab ? 'text-blue-600 dark:text-white border-blue-600 dark:border-blue-500' : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}
                         >
                            {tab}
                         </button>
                      ))}
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#0f1014]">
                      {activeTab === 'profile' && (
                         <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="grid grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-xs font-bold uppercase text-slate-500">Company</label>
                                  <input type="text" value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors" placeholder="e.g. Google" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-xs font-bold uppercase text-slate-500">Exp (Yrs)</label>
                                  <input type="number" value={editForm.experience} onChange={e => setEditForm({...editForm, experience: e.target.value})} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold uppercase text-slate-500">Expertise</label>
                               <input type="text" value={editForm.expertise} onChange={e => setEditForm({...editForm, expertise: e.target.value})} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors" placeholder="Frontend, System Design..." />
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold uppercase text-slate-500">Bio</label>
                               <textarea rows={5} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none resize-none transition-colors" placeholder="Tell us about your journey..." />
                            </div>
                         </div>
                      )}

                      {activeTab === 'services' && (
                         <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                               <p className="text-slate-500 text-sm font-medium">Manage your mentorship offerings.</p>
                               <button onClick={addService} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-500/20">
                                  <Plus size={16}/> Add Service
                               </button>
                            </div>
                            {services.map((service, idx) => (
                               <div key={idx} className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 relative group hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                                  <button onClick={() => removeService(idx)} className="absolute top-4 right-4 text-slate-500 dark:text-slate-600 hover:text-red-500 transition-colors p-2 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-transparent"><Trash2 size={16}/></button>
                                  <div className="grid md:grid-cols-2 gap-4 mb-4 pr-12">
                                     <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Title</label>
                                        <input type="text" value={service.title} onChange={e => updateService(idx, 'title', e.target.value)} className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none"/>
                                     </div>
                                     <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Type</label>
                                        <select value={service.type} onChange={e => updateService(idx, 'type', e.target.value)} className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none">
                                           <option value="1:1 Call">1:1 Call</option>
                                           <option value="Resume Review">Resume Review</option>
                                           <option value="Mock Interview">Mock Interview</option>
                                            <option value="Text Query">Text Query</option>
                                        </select>
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Price (₹)</label>
                                        <input type="number" value={service.price} onChange={e => updateService(idx, 'price', Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none"/>
                                     </div>
                                     <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Duration (Min)</label>
                                        <input type="number" value={service.duration} onChange={e => updateService(idx, 'duration', Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none"/>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      )}

                      {activeTab === 'availability' && (
                         <div className="space-y-4">
                            {availability.map((dayObj, dayIdx) => (
                               <div key={dayObj.day} className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
                                  <div className="bg-white dark:bg-[#0a0a0a] px-4 py-3 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                                     <span className="font-bold text-slate-700 dark:text-slate-300">{dayObj.day}</span>
                                     <span className="text-xs text-slate-500 font-bold bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">{dayObj.slots.length} slots</span>
                                  </div>
                                  <div className="p-4 flex flex-wrap gap-2">
                                     {validSlots.map(slot => (
                                        <button 
                                           key={slot}
                                           onClick={() => toggleSlot(dayIdx, slot)}
                                           className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                              dayObj.slots.includes(slot) 
                                              ? 'bg-blue-600 text-white border-blue-500' 
                                              : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                           }`}
                                        >
                                           {slot}
                                        </button>
                                     ))}
                                  </div>
                               </div>
                            ))}
                         </div>
                      )}
                   </div>

                   <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3">
                      <button onClick={() => setOpenEdit(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">Cancel</button>
                      <button 
                         onClick={handleSaveSettings} 
                         disabled={updating}
                         className="px-8 py-3 bg-white dark:bg-white text-slate-900 dark:text-black font-bold rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-200 flex items-center gap-2 shadow-lg border border-slate-200 dark:border-transparent"
                      >
                         {updating && <Loader className="animate-spin" size={18} />} Save Changes
                      </button>
                   </div>
                </motion.div>
             </div>
          )}

          {selectedStudent && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xl">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
                   <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white"><X size={20}/></button>
                   <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Feedback for <span className="text-blue-600 dark:text-blue-500">{selectedStudent.name}</span></h2>
                   <textarea rows={5} value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none resize-none mb-6" placeholder="Write your feedback..." />
                   <div className="flex justify-end">
                      <button onClick={() => handleAddFeedback(selectedStudent._id)} disabled={sendingFeedback} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
                         {sendingFeedback ? <Loader className="animate-spin" size={18}/> : <Send size={18} />} Send Feedback
                      </button>
                   </div>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );
}
