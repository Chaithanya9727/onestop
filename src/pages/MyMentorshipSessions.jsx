import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import {
   Calendar, Clock, CheckCircle, XCircle, Video, MessageSquare,
   User, Briefcase, ChevronRight, AlertCircle, Loader, X, ExternalLink, Star
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
         loadSessions(); // Reload to update status
      } catch (err) {
         showToast("Failed to submit review", "error");
      } finally {
         setSubmittingReview(false);
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

   // Filter Logic
   const upcomingSessions = sessions.filter(s => ["pending", "confirmed"].includes(s.status));
   const pastSessions = sessions.filter(s => ["completed", "cancelled", "rejected"].includes(s.status));

   const displaySessions = tab === "upcoming" ? upcomingSessions : pastSessions;

   if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]"><Loader className="animate-spin text-blue-600" size={32} /></div>;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-6 md:p-10 pb-20 pt-24 relative overflow-hidden transition-colors duration-300">

         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px]" />
         </div>

         <div className="max-w-5xl mx-auto relative z-10">

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
               <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                     <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><Calendar className="text-blue-600 dark:text-blue-400" size={24} /></div>
                     Mentorship
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">Manage your upcoming schedules and learning history.</p>
               </div>

               {/* Tabs */}
               <div className="bg-white dark:bg-[#0f1014] p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 flex shadow-lg shadow-slate-200/50 dark:shadow-none">
                  <button
                     onClick={() => setTab("upcoming")}
                     className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${tab === "upcoming" ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                  >
                     Upcoming
                  </button>
                  <button
                     onClick={() => setTab("past")}
                     className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${tab === "past" ? 'bg-slate-800 text-white dark:bg-white/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                  >
                     History
                  </button>
               </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-6">
               <AnimatePresence mode="popLayout">
                  {displaySessions.length === 0 ? (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 bg-white dark:bg-[#0f1014] rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-slate-500">
                           <Calendar size={40} />
                        </div>
                        <p className="text-slate-900 dark:text-white font-bold text-xl mb-2">No {tab} sessions</p>
                        <p className="text-slate-500 dark:text-slate-400">You don't have any sessions in this category.</p>
                        {!isMentor && tab === "upcoming" && (
                           <button onClick={() => window.location.href = '/mentors'} className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                              Find a Mentor
                           </button>
                        )}
                     </motion.div>
                  ) : (
                     displaySessions.map((session, i) => (
                        <motion.div
                           key={session._id}
                           layout
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.05 }}
                           className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col lg:flex-row gap-8 items-start lg:items-center group"
                        >
                           {/* Date & Time Box */}
                           <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl min-w-[120px] border border-blue-100 dark:border-blue-500/10 group-hover:scale-105 transition-transform">
                              <span className="text-xs font-black uppercase text-blue-400 tracking-widest mb-1">
                                 {new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-4xl font-black text-blue-600 dark:text-blue-400 leading-none">
                                 {new Date(session.scheduledDate).getDate()}
                              </span>
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 bg-white/50 dark:bg-white/5 px-3 py-1 rounded-lg backdrop-blur-sm">
                                 {session.scheduledTime}
                              </span>
                           </div>

                           {/* Info */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3 flex-wrap">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${session.status === 'confirmed' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' :
                                    session.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                                       'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                                    }`}>
                                    {session.status}
                                 </span>
                                 <span className="text-slate-300 dark:text-slate-700">|</span>
                                 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Briefcase size={12} /> {session.serviceType}
                                 </span>
                              </div>

                              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 truncate">
                                 {session.serviceTitle}
                              </h3>

                              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium flex-wrap">
                                 {isMentor ? (
                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                                       <User size={14} className="text-purple-500" /> Mentee: <span className="text-slate-900 dark:text-white font-bold">{session.mentee?.name}</span>
                                    </div>
                                 ) : (
                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                                       <Briefcase size={14} className="text-purple-500" /> Mentor: <span className="text-slate-900 dark:text-white font-bold">{session.mentor?.name}</span>
                                    </div>
                                 )}
                                 <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                                    <Clock size={14} className="text-blue-500" /> {session.duration} min
                                 </div>
                              </div>

                              {/* Meeting Link Display */}
                              {session.meetingLink && session.status === 'confirmed' && (
                                 <button
                                    onClick={() => window.open(session.meetingLink, '_blank')}
                                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all hover:scale-105 active:scale-95"
                                 >
                                    <Video size={16} /> Join Meeting
                                    <ExternalLink size={12} className="opacity-50 ml-1" />
                                 </button>
                              )}
                           </div>

                           {/* Actions */}
                           <div className="flex flex-col gap-3 w-full lg:w-auto mt-4 lg:mt-0">

                              {isMentor && session.status === 'pending' && (
                                 <div className="flex gap-2 w-full">
                                    <button
                                       disabled={processingId === session._id}
                                       onClick={() => handleStatusUpdate(session._id, 'confirmed', `https://meet.jit.si/OneStop-${session._id}`)}
                                       className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                                    >
                                       {processingId === session._id ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={18} />} Accept
                                    </button>
                                    <button
                                       disabled={processingId === session._id}
                                       onClick={() => handleStatusUpdate(session._id, 'cancelled')}
                                       className="px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20"
                                    >
                                       <X size={20} />
                                    </button>
                                 </div>
                              )}

                              {isMentor && session.status === 'confirmed' && (
                                 <button
                                    disabled={processingId === session._id}
                                    onClick={() => handleStatusUpdate(session._id, 'completed')}
                                    className="w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                 >
                                    <CheckCircle size={18} /> Mark Complete
                                 </button>
                              )}

                              <button
                                 onClick={() => window.location.href = `/chat?user=${isMentor ? session.mentee?._id : session.mentor?._id}`}
                                 className="w-full px-6 py-3 bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-white font-bold rounded-xl text-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                              >
                                 <MessageSquare size={18} /> Message
                              </button>

                              {/* Rate Mentor Button (Mentee Only, Completed, Not Rated) */}
                              {!isMentor && session.status === 'completed' && !session.rating && (
                                 <button
                                    onClick={() => openReviewModal(session._id)}
                                    className="w-full px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                                 >
                                    <Star size={18} /> Rate Mentor
                                 </button>
                              )}
                              {!isMentor && session.status === 'completed' && session.rating > 0 && (
                                 <div className="w-full px-6 py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-xl text-sm flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-500/20 cursor-default">
                                    <Star size={16} fill="currentColor" /> {session.rating}/5 Rated
                                 </div>
                              )}
                           </div>

                        </motion.div>
                     ))
                  )}
               </AnimatePresence>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
               {reviewModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
                     <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-[#0f1014] p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10 relative"
                     >
                        <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={20} /></button>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Rate Session</h2>
                        <p className="text-slate-500 text-center mb-6">How was your mentorship session?</p>

                        <div className="flex justify-center gap-2 mb-6">
                           {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110 focus:scale-110">
                                 <Star size={36} className={`${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                              </button>
                           ))}
                        </div>

                        <textarea
                           rows={4}
                           placeholder="Write a review (optional)..."
                           value={reviewText}
                           onChange={(e) => setReviewText(e.target.value)}
                           className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:border-blue-500 outline-none mb-6 resize-none"
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
         </div>
      </div>
   );
}
