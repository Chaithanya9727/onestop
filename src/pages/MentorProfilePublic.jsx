import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Briefcase, Clock, Calendar, CheckCircle, ArrowLeft, Star, Share2, Shield } from "lucide-react";
import { useToast } from "../components/ToastProvider";

export default function MentorProfilePublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadMentor();
  }, [id]);

  const loadMentor = async () => {
    try {
      const data = await get(`/mentorship/${id}`);
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
    if (!selectedService || !selectedDate || !selectedTime) {
       return showToast("Please select a service, date, and time.", "warning");
    }

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
         notes: "Auto-booking request"
      });
      showToast("Session requested successfully!", "success");
      navigate("/dashboard"); // Redirect to candidate dashboard
    } catch (err) {
       showToast("Booking failed.", "error");
    } finally {
       setBooking(false);
    }
  };

  // Helper to generate next 7 days dates
  const getNextDays = () => {
     const dates = [];
     for(let i=1; i<=7; i++){
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
     }
     return dates;
  };

  // Helper to get available slots for a day
  const getSlotsForDay = (dateStr) => {
     if (!mentor?.mentorProfile?.availability) return [];
     const date = new Date(dateStr);
     const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }); // "Monday"
     const dayAvail = mentor.mentorProfile.availability.find(a => a.day === dayName);
     return dayAvail ? dayAvail.slots : [];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
  if (!mentor) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 pt-24 px-6">
       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Profile Info */}
          <div className="lg:col-span-2 space-y-8">
             <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors">
                <ArrowLeft size={18} /> Back
             </button>

             {/* Header Card */}
             <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl">
                   <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <div>
                         <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{mentor.name}</h1>
                         <p className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
                            <Briefcase size={20}/> {mentor.mentorProfile?.company || "Tech Professional"}
                         </p>
                      </div>
                      <button className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                         <Share2 size={20} className="text-slate-600 dark:text-slate-300"/>
                      </button>
                   </div>
                   
                   <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                      {mentor.mentorProfile?.bio || "Hey! I'm here to help you grow in your career."}
                   </p>

                   <div className="mt-6 flex gap-4">
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-300 font-bold text-sm">
                         {mentor.mentorProfile?.experience} Years Experience
                      </div>
                      <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-700 dark:text-purple-300 font-bold text-sm">
                         {mentor.mentorProfile?.expertise}
                      </div>
                   </div>
                </div>
             </div>

             {/* Services Selector */}
             <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Select a Service</h3>
                <div className="grid md:grid-cols-2 gap-4">
                   {mentor.mentorProfile?.services?.map((service, idx) => (
                      <div 
                         key={idx}
                         onClick={() => setSelectedService(service)}
                         className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${
                            selectedService === service 
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-[1.02]' 
                            : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                         }`}
                      >
                         <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{service.title}</h4>
                         <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{service.type}</span>
                         <div className="mt-4 flex items-center justify-between">
                            <span className="font-black text-xl text-slate-800 dark:text-white">₹{service.price}</span>
                            <span className="text-sm font-bold text-slate-500 flex items-center gap-1"><Clock size={14}/> {service.duration} min</span>
                         </div>
                      </div>
                   ))}
                   {(!mentor.mentorProfile?.services?.length) && (
                      <p className="text-slate-500 italic">This mentor has not listed any services yet.</p>
                   )}
                </div>
             </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 opacity-95 backdrop-blur-sm">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                   <Calendar className="text-blue-600"/> Book Session
                </h3>

                {selectedService ? (
                   <div className="space-y-6">
                      {/* Date Picker (Simple List) */}
                      <div>
                         <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">1. Select Date</label>
                         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {getNextDays().map(date => (
                               <button 
                                  key={date}
                                  onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
                                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                     selectedDate === date ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                  }`}
                               >
                                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                               </button>
                            ))}
                         </div>
                      </div>

                      {/* Time Slots */}
                      {selectedDate && (
                         <div>
                            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">2. Select Time</label>
                            <div className="grid grid-cols-3 gap-2">
                               {getSlotsForDay(selectedDate).length > 0 ? (
                                  getSlotsForDay(selectedDate).map(slot => (
                                     <button 
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${
                                           selectedTime === slot ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                     >
                                        {slot}
                                     </button>
                                  ))
                               ) : (
                                  <div className="col-span-3 text-sm text-red-500 font-medium bg-red-50 p-2 rounded-lg text-center">
                                     No slots available on this day.
                                  </div>
                               )}
                            </div>
                         </div>
                      )}

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 font-bold">Total</span>
                            <span className="text-2xl font-black text-slate-800 dark:text-white">₹{selectedService.price}</span>
                         </div>
                         <button 
                            onClick={handleBook}
                            disabled={!selectedTime || booking}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
                               selectedTime ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                         >
                            {booking ? "Booking..." : "Confirm Booking"}
                         </button>
                      </div>

                   </div>
                ) : (
                   <div className="py-10 text-center text-slate-400 font-medium">
                      Select a service from the left to view availability and book.
                   </div>
                )}
             </div>
          </div>

       </div>
    </div>
  );
}
