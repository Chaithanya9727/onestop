import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, RefreshCw, Trophy, Users, FileText, Medal, AlertTriangle, Crown
} from "lucide-react";

export default function Leaderboard() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { get } = useApi();

  const [leaderboard, setLeaderboard] = useState([]);
  const [meta, setMeta] = useState({ totalParticipants: 0, totalSubmissions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await get(`/events/${eventId}/leaderboard`);

      setLeaderboard(res.leaderboard || []);
      setMeta({
        totalParticipants: res.totalParticipants || 0,
        totalSubmissions: res.totalSubmissions || 0
      });

    } catch (e) {
      console.error("Leaderboard error:", e);
      setError(e?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const getRankBadge = (rank) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mx-auto shadow-sm"><Crown size={18}/></div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center mx-auto shadow-sm"><Medal size={18}/></div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-sm"><Medal size={18}/></div>;
    return <span className="font-bold text-slate-500 dark:text-slate-400">#{rank}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/20 border-green-200 dark:border-green-500/10";
    if (score >= 75) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/10";
    if (score >= 50) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/10";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/10";
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0a0a0a] min-h-screen py-10 px-6 transition-colors duration-300 relative overflow-hidden">
       {/* Ambient Glow */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
       
       <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="flex items-center gap-4 mb-10">
             <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-600 dark:text-slate-300">
                <ArrowLeft size={20}/>
             </button>
             <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Leaderboard</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Top performers and statistics.</p>
             </div>
             <div className="flex-1"></div>
             <button onClick={load} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-600 dark:text-slate-300">
                <RefreshCw size={20}/>
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
             <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                   <Users size={32}/>
                </div>
                <div>
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Participants</p>
                   <p className="text-4xl font-black text-slate-900 dark:text-white">{meta.totalParticipants}</p>
                </div>
             </div>
             <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                   <FileText size={32}/>
                </div>
                <div>
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Submissions</p>
                   <p className="text-4xl font-black text-slate-900 dark:text-white">{meta.totalSubmissions}</p>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
             {loading ? (
                <div className="p-20 text-center text-slate-400 font-bold flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                  Loading standings...
                </div>
             ) : error ? (
                <div className="p-12 flex flex-col items-center justify-center text-red-500 dark:text-red-400">
                   <AlertTriangle size={48} className="mb-4 opacity-50"/>
                   <p className="font-bold text-lg">{error}</p>
                </div>
             ) : leaderboard.length === 0 ? (
                <div className="p-24 text-center">
                   <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Trophy size={40}/>
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No results yet</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Standings will appear once submissions are evaluated.</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                            <th className="p-6 text-center w-24">Rank</th>
                            <th className="p-6">Participant</th>
                            <th className="p-6 hidden md:table-cell">Email</th>
                            <th className="p-6 hidden sm:table-cell">Team</th>
                            <th className="p-6 text-right">Score</th>
                            <th className="p-6 hidden lg:table-cell">Feedback</th>
                            <th className="p-6 hidden xl:table-cell text-right">Submitted At</th>
                         </tr>
                      </thead>
                      <tbody>
                         <AnimatePresence>
                         {leaderboard.map((row, index) => (
                            <motion.tr 
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors group"
                            >
                               <td className="p-6 text-center">
                                  {getRankBadge(row.rank || index + 1)}
                               </td>
                               <td className="p-6 font-bold text-slate-900 dark:text-white text-lg">{row.name || "—"}</td>
                               <td className="p-6 text-sm text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">{row.email || "—"}</td>
                               <td className="p-6 text-sm text-slate-600 dark:text-slate-300 font-bold hidden sm:table-cell">{row.teamName || "—"}</td>
                               <td className="p-6 text-right">
                                  {row.score != null ? (
                                     <span className={`px-4 py-1.5 rounded-lg text-sm font-black border ${getScoreColor(row.score)}`}>
                                        {row.score}
                                     </span>
                                  ) : <span className="text-slate-400 dark:text-slate-600 font-bold">—</span>}
                               </td>
                               <td className="p-6 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate font-medium hidden lg:table-cell" title={row.feedback}>
                                  {row.feedback || "—"}
                               </td>
                               <td className="p-6 text-xs font-bold text-slate-400 dark:text-slate-500 text-right hidden xl:table-cell">
                                  {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"}
                               </td>
                            </motion.tr>
                         ))}
                         </AnimatePresence>
                      </tbody>
                   </table>
                </div>
             )}
          </div>

       </div>
    </div>
  );
}
