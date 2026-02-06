import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import SubmissionTable from "../../components/events/SubmissionTable";
import { Filter, X, ArrowLeft, Gavel, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JudgePanel() {
   const { id } = useParams(); // eventId
   const { get, post } = useApi();
   const navigate = useNavigate();

   const [event, setEvent] = useState(null);
   const [submissions, setSubmissions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [round, setRound] = useState("");
   const [searchTerm, setSearchTerm] = useState("");

   const load = async () => {
      setLoading(true);
      try {
         const ev = await get(`/events/${id}`);
         setEvent(ev);
         const subs = await get(`/events/${id}/submissions`);
         setSubmissions(subs.submissions || []);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
   }, [id]);

   const filtered = submissions.filter((s) => {
      const matchesRound = round ? String(s.round) === String(round) : true;
      const matchesSearch = searchTerm ?
         (s.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
         (s.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchesRound && matchesSearch;
   });

   const handleScore = async (_submission, payload) => {
      await post(`/events/${id}/evaluate`, payload);
      await load();
   };

   if (loading) return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors">
         <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
         <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Summoning Submissions...</p>
      </div>
   );

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] py-12 px-6 transition-colors duration-300">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
               <div className="flex items-center gap-5">
                  <button onClick={() => navigate(-1)} className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-xl shadow-slate-200/50 dark:shadow-none">
                     <ArrowLeft size={20} />
                  </button>
                  <div>
                     <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 w-fit rounded-full">
                        <Gavel size={14} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Evaluation Chamber</span>
                     </div>
                     <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Judge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-glow-indigo">Interface</span></h1>
                     <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1 font-serif italic text-glow-indigo">Reviewing talent for <span className="text-indigo-600 dark:text-indigo-400 font-bold underline decoration-indigo-500/30 underline-offset-4">{event?.title || "Loading..."}</span></p>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group">
                     <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                     <input
                        type="text"
                        placeholder="Search participant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 shadow-xl shadow-slate-200/50 dark:shadow-none min-w-[280px] text-slate-900 dark:text-white transition-all"
                     />
                  </div>

                  <div className="flex items-center gap-2">
                     <div className="relative">
                        <Filter className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <select
                           value={round}
                           onChange={(e) => setRound(e.target.value)}
                           className="pl-12 pr-10 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:border-indigo-500 appearance-none min-w-[180px] shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white cursor-pointer"
                        >
                           <option value="">All Rounds</option>
                           {event?.rounds?.map(r => (
                              <option key={r.roundNumber} value={r.roundNumber}>Round {r.roundNumber}</option>
                           ))}
                        </select>
                     </div>
                     <AnimatePresence>
                        {round && (
                           <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setRound("")} className="p-3.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-100 transition-colors border border-red-100 dark:border-red-500/20 shadow-lg shadow-red-500/10">
                              <X size={20} />
                           </motion.button>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-[#0f1014] rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 transition-colors overflow-hidden">
               {filtered.length === 0 ? (
                  <div className="py-24 text-center">
                     <Gavel size={64} className="mx-auto text-slate-200 dark:text-white/5 mb-6" />
                     <p className="text-slate-400 dark:text-slate-500 font-black text-xl uppercase tracking-widest">No submissions to display</p>
                     <p className="text-slate-500 dark:text-slate-600 font-medium mt-2">Adjust your filters or wait for candidates to submit.</p>
                  </div>
               ) : (
                  <SubmissionTable submissions={filtered} onScore={handleScore} />
               )}
            </div>

         </motion.div>
      </div>
   );
}
