import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
   User, Briefcase, Clock, Calendar, CheckCircle, ArrowLeft, Star, Share2, Shield,
   MapPin, Globe, Loader, ChevronRight, Check, MessageSquare, Phone
} from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { useSocket } from "../socket";

export default function MentorProfilePublic() {
   const { id } = useParams();
   const navigate = useNavigate();
   const { get, post } = useApi();
   const { user } = useAuth();
   const { showToast } = useToast();
   const { socket } = useSocket();

   const [mentor, setMentor] = useState(null);
   const [loading, setLoading] = useState(true);

   // Booking State
   const [step, setStep] = useState(1); // 1: Service, 2: Date/Time, 3: Confirm
   const [selectedService, setSelectedService] = useState(null);
   const [selectedDate, setSelectedDate] = useState("");
   const [selectedTime, setSelectedTime] = useState("");
   const [note, setNote] = useState("");
   const [booking, setBooking] = useState(false);

   useEffect(() => {
      loadMentor();
   }, [id]);

   const loadMentor = async () => {
      try {
         const data = await get(`/mentorship/${id}`);
         // Normalize availability:Backend stores objects, Frontend works better with strings
         if (data?.mentorProfile?.availability) {
            data.mentorProfile.availability = data.mentorProfile.availability.map(day => ({
               ...day,
               slots: day.slots.map(s => typeof s === 'object' ? s.startTime : s)
            }));
         }
         setMentor(data);
      } catch (error) {
         console.error(error);
         showToast("Mentor not found", "error");
         navigate("/mentors");
      } finally {
         setLoading(false);
      }
   };

   const handleBook = async () => {
      if (!user) return navigate("/login?redirect=/mentor/" + id);

      try {
         setBooking(true);
         await post("/mentorship/book", {
            mentorId: id,
            serviceTitle: selectedService.title,
            serviceType: selectedService.type,
            price: selectedService.price,
            duration: selectedService.duration,
            scheduledDate: selectedDate,
            scheduledTime: selectedTime,
            notes: note || "I'm looking forward to this session!"
         });

         // Notify Mentor via Socket
         if (socket) {
            socket.emit("new_session_request", {
               mentorId: id,
               menteeName: user.name,
               service: selectedService.title
            });
         }

         showToast("Session requested successfully!", "success");
         navigate(`/chat?chatWith=${id}`);
      } catch (err) {
         showToast("Booking failed. Please try again.", "error");
      } finally {
         setBooking(false);
      }
   };

   const getNextDays = () => {
      const dates = [];
      for (let i = 1; i <= 14; i++) {
         const d = new Date();
         d.setDate(d.getDate() + i);
         dates.push(d.toISOString().split('T')[0]);
      }
      return dates;
   };

   const getSlotsForDay = (dateStr) => {
      if (!mentor?.mentorProfile?.availability) return [];

      const targetDate = new Date(dateStr).toDateString();
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
      const dayAvail = mentor.mentorProfile.availability.find(a => a.day === dayName);

      let slots = dayAvail ? dayAvail.slots : [];

      // Filter out booked sessions if any
      if (mentor.bookedSessions && slots.length > 0) {
         const bookedTimes = mentor.bookedSessions
            .filter(s => new Date(s.scheduledDate).toDateString() === targetDate)
            .map(s => s.scheduledTime);

         slots = slots.filter(slot => {
            const timeLabel = slot.startTime || slot;
            return !bookedTimes.includes(timeLabel);
         });
      }

      return slots;
   };

   if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white"><Loader className="animate-spin text-blue-500" size={32} /></div>;
   if (!mentor) return null;

   return (
      <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-blue-500/30">

         {/* Navbar Placeholder */}
         <div className="h-20" />

         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 pb-20">

            {/* Left Column: Mentor Profile */}
            <div className="lg:col-span-8 space-y-8">
               <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold mb-4">
                  <ArrowLeft size={18} /> Back to Mentors
               </button>

               {/* Hero Card */}
               <div className="bg-[#0f1014] border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                  <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                     <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl shrink-0">
                        <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                           <div>
                              <h1 className="text-4xl font-black text-white mb-2">{mentor.name}</h1>
                              <p className="text-xl text-blue-500 font-bold flex items-center gap-2">
                                 <Briefcase size={20} /> {mentor.mentorProfile?.company || "Tech Professional"}
                              </p>
                           </div>
                           <div className="flex gap-2">
                              {/* Message & WhatsApp Buttons - Only for participants with active sessions */}
                              {mentor.hasSession ? (
                                 <>
                                    <button
                                       onClick={() => {
                                          if (!user) {
                                             navigate(`/login?redirect=/mentor/${mentor._id}`);
                                          } else {
                                             navigate(`/chat?chatWith=${mentor._id}`);
                                          }
                                       }}
                                       className="p-3 bg-blue-600 border border-blue-500 hover:bg-blue-500 rounded-full transition-colors text-white shadow-lg shadow-blue-500/20"
                                       title="Message Mentor"
                                    >
                                       <MessageSquare size={20} />
                                    </button>

                                    {mentor.mobile && (
                                       <button
                                          onClick={() => window.open(`https://wa.me/${mentor.mobile.replace(/\D/g, '')}`, '_blank')}
                                          className="p-3 bg-green-600 border border-green-500 hover:bg-green-500 rounded-full transition-colors text-white shadow-lg shadow-green-500/20"
                                          title="Chat on WhatsApp"
                                       >
                                          <Phone size={20} />
                                       </button>
                                    )}
                                 </>
                              ) : (
                                 <div className="flex items-center">
                                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                       <Shield size={12} /> Chat Locked
                                    </div>
                                 </div>
                              )}

                              <button className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                 <Share2 size={20} />
                              </button>
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                           <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl font-bold text-sm flex items-center gap-2">
                              <Star size={16} fill="currentColor" /> {mentor.averageRating} ({mentor.totalReviews} reviews)
                           </div>
                           <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl font-bold text-sm flex items-center gap-2">
                              <Briefcase size={16} /> {mentor.mentorProfile?.experience} Years Exp.
                           </div>
                           <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl font-bold text-sm flex items-center gap-2">
                              <Globe size={16} /> {mentor.mentorProfile?.expertise}
                           </div>
                        </div>

                        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                           <p>{mentor.mentorProfile?.bio || "Experienced professional passionate about helping others grow in their careers."}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Reviews Preview (Simple for now) */}
               <div>
                  <h3 className="text-2xl font-bold text-white mb-6">What Mentees Say</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                     {mentor.reviews && mentor.reviews.length > 0 ? mentor.reviews.slice(0, 4).map((review, i) => (
                        <div key={i} className="bg-[#0f1014] border border-white/5 p-6 rounded-3xl">
                           <div className="flex items-center gap-2 text-amber-500 mb-3">
                              {[...Array(5)].map((_, idx) => (
                                 <Star key={idx} size={14} fill={idx < review.rating ? "currentColor" : "none"} className={idx < review.rating ? "" : "text-slate-700"} />
                              ))}
                           </div>
                           <p className="text-slate-300 text-sm italic mb-4">"{review.review}"</p>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                 {review.mentee?.avatar && <img src={review.mentee.avatar} className="w-full h-full object-cover" />}
                              </div>
                              <span className="text-sm font-bold text-slate-400">{review.mentee?.name || "Mentee"}</span>
                           </div>
                        </div>
                     )) : (
                        <div className="col-span-2 p-8 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 text-slate-500">
                           No reviews yet. Secure a spot and be the first!
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column: Dynamic Booking Panel */}
            <div className="lg:col-span-4 relative">
               <div className="sticky top-24">
                  <div className="bg-[#0f1014] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">

                     {/* Progress Steps */}
                     <div className="flex justify-between items-center mb-8 px-2">
                        {[1, 2, 3].map(s => (
                           <div key={s} className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                                 {step > s ? <Check size={14} /> : s}
                              </div>
                           </div>
                        ))}
                     </div>

                     <AnimatePresence mode="wait">
                        {/* STEP 1: Select Service */}
                        {step === 1 && (
                           <motion.div
                              key="step1"
                              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                              className="space-y-4"
                           >
                              <h3 className="text-xl font-bold text-white mb-2">Choose a Service</h3>
                              <div className="space-y-3">
                                 {mentor?.mentorProfile?.services?.map((service, idx) => (
                                    <div
                                       key={idx}
                                       onClick={() => setSelectedService(service)}
                                       className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${selectedService === service
                                          ? 'bg-blue-600/10 border-blue-500'
                                          : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'}`}
                                    >
                                       <div className="flex justify-between items-center mb-1">
                                          <h4 className="font-bold text-white">{service.title}</h4>
                                          {selectedService === service && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                                       </div>
                                       <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">{service.type}</p>
                                       <div className="flex items-center justify-between text-sm">
                                          <span className="font-bold text-blue-400">₹{service.price}</span>
                                          <span className="text-slate-500 flex items-center gap-1"><Clock size={12} /> {service.duration}m</span>
                                       </div>
                                    </div>
                                 ))}
                                 {(!mentor?.mentorProfile?.services?.length) && <div className="text-slate-500 text-center py-4">No services available.</div>}
                              </div>
                              <button
                                 onClick={() => setStep(2)}
                                 disabled={!selectedService}
                                 className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-6 ${selectedService ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                              >
                                 Next Step <ChevronRight size={16} />
                              </button>
                           </motion.div>
                        )}

                        {/* STEP 2: Date & Time */}
                        {step === 2 && (
                           <motion.div
                              key="step2"
                              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                              className="space-y-6"
                           >
                              <div className="flex items-center gap-2 mb-2">
                                 <button onClick={() => setStep(1)} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><ArrowLeft size={16} /></button>
                                 <h3 className="text-xl font-bold text-white">Select Time</h3>
                              </div>

                              {/* Dates */}
                              <div>
                                 <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Available Dates</label>
                                 <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                    {getNextDays().map(date => {
                                       const d = new Date(date);
                                       const isSelected = selectedDate === date;
                                       return (
                                          <button
                                             key={date}
                                             onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
                                             className={`min-w-[70px] p-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${isSelected ? 'bg-white text-black border-white' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                                          >
                                             <span className="text-xs font-bold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                             <span className="text-lg font-black">{d.getDate()}</span>
                                          </button>
                                       )
                                    })}
                                 </div>
                              </div>

                              {/* Slots */}
                              <div>
                                 <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Book a Slot</label>
                                 {selectedDate ? (
                                    <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                       {getSlotsForDay(selectedDate).length > 0 ? getSlotsForDay(selectedDate).map((slot, idx) => {
                                          const timeLabel = slot.startTime || slot;
                                          return (
                                             <button
                                                key={idx}
                                                onClick={() => setSelectedTime(timeLabel)}
                                                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${selectedTime === timeLabel ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                                             >
                                                {timeLabel}
                                             </button>
                                          );
                                       }) : (
                                          <div className="col-span-3 text-center py-4 text-slate-500 text-sm bg-white/5 rounded-xl border border-dashed border-white/10">No slots available.</div>
                                       )}
                                    </div>
                                 ) : (
                                    <div className="text-sm text-slate-500 italic">Select a date first.</div>
                                 )}
                              </div>

                              <button
                                 onClick={() => setStep(3)}
                                 disabled={!selectedTime}
                                 className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4 ${selectedTime ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                              >
                                 Review Booking <ChevronRight size={16} />
                              </button>
                           </motion.div>
                        )}

                        {/* STEP 3: Confirm */}
                        {step === 3 && (
                           <motion.div
                              key="step3"
                              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                           >
                              <div className="flex items-center gap-2 mb-6">
                                 <button onClick={() => setStep(2)} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><ArrowLeft size={16} /></button>
                                 <h3 className="text-xl font-bold text-white">Summary</h3>
                              </div>

                              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4 mb-6">
                                 <div className="flex justify-between">
                                    <span className="text-slate-400 text-sm">Service</span>
                                    <span className="text-white font-bold text-sm text-right">{selectedService?.title}</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-slate-400 text-sm">Date & Time</span>
                                    <span className="text-white font-bold text-sm text-right">{new Date(selectedDate).toLocaleDateString()} at {selectedTime?.startTime || selectedTime}</span>
                                 </div>
                                 <div className="flex justify-between pt-4 border-t border-white/10">
                                    <span className="text-white font-bold text-lg">Total</span>
                                    <span className="text-emerald-400 font-black text-lg">₹{selectedService?.price}</span>
                                 </div>
                              </div>

                              <textarea
                                 value={note}
                                 onChange={e => setNote(e.target.value)}
                                 placeholder="Add a note for the mentor..."
                                 className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 mb-6 focus:border-blue-500 outline-none resize-none h-24"
                              />

                              <button
                                 onClick={handleBook}
                                 disabled={booking}
                                 className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                              >
                                 {booking ? <Loader className="animate-spin" /> : <CheckCircle size={18} />} Request Session
                              </button>
                           </motion.div>
                        )}
                     </AnimatePresence>

                  </div>
               </div>
            </div>

         </div>
      </div>
   );
}
