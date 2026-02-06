import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import {
   Calendar, Clock, CheckCircle, XCircle, Video, MessageSquare,
   User, Briefcase, ChevronRight, AlertCircle, Loader, X, ExternalLink, Star,
   MoreHorizontal, Shield, Sparkles, Plus
} from "lucide-react";
import { useToast } from "../components/ToastProvider";

export default function MyMentorshipSessions() {
   const { user } = useAuth();
   const { get, patch, post } = useApi();
   const { showToast } = useToast();

   const [loading, setLoading] = useState(true);
   const [sessions, setSessions] = useState([]);
   const [tab, setTab] = useState("upcoming"); // upcoming, past
   const [processingId, setProcessingId] = useState(null);

   // Review Modal State
   const [reviewModalOpen, setReviewModalOpen] = useState(false);
   const [selectedSessionId, setSelectedSessionId] = useState(null);
   const [rating, setRating] = useState(0);
   const [reviewText, setReviewText] = useState("");
   const [submittingReview, setSubmittingReview] = useState(false);

   // Link Update State
   const [linkUpdateModal, setLinkUpdateModal] = useState(false);
   const [newLinkInput, setNewLinkInput] = useState("");
   const [updatingSessionForLink, setUpdatingSessionForLink] = useState(null);

   const openReviewModal = (sessionId) => {
      setSelectedSessionId(sessionId);
      setRating(0);
      setReviewText("");
      setReviewModalOpen(true);
   };

   const submitReview = async () => {
      if (rating === 0) return showToast("Please select a rating", "warning");
      try {
         setSubmittingReview(true);
         await post(`/mentorship/sessions/${selectedSessionId}/review`, { rating, review: reviewText });
         showToast("Review submitted successfully", "success");
         setReviewModalOpen(false);
         loadSessions();
      } catch (err) {
         showToast("Failed to submit review", "error");
      } finally {
         setSubmittingReview(false);
      }
   };



   const openLinkUpdateModal = (session) => {
      setUpdatingSessionForLink(session);
      setNewLinkInput("");
      setLinkUpdateModal(true);
   };

   const submitLinkUpdate = async () => {
      if (!updatingSessionForLink || !newLinkInput.trim()) return;

      try {
         await handleStatusUpdate(updatingSessionForLink._id, updatingSessionForLink.status, newLinkInput.trim());
         setLinkUpdateModal(false);
         setNewLinkInput("");
         setUpdatingSessionForLink(null);

         // Open the new link immediately
         window.open(newLinkInput.trim(), '_blank');
      } catch (err) {
         console.error(err);
      }
   };

   const loadSessions = async () => {
      try {
         setLoading(true);
         const data = await get("/mentorship/sessions/my");
         setSessions(data || []);
      } catch (err) {
         console.error(err);
         showToast("Failed to load sessions", "error");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadSessions();
   }, []);

   const handleStatusUpdate = async (sessionId, newStatus, meetingLink = "") => {
      try {
         setProcessingId(sessionId);
         await patch(`/mentorship/sessions/${sessionId}/status`, {
            status: newStatus,
            meetingLink: meetingLink || undefined
         });
         showToast(`Session ${newStatus}`, "success");
         loadSessions();
      } catch (err) {
         showToast("Failed to update session", "error");
      } finally {
         setProcessingId(null);
      }
   };

   const isMentor = user.role === "mentor";
   const upcomingSessions = sessions.filter(s => ["pending", "confirmed"].includes(s.status));
   const pastSessions = sessions.filter(s => ["completed", "cancelled", "rejected"].includes(s.status));
   const displaySessions = tab === "upcoming" ? upcomingSessions : pastSessions;

   // Helper: Get next upcoming session
   const nextSession = upcomingSessions.filter(s => s.status === 'confirmed').sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))[0];

   if (loading) return <div className="h-screen flex items-center justify-center bg-[#030712] text-white"><Loader className="animate-spin text-blue-600" size={32} /></div>;

   return (
      <div className="min-h-screen bg-[#030712] text-white p-6 md:p-10 pb-20 pt-24 font-sans selection:bg-blue-500/30">

         <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
         </div>

         <div className="max-w-5xl mx-auto relative z-10">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
               <div>
                  <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                     <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-600/20"><Calendar size={28} className="text-white" /></span>
                     My Schedule
                  </h1>
                  <p className="text-slate-400 font-medium ml-1">Track your mentorship sessions and progress.</p>
               </div>

               {/* Custom Tab Switcher */}
               <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 relative">
                  {/* Active slide background could be added here for sweeter animation */}
                  <button
                     onClick={() => setTab("upcoming")}
                     className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'upcoming' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                     Upcoming
                  </button>
                  <button
                     onClick={() => setTab("past")}
                     className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'past' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                     History
                  </button>
               </div>
            </div>

            {/* Featured Next Session (Only shows in upcoming tab if exists) */}
            {tab === "upcoming" && nextSession && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-12 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group"
               >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-colors" />
                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                     <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs uppercase tracking-widest mb-4 border border-blue-500/30">
                           <Sparkles size={12} /> Up Next
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-2 leading-tight">{nextSession.serviceTitle}</h2>
                        <p className="text-lg text-blue-200 font-medium">with {isMentor ? nextSession.mentee?.name : nextSession.mentor?.name}</p>
                     </div>
                     <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 md:pl-8 pt-8 md:pt-0 w-full md:w-auto">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div>
                              <p className="text-xs font-bold text-blue-300 uppercase opacity-70 mb-1">Date</p>
                              <p className="text-xl font-bold">{new Date(nextSession.scheduledDate).toLocaleDateString()}</p>
                           </div>
                           <div>
                              <p className="text-xs font-bold text-blue-300 uppercase opacity-70 mb-1">Time</p>
                              <p className="text-xl font-bold">{nextSession.scheduledTime}</p>
                           </div>
                        </div>
                        {nextSession.meetingLink && (
                           <button
                              onClick={() => {
                                 if (nextSession.meetingLink.includes('jit.si')) {
                                    openLinkUpdateModal(nextSession);
                                 } else {
                                    window.open(nextSession.meetingLink, '_blank');
                                 }
                              }}
                              className="w-full py-4 bg-white text-blue-900 font-black rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20"
                           >
                              <Video size={20} /> Join Call Now
                           </button>
                        )}
                     </div>
                  </div>
               </motion.div>
            )}

            {/* Sessions List */}
            <div className="space-y-6">
               <AnimatePresence mode="popLayout">
                  {displaySessions.length === 0 ? (
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 bg-[#0f1014] rounded-[2.5rem] border border-dashed border-white/10">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-500">
                           <Calendar size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No {tab} sessions</h3>
                        <p className="text-slate-400">You don't have any items in this list.</p>
                        {!isMentor && tab === "upcoming" && (
                           <button onClick={() => window.location.href = '/mentors'} className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                              Find a Mentor
                           </button>
                        )}
                     </motion.div>
                  ) : (
                     displaySessions.filter(s => s._id !== nextSession?._id || tab !== "upcoming").map((session, i) => (
                        <motion.div
                           key={session._id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.05 }}
                           className="bg-[#0f1014] border border-white/5 hover:border-white/10 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 transition-all group relative overflow-hidden"
                        >
                           {/* Status Indicator Bar */}
                           <div className={`absolute left-0 top-0 bottom-0 w-2 ${session.status === 'confirmed' ? 'bg-emerald-500' :
                              session.status === 'pending' ? 'bg-amber-500' : 'bg-slate-700'
                              }`} />

                           <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${session.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    session.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                       'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                    }`}>
                                    {session.status}
                                 </span>
                                 <span className="text-slate-600">|</span>
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase size={12} /> {session.serviceType}
                                 </span>
                              </div>

                              <h3 className="text-2xl font-bold text-white mb-2">{session.serviceTitle}</h3>

                              <div className="flex items-center gap-6 mt-4 md:mt-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 overflow-hidden">
                                       <img src={isMentor ? session.mentee?.avatar : session.mentor?.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                       <div className="text-xs font-bold text-slate-500 uppercase">With</div>
                                       <div className="font-bold text-white text-sm">{isMentor ? session.mentee?.name : session.mentor?.name}</div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col md:items-end justify-between gap-6 border-t md:border-t-0 border-white/10 pt-6 md:pt-0 md:pl-8 md:border-l md:w-64">
                              <div className="text-left md:text-right">
                                 <div className="text-2xl font-black text-white">{new Date(session.scheduledDate).getDate()} <span className="text-sm font-bold text-slate-500 uppercase">{new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}</span></div>
                                 <div className="text-sm font-bold text-slate-400 mt-1 flex items-center md:justify-end gap-2"><Clock size={14} /> {session.scheduledTime}</div>
                              </div>

                              <div className="flex flex-col gap-2 w-full">
                                 {session.status === 'confirmed' && session.meetingLink && <button
                                    onClick={() => {
                                       if (session.meetingLink.includes('jit.si')) {
                                          openLinkUpdateModal(session);
                                       } else {
                                          window.open(session.meetingLink, '_blank');
                                       }
                                    }}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                                 >
                                    <Video size={16} /> Join
                                 </button>
                              )}

                                 {/* Mentor Actions: Accept/Decline */}
                                 {isMentor && session.status === 'pending' && (
                                    <div className="flex gap-2">
                                       <button
                                          disabled={processingId === session._id}
                                          onClick={() => {
                                             const meetLink = prompt('Paste your Google Meet link (create one at meet.google.com/new):');
                                             if (meetLink && meetLink.trim()) {
                                                handleStatusUpdate(session._id, 'confirmed', meetLink.trim());
                                             } else if (meetLink !== null) {
                                                alert('Please provide a valid meeting link to confirm the session.');
                                             }
                                          }}
                                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm"
                                       >
                                          Accept
                                       </button>
                                       <button
                                          disabled={processingId === session._id}
                                          onClick={() => handleStatusUpdate(session._id, 'cancelled')}
                                          className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm"
                                       >
                                          <X size={16} />
                                       </button>
                                    </div>
                                 )}

                                 {/* Review Button */}
                                 {(!isMentor && session.status === 'completed' && !session.rating) && (
                                    <button onClick={() => openReviewModal(session._id)} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                                       <Star size={16} /> Rate
                                    </button>
                                 )}

                                 {/* Candidate Cancel Button */}
                                 {!isMentor && ['pending', 'confirmed'].includes(session.status) && (
                                    <button
                                       disabled={processingId === session._id}
                                       onClick={() => {
                                          if (window.confirm("Are you sure you want to cancel this session?")) {
                                             handleStatusUpdate(session._id, 'cancelled');
                                          }
                                       }}
                                       className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-red-500/20 transition-colors"
                                    >
                                       <X size={16} /> Cancel Request
                                    </button>
                                 )}

                                 <button
                                    onClick={() => window.location.href = `/chat?chatWith=${isMentor ? session.mentee?._id : session.mentor?._id}`}
                                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-white/5"
                                 >
                                    <MessageSquare size={16} /> Message
                                 </button>
                              </div>
                           </div>

                        </motion.div>
                     ))
                  )}
               </AnimatePresence>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
               {reviewModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                     <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#0f1014] p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 relative"
                     >
                        <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                        <h2 className="text-2xl font-black text-white mb-2 text-center">Rate Session</h2>
                        <p className="text-slate-500 text-center mb-6">How was your mentorship session?</p>

                        <div className="flex justify-center gap-2 mb-8">
                           {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110 focus:scale-110">
                                 <Star size={36} className={`${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                              </button>
                           ))}
                        </div>

                        <textarea
                           rows={4}
                           placeholder="Write a review (optional)..."
                           value={reviewText}
                           onChange={(e) => setReviewText(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none mb-6 resize-none placeholder:text-slate-600"
                        />

                        <button
                           onClick={submitReview}
                           disabled={submittingReview}
                           className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                           {submittingReview ? <Loader className="animate-spin" size={20} /> : "Submit Review"}
                        </button>
                     </motion.div>
                  </div>
               )}

            </AnimatePresence>

            {/* Link Update Custom Modal */}
            <AnimatePresence>
               {linkUpdateModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0f1014] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl relative"
                     >
                        <button onClick={() => setLinkUpdateModal(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white"><X size={20} /></button>

                        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                           <Video size={32} className="text-blue-500" />
                        </div>

                        <h2 className="text-xl font-bold mb-2 text-white text-center">Update Meeting Link</h2>
                        <p className="text-slate-400 text-center text-sm mb-6">
                           This session is using an old video link. Please provide a new Google Meet link to join the session.
                        </p>

                        <div className="space-y-4">
                           <button
                              onClick={() => window.open('https://meet.google.com/new', '_blank')}
                              className="w-full py-3 bg-white/5 hover:bg-white/10 text-blue-400 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-white/5 transition-colors"
                           >
                              <Plus size={16} /> Create New Google Meet
                           </button>

                           <div className="relative">
                              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                 <Video size={16} className="text-slate-500" />
                              </div>
                              <input
                                 type="text"
                                 value={newLinkInput}
                                 onChange={e => setNewLinkInput(e.target.value)}
                                 className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 outline-none text-sm"
                                 placeholder="Paste Google Meet link here..."
                              />
                           </div>

                           <button
                              onClick={submitLinkUpdate}
                              disabled={!newLinkInput.trim()}
                              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                           >
                              Update & Join
                           </button>
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
}
