import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Star, Filter, ArrowRight, Sparkles, Loader } from "lucide-react";
import { motion } from "framer-motion";

export default function FindMentor() {
   const { get } = useApi();
   const [mentors, setMentors] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [domainFilter, setDomainFilter] = useState("");

   useEffect(() => {
      loadMentors();
   }, [search, domainFilter]);

   const loadMentors = async () => {
      try {
         setLoading(true);
         const query = new URLSearchParams();
         if (search) query.append("search", search);
         if (domainFilter) query.append("expertise", domainFilter);

         const data = await get(`/mentorship/list?${query.toString()}`);
         setMentors(data || []);
      } catch (error) {
         console.error("Failed to load mentors", error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">
         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[120px] transition-colors" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
         </div>

         {/* Hero Header */}
         <div className="relative pt-32 pb-20 px-6 overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative z-10">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={14} /> Top 1% Mentors
                  </span>
               </motion.div>

               <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight text-slate-900 dark:text-white"
               >
                  Master Your Career <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">With Expert Guidance</span>
               </motion.h1>
               <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Book 1:1 sessions with industry experts from top companies for resume reviews, mock interviews, and career guidance.
               </p>

               {/* Search Bar */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-2 rounded-2xl flex items-center max-w-2xl mx-auto shadow-2xl relative z-20 group"
               >
                  <div className="pl-4 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors"><Search size={24} /></div>
                  <input
                     type="text"
                     placeholder="Search by role, company, or skill..."
                     value={search} onChange={e => setSearch(e.target.value)}
                     className="flex-1 px-4 py-3 bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                  />
                  <button onClick={loadMentors} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                     Search
                  </button>
               </motion.div>
            </div>
         </div>

         {/* Main Content */}
         <div className="max-w-7xl mx-auto px-6 relative z-20">

            {/* Chips / Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
               {["All", "Engineering", "Design", "Product", "Marketing", "Data Science"].map((cat) => (
                  <button
                     key={cat}
                     onClick={() => setDomainFilter(cat === "All" ? "" : cat)}
                     className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border
                  ${(domainFilter === cat || (cat === "All" && !domainFilter))
                           ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-xl"
                           : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                     {cat}
                  </button>
               ))}
            </div>

            {/* List */}
            {loading ? (
               <div className="min-h-[300px] flex items-center justify-center">
                  <Loader className="animate-spin text-blue-500" size={40} />
               </div>
            ) : mentors.length === 0 ? (
               <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                  <div className="text-xl font-bold text-slate-900 dark:text-white mb-2">No mentors found</div>
                  <p className="text-slate-600 dark:text-slate-400">Try adjusting your search filters.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentors.map((mentor, idx) => (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        key={mentor._id}
                        className="bg-white dark:bg-[#0f1014] rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-xl dark:shadow-none border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-2xl transition-all group relative overflow-hidden"
                     >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-600/5 dark:to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                           <div className="flex items-start gap-5 mb-6">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
                                 <img src={mentor.avatar || "https://ui-avatars.com/api/?name=User"} className="w-full h-full object-cover" alt={mentor.name} />
                              </div>
                              <div>
                                 <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">{mentor.name}</h3>
                                 <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                                    <Briefcase size={14} /> {mentor.mentorProfile?.company || "Tech Company"}
                                 </p>
                                 <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                                    {mentor.mentorProfile?.expertise} • {mentor.mentorProfile?.experience} Yrs Exp
                                 </p>
                                 <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                    <span>{mentor.averageRating || "New"}</span>
                                    {mentor.totalReviews > 0 && <span className="text-slate-400 font-medium">({mentor.totalReviews} reviews)</span>}
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-wrap gap-2 mb-8">
                              {mentor.mentorProfile?.services?.slice(0, 3).map((s, i) => (
                                 <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded-lg border border-slate-200 dark:border-white/5">
                                    {s.type}
                                 </span>
                              ))}
                              {(!mentor.mentorProfile?.services?.length) && (
                                 <span className="text-xs text-slate-500 italic">No services listed yet</span>
                              )}
                           </div>

                           <div className="pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Starting at</span>
                                 <span className="text-xl font-black text-slate-900 dark:text-white">
                                    ₹{Math.min(...(mentor.mentorProfile?.services?.map(s => s.price) || [0])) || "Free"}
                                 </span>
                              </div>
                              <Link
                                 to={`/mentor/${mentor._id}`}
                                 className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg shadow-slate-900/10 dark:shadow-white/10"
                              >
                                 View Profile <ArrowRight size={16} />
                              </Link>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            )}

         </div>
      </div>
   );
}
