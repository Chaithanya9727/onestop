import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, User, Star } from "lucide-react";

export default function GlobalLeaderboard() {
  const { get } = useApi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await get("/users/leaderboard");
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [get]);

  const getRankIcon = (index) => {
    switch(index) {
        case 0: return <Crown size={32} className="text-yellow-500 fill-yellow-500 animate-bounce drop-shadow-lg"/>;
        case 1: return <Medal size={28} className="text-slate-400 fill-slate-300 drop-shadow-md"/>;
        case 2: return <Medal size={28} className="text-amber-700 fill-amber-600 drop-shadow-md"/>;
        default: return <span className="text-xl font-bold text-slate-400 dark:text-slate-500">#{index+1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pb-20 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-100 dark:bg-yellow-600/5 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px] transition-colors" />
       </div>

      <div className="max-w-4xl mx-auto px-6 pt-12 relative z-10">
         <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
               <Trophy size={14} /> Top Performers
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
               Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600 dark:from-yellow-400 dark:to-amber-500">Leaderboard</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-600 dark:text-slate-400 font-medium text-lg">
               Celebrating the most active and skilled members of our community.
            </motion.p>
         </div>

         <div className="bg-white dark:bg-[#0f1014] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-200 dark:border-white/5">
            {loading ? (
                <div className="p-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                   {users.map((user, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        key={user._id} 
                        className={`p-6 flex items-center gap-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${
                            i === 0 ? 'bg-gradient-to-r from-yellow-50/80 to-transparent dark:from-yellow-500/10' : 
                            i === 1 ? 'bg-gradient-to-r from-slate-100/80 to-transparent dark:from-white/5' :
                            i === 2 ? 'bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-600/5' : ''
                        }`}
                      >
                         <div className="w-12 text-center flex-shrink-0 flex justify-center">
                            {getRankIcon(i)}
                         </div>
                         <div className="relative">
                            <div className={`w-14 h-14 rounded-full overflow-hidden border-2 shadow-md ${
                                i === 0 ? 'border-yellow-500 shadow-yellow-500/20' : 
                                i === 1 ? 'border-slate-300 shadow-slate-300' :
                                i === 2 ? 'border-amber-600 shadow-amber-600/20' : 'border-slate-100 dark:border-white/10'
                            }`}>
                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-full h-full object-cover"/>
                            </div>
                            {i < 3 && <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#0f1014] rounded-full p-1"><Star size={12} className="text-yellow-500 fill-yellow-500"/></div>}
                         </div>
                         <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{user.role}</p>
                         </div>
                         <div className="text-right">
                             <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-end gap-1">
                                {user.points || 0}
                                <span className="text-sm font-bold text-yellow-500">XP</span>
                             </div>
                             {i < 3 && <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Top {i+1}</div>}
                         </div>
                      </motion.div>
                   ))}
                   {users.length === 0 && <div className="p-20 text-center text-slate-500 dark:text-slate-400 font-medium">No ranked users yet.</div>}
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
