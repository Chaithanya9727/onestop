import React from 'react';
import { Calendar, Clock, ExternalLink, Share2, AlertCircle } from 'lucide-react';

const HackathonCard = ({ hackathon }) => {
  const { name, startTime, endTime, platforms, url, status, applicationCloseTime, imageUrl } = hackathon;

  const startDate = new Date(startTime);
  const appCloseDate = applicationCloseTime ? new Date(applicationCloseTime) : null;
  
  const now = new Date();
  const timeToClose = appCloseDate ? appCloseDate.getTime() - now.getTime() : 0;
  const daysToClose = Math.floor(timeToClose / (1000 * 60 * 60 * 24));
  const hoursToClose = Math.floor((timeToClose % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const formattedStartDate = startDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getPlatformColor = (p) => {
    switch(p.toLowerCase()) {
      case 'unstop': return 'bg-blue-600';
      case 'devpost': return 'bg-teal-600';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 hover:border-purple-500/50 transition-all duration-300 group relative overflow-hidden flex flex-col h-full shadow-lg shadow-slate-200/50 dark:shadow-lg dark:shadow-none">
       {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-100 dark:bg-purple-500/10 rounded-full blur-3xl -mr-10 -mb-10 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 transition-all"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
             {/* Run Info */}
          <div className="text-slate-500 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Runs from {formattedStartDate}
          </div>
            {/* Platform Badges */}
          <div className="flex gap-1">
            {platforms.map(p => (
                <div key={p} className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getPlatformColor(p)}`}>
                    {p}
                </div>
            ))}
          </div>
        </div>

        <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {name}
        </h3>

        {/* Application status */}
         <div className="mb-4 mt-2">
            {appCloseDate && timeToClose > 0 ? (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs font-medium bg-orange-100 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg w-fit">
                   <Clock size={14} />
                   <span>Application closes in {daysToClose}d {hoursToClose}h</span>
                </div>
            ) : (
                <div className="text-slate-400 dark:text-zinc-500 text-xs text-red-500 dark:text-red-400 font-bold">Applications closed</div>
            )}
         </div>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50 -mx-5 -mb-5 px-5 py-3">
             <div className="flex gap-2">
                 <button className="p-2 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Set Reminder">
                   <AlertCircle size={18} />
                 </button>
                  <button className="p-2 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Add to Calendar">
                   <Calendar size={18} />
                 </button>
             </div>
             
             <a 
               href={url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
             >
               Register <ExternalLink size={16} />
             </a>
        </div>
      </div>
    </div>
  );
};

export default HackathonCard;
