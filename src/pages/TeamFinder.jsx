import React, { useState, useEffect } from "react";
import { Search, UserPlus, Code2, Mail, ExternalLink, Loader, Filter, Users } from "lucide-react";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import { motion } from "framer-motion";

export default function TeamFinder() {
  const { get } = useApi();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await get("/users"); 
      const teamable = res.filter(u => u.openToTeaming && u._id !== user._id);
      setUsers(teamable);
    } catch (err) {
      console.error("Failed to fetch teammates", err);
      showToast("Could not load teammates.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
      const matchName = u.name.toLowerCase().includes(search.toLowerCase());
      const matchSkills = !skillsFilter || (u.skills || []).some(s => s.toLowerCase().includes(skillsFilter.toLowerCase()));
      return matchName && matchSkills;
  });

  const handleConnect = (email) => {
      window.location.href = `mailto:${email}?subject=Let's team up for a Hackathon!&body=Hi, I saw your profile on OneStop Team Finder...`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pb-20 pt-24 px-6 relative overflow-hidden transition-colors duration-300">
       
       {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px]" />
       </div>

       <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
             <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-full text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <Users size={14}/> Collaborative
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Find Teammates</h1>
                 <p className="text-slate-600 dark:text-slate-400 text-lg font-medium max-w-xl">
                    Connect with skilled developers, designers, and innovators for your next project or hackathon.
                 </p>
             </div>
             
             {/* Stats Preview (Mock) */}
             <div className="hidden md:flex gap-8">
                <div className="text-center">
                   <div className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available</div>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-white/10"></div>
                <div className="text-center">
                   <div className="text-3xl font-black text-slate-900 dark:text-white">50+</div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Skills</div>
                </div>
             </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-[#0f1014] p-2 rounded-[1.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 mb-12 flex flex-col md:flex-row gap-2 relative z-20">
             <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20}/>
                <input 
                  type="text" placeholder="Search by name..." 
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-2xl outline-none focus:bg-white dark:focus:bg-[#0f1014] focus:border-purple-500 dark:focus:border-purple-500/50 font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                />
             </div>
             <div className="flex-1 relative group">
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20}/>
                 <input 
                  type="text" placeholder="Filter by skill (e.g. React)..." 
                  value={skillsFilter} onChange={e => setSkillsFilter(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-2xl outline-none focus:bg-white dark:focus:bg-[#0f1014] focus:border-purple-500 dark:focus:border-purple-500/50 font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                />
             </div>
             <button className="px-8 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-600/20">
                Search
             </button>
          </div>

          {/* Grid */}
          {loading ? (
             <div className="flex justify-center py-24"><Loader className="animate-spin text-purple-600 dark:text-purple-400" size={48}/></div>
          ) : filteredUsers.length === 0 ? (
             <div className="text-center py-24 bg-white dark:bg-[#0f1014] rounded-[2.5rem] border border-slate-200 dark:border-white/5">
                <div className="inline-flex p-6 rounded-full bg-slate-50 dark:bg-white/5 mb-6 text-slate-400 dark:text-slate-500">
                   <Users size={48} />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">No teammates found</p>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or check back later!</p>
             </div>
          ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((u, i) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     key={u._id} 
                     className="bg-white dark:bg-[#0f1014] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-2xl transition-all group flex flex-col h-full"
                   >
                      <div className="flex items-start gap-4 mb-6">
                         <div className="relative">
                            <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-white/10 shadow-lg" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#0f1014] rounded-full"></div>
                         </div>
                         <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{u.name}</h3>
                            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">{u.role || 'Developer'}</div>
                            <div className="flex items-center gap-1">
                               <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-stone-600"></span>
                               <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">Looking for team</span>
                            </div>
                         </div>
                      </div>

                      <div className="mb-8 flex-1">
                         <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Code2 size={12}/> Skills & Stack
                         </h4>
                         <div className="flex flex-wrap gap-2">
                            {u.skills && u.skills.length > 0 ? (
                                u.skills.slice(0, 5).map((s, idx) => (
                                   <span key={idx} className="px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                      {s}
                                   </span>
                                ))
                            ) : (
                                <span className="text-sm text-slate-400 italic">No skills listed</span>
                            )}
                            {u.skills?.length > 5 && (
                               <span className="px-2 py-1 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-lg text-xs font-bold border border-slate-200 dark:border-white/5">
                                  +{u.skills.length - 5}
                               </span>
                            )}
                         </div>
                      </div>

                      <button onClick={() => handleConnect(u.email)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg group-hover:scale-[1.02] active:scale-[0.98]">
                         <Mail size={18}/> Connect Now
                      </button>
                   </motion.div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}
