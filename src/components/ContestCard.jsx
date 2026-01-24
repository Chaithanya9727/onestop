import React, { useState, useEffect } from 'react';
import { Calendar, Share2, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const ContestCard = ({ contest }) => {
  const { name, startTime, duration, site, url } = contest;
  const [timeLeft, setTimeLeft] = useState("");

  const startDate = new Date(startTime);
  
  // Platform color & logo mapping
  const getPlatformStyle = (siteName) => {
    const s = siteName.toLowerCase();
    if (s.includes('codeforces')) return { color: '#1F8ACB', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-codeforces-3628695-3029920.png' };
    if (s.includes('leetcode')) return { color: '#FFA116', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png' };
    if (s.includes('codechef')) return { color: '#5B4638', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-codechef-3628685-3029910.png' };
    if (s.includes('geeks')) return { color: '#2F8D46', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg' };
    if (s.includes('atcoder')) return { color: '#FFFFFF', logo: 'https://img.atcoder.jp/assets/atcoder.png' };
    return { color: '#3B82F6', logo: null };
  };

  const { color, logo } = getPlatformStyle(site);

  // Countdown Logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = new Date(startTime).getTime() - now;

      if (distance < 0) {
        setTimeLeft("Started");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      let timeString = "";
      if (days > 0) timeString += `${days}d `;
      timeString += `${hours}h ${minutes}m ${seconds}s`;
      setTimeLeft(timeString);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial call

    return () => clearInterval(timer);
  }, [startTime]);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
  
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  });

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-[#111] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 relative group overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/10 transition-all duration-300"
    >
      {/* Top Row: Date & Logo */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-slate-500 dark:text-zinc-500 text-sm font-medium">
           {formattedDate} at {formattedTime}
        </div>
        
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 p-1 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-zinc-700/50">
           {logo ? (
             <img src={logo} alt={site} className="w-full h-full object-contain" />
           ) : (
             <span className="font-bold text-xs text-slate-700 dark:text-zinc-300">{site.charAt(0)}</span>
           )}
        </div>
      </div>

      {/* Middle: Title */}
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 line-clamp-2 h-16 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {name}
      </h3>

      {/* Bottom: Info & Actions */}
      <div className="flex items-end justify-between mt-auto">
        <div className="flex flex-col gap-1">
           <div className="text-slate-500 dark:text-zinc-500 text-sm flex items-center gap-2">
              duration: <span className="text-slate-900 dark:text-zinc-300 font-bold">{Math.floor(duration)}min</span>
           </div>
           
           <div className="text-slate-500 dark:text-zinc-500 text-sm flex items-center gap-2">
              starts in: <span className={`font-mono font-bold ${timeLeft === "Started" ? "text-green-600 dark:text-green-500" : "text-blue-600 dark:text-blue-400"}`}>{timeLeft}</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors" title="Share">
              <Share2 size={20} />
           </button>
           <button className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors" title="Add to Calendar">
              <Calendar size={20} />
           </button>
           <a 
             href={url} 
             target="_blank" 
             rel="noreferrer"
             className="text-slate-300 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
           >
              <ArrowRight size={24} />
           </a>
        </div>
      </div>
      
      {/* Decorative Border Gradient on Hover */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

      {/* Platform Strip (Optional, simplified approach) */}
       {/* <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }}></div> */}

    </motion.div>
  );
};

export default ContestCard;
