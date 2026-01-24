import React, { useEffect, useState, useMemo } from 'react';
import useApi from '../hooks/useApi'; // Use Hook
import ContestCard from '../components/ContestCard'; // Can reuse for now for challenges
import { Filter, ChevronDown, Check, Code, Sword, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Challenges = () => {
    const { get } = useApi();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Platform List (Challenges)
    const platforms = [
        { id: 'leetcode', name: 'LeetCode', color: '#FFA116' },
        { id: 'geeksforgeeks', name: 'GeeksforGeeks', color: '#2F8D46' },
    ];

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const data = await get('/challenges');
                setChallenges(data || []);
            } catch (error) {
                console.error("Error fetching challenges", error);
            } finally {
                setLoading(false);
            }
        }
        fetchChallenges();
    }, []);

    // Adapter to make Challenge match ContestCard props
    const adaptChallengeToCard = (challenge) => ({
        ...challenge,
        site: challenge.platform, 
        name: challenge.title,
        startTime: new Date().toISOString(), 
        duration: 24 * 60 * 60, 
        url: challenge.url,
        in_24_hours: true
    });

    const togglePlatform = (id) => {
        if (selectedPlatforms.includes(id)) {
            setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
        } else {
            setSelectedPlatforms([...selectedPlatforms, id]);
        }
    };

    const filteredChallenges = useMemo(() => {
        return challenges.filter(c => {
             const platformMatch = selectedPlatforms.length === 0 || 
                 selectedPlatforms.some(p => c.platform?.toLowerCase().includes(p));
             return platformMatch;
        });
    }, [challenges, selectedPlatforms]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">
             
             {/* Background Gradients */}
             <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-100 dark:bg-yellow-600/10 rounded-full blur-[120px] transition-colors" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100 dark:bg-orange-600/10 rounded-full blur-[120px] transition-colors" />
             </div>

             <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                   <div>
                      <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
                         <Sword size={14} /> Practice & Compete
                      </motion.div>
                      <motion.h1 initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                         Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400">Challenges</span>
                      </motion.h1>
                   </div>
                   
                   {/* Navigation Tabs - Glassmorphic */}
                   <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 flex shadow-sm">
                       <Link to="/contests" className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl transition-all flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5">
                          <Code size={18} /> Contests
                       </Link>
                       <Link to="/challenges" className="px-6 py-3 bg-white dark:bg-white text-black font-bold rounded-xl shadow-lg transform transition-all flex items-center gap-2 hover:scale-105 border border-slate-100 dark:border-transparent">
                          <Sword size={18} /> Challenges
                       </Link>
                       <Link to="/hackathons" className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl transition-all flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5">
                          <Rocket size={18} /> Hackathons
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
                            className="w-full bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-5 py-4 rounded-xl flex items-center justify-between font-bold hover:border-yellow-500/50 hover:shadow-lg transition-all"
                        >
                            <span className="flex items-center gap-3">
                            <Filter size={20} className="text-yellow-600 dark:text-yellow-500" /> 
                            {selectedPlatforms.length > 0 ? <span className="text-yellow-600 dark:text-yellow-400">{selectedPlatforms.length} Selected</span> : 'Filter by Platform'}
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
                                            selectedPlatforms.includes(platform.id) ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                            selectedPlatforms.includes(platform.id) ? 'border-black bg-black text-yellow-500' : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {selectedPlatforms.includes(platform.id) && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <span className="text-sm">{platform.name}</span>
                                    </div>
                                ))}
                            </motion.div>
                            )}
                        </AnimatePresence>
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
                        {filteredChallenges.map((challenge, index) => (
                            <motion.div
                                key={challenge.id || index}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <ContestCard contest={adaptChallengeToCard(challenge)} />
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredChallenges.length === 0 && (
                    <div className="text-center py-32 bg-white dark:bg-[#0f1014] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
                        <div className="inline-flex p-8 rounded-full bg-slate-50 dark:bg-white/5 mb-6 shadow-inner">
                        <Code size={48} className="text-slate-400 dark:text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No challenges found</h3>
                        <p className="text-slate-600 dark:text-slate-500">Try checking back later.</p>
                    </div>
                )}
             </div>
        </div>
    )
}

export default Challenges;
