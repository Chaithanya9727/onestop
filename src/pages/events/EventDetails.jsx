import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ToastProvider";
import { 
  Calendar, MapPin, Users, Trophy, BookOpen, HelpCircle, AlertTriangle, PlayCircle, CheckCircle, Clock, Share2, ArrowLeft, Loader, Star, Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { get, post } = useApi();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await get(`/events/${id}`);
        setEvent(res);
      } catch (err) {
        console.error("FetchEvent error:", err);
        showToast("Failed to load event details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await post(`/events/${id}/register`);
      showToast("🎉 Successfully registered!", "success");
      setTimeout(() => navigate("/events/my/registrations"), 1000);
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Registration failed";
      
      if (msg.toLowerCase().includes("already")) {
        showToast("You are already registered for this event.", "warning");
        setTimeout(() => navigate("/events/my/registrations"), 1000);
      } else if (msg.toLowerCase().includes("deadline")) {
        showToast("⏳ Registration deadline has passed.", "warning");
      } else {
        showToast(`Registration failed: ${msg}`, "error");
      }
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]"><Loader className="animate-spin text-blue-600 dark:text-blue-500" size={40} /></div>;

  if (!event) return (
     <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-slate-400">
        <AlertTriangle size={64} className="mb-6 opacity-20"/>
        <p className="text-2xl font-bold mb-2">Event not found</p>
        <button onClick={() => navigate('/events')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">Back to Events</button>
     </div>
  );

  const now = new Date();
  const isOngoing = new Date(event.startDate) <= now && now <= new Date(event.endDate);
  const isCompleted = new Date(event.endDate) < now;
  const registrationClosed = new Date(event.registrationDeadline) < now;
  const isRegistered = event.participants && user && event.participants.some(p => p.userId === user._id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
       {/* Background */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px]" />
       </div>

       {/* Top Navigation */}
       <div className="relative z-20 pt-8 px-6 md:px-12 max-w-7xl mx-auto">
          <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group px-4 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
             <span className="font-bold">Back to Events</span>
          </button>
       </div>

       {/* Hero Section */}
       <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
             
             {/* Left Column: Info */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-wrap gap-3 text-sm font-bold tracking-wide uppercase">
                   <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-500/20">{event.category}</span>
                   {isOngoing && <span className="px-4 py-1.5 bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-100 dark:border-green-500/20 animate-pulse flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Live Now</span>}
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                   {event.title}
                </h1>
                
                {event.subtitle && <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{event.subtitle}</p>}
                
                <div className="flex flex-col gap-6 py-8 border-y border-slate-200 dark:border-white/10">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm"><Calendar size={24}/></div>
                      <div>
                         <p className="text-xs text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Timeline</p>
                         <p className="font-bold text-lg">{new Date(event.startDate).toLocaleDateString()} – {new Date(event.endDate).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm"><MapPin size={24}/></div>
                      <div>
                         <p className="text-xs text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Location</p>
                         <p className="font-bold text-lg">{event.location || "Online Event"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-sm"><Users size={24}/></div>
                      <div>
                         <p className="text-xs text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Participants</p>
                         <p className="font-bold text-lg">{event.participants?.length || 0} Registered <span className="text-slate-400 text-sm font-medium ml-2">(Max Team: {event.maxTeamSize})</span></p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                   {isCompleted ? (
                      <button disabled className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold rounded-2xl cursor-not-allowed w-full md:w-auto flex items-center justify-center gap-2">
                         <Clock size={20}/> Event Ended
                      </button>
                   ) : isRegistered ? (
                       <div className="flex flex-col sm:flex-row w-full gap-4">
                           {event.category === 'quiz' && isOngoing ? (
                             <button onClick={() => navigate(`/events/${id}/play`)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 flex-1">
                                <PlayCircle size={20}/> Play Quiz Now
                             </button>
                           ) : (
                             <button disabled className="px-8 py-4 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-default flex-1">
                                <CheckCircle size={20}/> Registration Confirmed
                             </button>
                           )}
                           
                           {event.category !== 'quiz' && (
                              <button onClick={() => navigate(`/events/submit/${id}`)} className="px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 flex-1 shadow-lg shadow-slate-200/50 dark:shadow-none">
                                 <Trophy size={20}/> Submit Project
                              </button>
                           )}
                       </div>
                   ) : registrationClosed ? (
                      <button disabled className="px-8 py-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto">
                          <Clock size={20}/> Registration Closed
                      </button>
                   ) : (
                       <button onClick={handleRegister} disabled={registering} className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 w-full md:w-auto text-lg">
                          {registering ? <Loader className="animate-spin"/> : "Register For Event"}
                       </button>
                   )}
                   
                   {event.linkedJob && (
                       <button onClick={() => navigate(`/jobs/${event.linkedJob}`)} className="px-6 py-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                          <Briefcase size={20} /> View Job Opportunity
                       </button>
                   )}
                </div>
             </motion.div>

             {/* Right Column: Visuals */}
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative">
                <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-100 dark:bg-white/5 aspect-video group">
                   {event.coverImage?.url ? (
                      <img src={event.coverImage.url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                   ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
                         <Trophy size={80} className="text-slate-200 dark:text-white/10"/>
                      </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"/>
                </div>

                {/* Prize Card Overlay */}
                {event.prizes?.length > 0 && (
                   <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.4 }}
                     className="absolute -bottom-8 -left-8 right-8 bg-white/90 dark:bg-[#0f1014]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl hidden md:block"
                   >
                       <div className="flex items-center gap-3 mb-5 text-yellow-600 dark:text-yellow-400 font-black uppercase tracking-widest text-sm">
                          <Trophy size={18} /> Prize Pool
                       </div>
                       <div className="space-y-4">
                          {event.prizes.slice(0, 3).map((p, i) => (
                             <div key={i} className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${i===0 ? 'bg-yellow-100 dark:bg-yellow-500 text-yellow-700 dark:text-black' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white'}`}>
                                   #{i+1}
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">{p}</span>
                             </div>
                          ))}
                       </div>
                   </motion.div>
                )}
             </motion.div>

          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
             {/* Main Content */}
             <div className="md:col-span-2 space-y-8">
                <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                   <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-900 dark:text-white">
                     <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center"><BookOpen size={20}/></span> 
                     About Event
                   </h2>
                   <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {event.description || "No description provided."}
                   </div>
                </div>

                {event.rules?.length > 0 && (
                   <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                      <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-900 dark:text-white">
                        <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center"><AlertTriangle size={20}/></span>
                        Rules & Guidelines
                      </h2>
                      <div className="grid gap-4">
                         {event.rules.map((r, i) => (
                            <div key={i} className="flex gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                               <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-500 flex items-center justify-center shrink-0 text-sm font-bold">{i+1}</div>
                               <span className="flex-1 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{r}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
                
                {event.faqs?.length > 0 && (
                   <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                      <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-900 dark:text-white">
                        <span className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center"><HelpCircle size={20}/></span>
                        FAQs
                      </h2>
                      <div className="space-y-4">
                         {event.faqs.map((f, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm">
                               <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex gap-3 text-lg"><span className="text-purple-600 dark:text-purple-400 font-black">Q.</span> {f.q}</h3>
                               <p className="text-slate-600 dark:text-slate-400 pl-8 text-base leading-relaxed font-medium">{f.a}</p>
                             </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>

             {/* Sidebar */}
             <div className="md:col-span-1 space-y-8">
                
                {/* Mobile Prizes View */}
                {event.prizes?.length > 0 && (
                   <div className="md:hidden bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-[2.5rem] p-8">
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-yellow-700 dark:text-yellow-400"><Trophy size={20}/> Prizes</h2>
                      <ul className="space-y-4">
                         {event.prizes.map((p, i) => (
                            <li key={i} className="text-slate-700 dark:text-slate-300 flex gap-3 font-medium"><span className="text-yellow-600 dark:text-yellow-500 font-black">#{i+1}</span> {p}</li>
                         ))}
                      </ul>
                   </div>
                )}

                <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-24">
                   <h3 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Share Event</h3>
                   <div className="flex gap-2 mb-8">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          showToast("Link copied!", "success");
                        }}
                        className="w-full py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-all font-bold group"
                      >
                         <Share2 size={18} className="group-hover:scale-110 transition-transform"/> Copy Link
                      </button>
                   </div>
                   
                   <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-bold">Looking for teammates?</p>
                      <button onClick={() => navigate('/team-finder')} className="w-full py-4 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2">
                         <Users size={18}/> Find Teammates
                      </button>
                   </div>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
}
