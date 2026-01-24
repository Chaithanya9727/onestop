import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import ContestCard from '../components/ContestCard';
import { Filter, ChevronDown, Check, Trophy, Sparkles, Sword, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contests = () => {
  const { get } = useApi();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const platforms = [
    { id: 'leetcode', name: 'LeetCode', color: '#FFA116' },
    { id: 'codeforces', name: 'Codeforces', color: '#1F8ACB' },
    { id: 'codechef', name: 'CodeChef', color: '#5B4638' },
    { id: 'geeksforgeeks', name: 'GeeksforGeeks', color: '#2F8D46' },
    { id: 'atcoder', name: 'AtCoder', color: '#000000' },
    { id: 'codingninjas', name: 'CodingNinjas', color: '#F05A29' },
  ];

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await get('/contests');
        setContests(data || []);
      } catch (error) {
        console.error('Error fetching contests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const togglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const filteredContests = useMemo(() => {
    return contests.filter(c => {
       const platformMatch = selectedPlatforms.length === 0 || 
           selectedPlatforms.some(p => c.site.toLowerCase().includes(p));
       return platformMatch;
    });
  }, [contests, selectedPlatforms]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors" />
       </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div>
              <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
                 <Trophy size={14} /> Competitive Programming
              </motion.div>
              <motion.h1 initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                 Top Coding <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400">Contests</span>
              </motion.h1>
           </div>
           
           {/* Navigation Tabs - Glassmorphic */}
           <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 flex shadow-sm">
               <Link to="/contests" className="px-6 py-3 bg-white dark:bg-white text-black font-bold rounded-xl shadow-lg transform transition-all flex items-center gap-2 hover:scale-105 border border-slate-100 dark:border-transparent">
                  <Code size={18} /> Contests
               </Link>
               <Link to="/challenges" className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl transition-all flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5">
                  Challenges
               </Link>
               <Link to="/hackathons" className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl transition-all flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5">
                  Hackathons
               </Link>
           </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-3xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-200/50 dark:shadow-2xl relative overflow-hidden transition-all">
           <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
           
           {/* Platform Dropdown */}
           <div className="relative w-full md:w-72 z-20">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-5 py-4 rounded-xl flex items-center justify-between font-bold hover:border-blue-500/50 hover:shadow-lg transition-all"
              >
                 <span className="flex items-center gap-3">
                   <Filter size={20} className="text-blue-600 dark:text-blue-500" /> 
                   {selectedPlatforms.length > 0 ? <span className="text-blue-600 dark:text-blue-400">{selectedPlatforms.length} Selected</span> : 'Filter by Platform'}
                 </span>
                 <ChevronDown size={20} className={`transition-transform duration-300 text-slate-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-3 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 backdrop-blur-xl z-50"
                  >
                     {platforms.map(platform => (
                        <div 
                          key={platform.id}
                          onClick={() => togglePlatform(platform.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                             selectedPlatforms.includes(platform.id) ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                           <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              selectedPlatforms.includes(platform.id) ? 'border-white bg-white text-blue-600' : 'border-slate-300 dark:border-slate-600'
                           }`}>
                              {selectedPlatforms.includes(platform.id) && <Check size={14} strokeWidth={4} />}
                           </div>
                           <span className="text-sm">{platform.name}</span>
                        </div>
                     ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* Stats / Info */}
           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live Contests
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Upcoming
               </div>
           </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-[#0f1014] h-80 rounded-3xl animate-pulse border border-slate-200 dark:border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredContests.map((contest, index) => (
                <motion.div
                  key={contest.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ContestCard contest={contest} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredContests.length === 0 && (
          <div className="text-center py-32 bg-white dark:bg-[#0f1014] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
            <div className="inline-flex p-8 rounded-full bg-slate-50 dark:bg-white/5 mb-6 shadow-inner">
               <Filter size={48} className="text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No contests found</h3>
            <p className="text-slate-600 dark:text-slate-500">Try adjusting your platform filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contests;
