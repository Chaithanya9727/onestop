import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { Link } from "react-router-dom";
import {
   Search, MapPin, Briefcase, Star, Filter, ArrowRight, Sparkles,
   Loader, Zap, Shield, TrendingUp, Users, Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function FindMentor() {
   const { get } = useApi();
   const [mentors, setMentors] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [activeServiceFilter, setActiveServiceFilter] = useState("All");

   useEffect(() => {
      loadMentors();
   }, [search, activeServiceFilter]);

   const loadMentors = async () => {
      try {
         setLoading(true);
         const query = new URLSearchParams();
         if (search) query.append("search", search);
         // Client side filtering for services if backend doesn't support it fully yet
         // or we can pass it if supported. For now we fetch all and filter in frontend for "All" vs specific.

         const data = await get(`/mentorship/list?${query.toString()}`);

         let filtered = data || [];
         if (activeServiceFilter !== "All") {
            filtered = filtered.filter(m =>
               m.mentorProfile?.services?.some(s => s.type === activeServiceFilter)
            );
         }

         setMentors(filtered);
      } catch (error) {
         console.error("Failed to load mentors", error);
      } finally {
         setLoading(false);
      }
   };

   // Logic: Calculate "Top Rated" or "Super Mentor" status
   const isSuperMentor = (mentor) => {
      return mentor.averageRating >= 4.8 && mentor.totalReviews > 5;
   };

   const categories = [
      { name: "All", icon: Users },
      { name: "1:1 Call", icon: Zap },
      { name: "Resume Review", icon: Shield },
      { name: "Mock Interview", icon: Users },
      { name: "Text Query", icon: TrendingUp },
   ];

   return (
      <div className="min-h-screen bg-[#030712] text-white pb-20 relative overflow-x-hidden font-sans selection:bg-blue-500/30">

         {/* Dynamic Background */}
         <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
            <div className="absolute top-[40%] left-[20%] w-[20vw] h-[20vw] bg-emerald-500/10 rounded-full blur-[100px]" />
         </div>

         {/* Navbar Placeholder/Spacer if needed (assuming Layout handles it) */}
         <div className="h-20" />

         <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-20">
               <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 font-bold text-sm mb-6 backdrop-blur-md shadow-lg shadow-blue-500/10"
               >
                  <Sparkles size={14} /> <span>Elite Mentorship Network</span>
               </motion.div>

               <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]"
               >
                  Accelerate your career with <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                     World-Class Mentors
                  </span>
               </motion.h1>

               <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
               >
                  Get personalized guidance, resume reviews, and mock interviews from engineers and leaders at top tech companies.
               </motion.p>

               {/* Search Interface */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                  className="p-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row items-center max-w-3xl mx-auto backdrop-blur-xl shadow-2xl"
               >
                  <div className="flex-1 flex items-center px-4 w-full h-14">
                     <Search className="text-slate-400 mr-3" size={20} />
                     <input
                        type="text"
                        placeholder="Search by role, company, or skill..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 w-full font-medium"
                     />
                  </div>
                  <button
                     onClick={loadMentors}
                     className="w-full md:w-auto px-8 h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2"
                  >
                     Find Mentor
                  </button>
               </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
               {categories.map((cat, idx) => (
                  <button
                     key={cat.name}
                     onClick={() => setActiveServiceFilter(cat.name)}
                     className={`
                          flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border
                          ${activeServiceFilter === cat.name
                           ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                           : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white'}
                      `}
                  >
                     <cat.icon size={16} /> {cat.name}
                  </button>
               ))}
            </div>

            {/* Content Grid */}
            {loading ? (
               <div className="h-64 flex items-center justify-center">
                  <Loader className="animate-spin text-blue-500" size={32} />
               </div>
            ) : mentors.length === 0 ? (
               <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <Users size={48} className="mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No mentors found</h3>
                  <p className="text-slate-400">Try adjusting your search terms or filters.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentors.map((mentor, index) => (
                     <MentorCard key={mentor._id} mentor={mentor} index={index} isSuper={isSuperMentor(mentor)} />
                  ))}
               </div>
            )}

         </div>
      </div>
   );
}

// Subcomponent for cleaner code
function MentorCard({ mentor, index, isSuper }) {
   const minPrice = mentor.mentorProfile?.services?.length
      ? Math.min(...mentor.mentorProfile.services.map(s => s.price))
      : 0;

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         transition={{ delay: index * 0.05 }}
         className="group relative bg-[#0f1014] border border-white/10 hover:border-blue-500/30 rounded-3xl p-1 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
      >
         <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

         <div className="relative bg-[#0f1014] rounded-[22px] p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex gap-4 mb-6">
               <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                     <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                  </div>
                  {isSuper && (
                     <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-1 rounded-full border-2 border-[#0f1014] shadow-lg" title="Top Rated">
                        <Award size={12} />
                     </div>
                  )}
               </div>
               <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">{mentor.name}</h3>
                  <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                     <Briefcase size={12} className="text-blue-500" />
                     <span className="truncate max-w-[150px]">{mentor.mentorProfile?.company || "Tech Company"}</span>
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/5 w-fit px-2 py-1 rounded-lg text-slate-300">
                     <span>{mentor.mentorProfile?.experience} Yrs Exp</span>
                  </div>
               </div>
            </div>

            {/* Body */}
            <div className="mb-6 flex-1">
               <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {mentor.mentorProfile?.bio || "Experienced professional ready to help you achieve your career goals."}
               </p>

               <div className="flex flex-wrap gap-2">
                  {mentor.mentorProfile?.services?.slice(0, 3).map((s, i) => (
                     <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-white/5 group-hover:border-blue-500/20 group-hover:text-blue-200 transition-colors">
                        {s.type}
                     </span>
                  ))}
               </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
               <div>
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                     <Star size={12} fill="currentColor" />
                     <span>{mentor.averageRating || "N/A"}</span>
                     <span className="text-slate-600">({mentor.totalReviews})</span>
                  </div>
                  <div className="text-white font-black text-lg">
                     ₹{minPrice}<span className="text-xs font-medium text-slate-500 ml-1">/ session</span>
                  </div>
               </div>

               <Link
                  to={`/mentor/${mentor._id}`}
                  className="px-5 py-2.5 bg-white text-black font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all transform group-hover:scale-105"
               >
                  View <ArrowRight size={14} />
               </Link>
            </div>
         </div>
      </motion.div>
   );
}
