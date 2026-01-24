import React from "react";
import { MapPin, Briefcase, Globe, ExternalLink, Clock, Building2, ChevronRight, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return "Today";
    if (diffDays <= 2) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="bg-white dark:bg-[#0f1014] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
    >
       {/* Hover Glow */}
       <div className="absolute inset-0 bg-gradient-to-br from-blue-50 dark:from-blue-600/5 to-purple-50 dark:to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
       
       <div className="relative z-10 flex flex-col h-full">
           <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-white font-bold text-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                {job.logo ? (
                     <img 
                        src={job.logo} 
                        alt={job.company} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                            e.target.style.display='none'; 
                            e.target.parentElement.firstChild.style.display='block';
                        }} 
                     />
                ) : (
                     <Building2 size={24} className="text-slate-400 dark:text-slate-600" />
                )}
                 {/* Fallback Icon (Hidden by default if image loads) */}
                 <Building2 size={24} className="hidden text-slate-400 dark:text-slate-600 absolute" />
              </div>
              <div className="flex flex-col items-end gap-2">
                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    job.type === 'Full-time' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' :
                    job.type === 'Internship' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' :
                    'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5'
                 }`}>
                   {job.type || 'Full-time'}
                 </span>
                 {job.source && job.source !== 'OneStop' && (
                     <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        <Globe size={10} /> {job.source}
                     </span>
                 )}
              </div>
           </div>

           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
             {job.title}
           </h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 flex items-center gap-1">
             {job.company || job.recruiter?.orgName || "Company Confidential"}
           </p>

           <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                 <MapPin size={16} className="text-blue-600 dark:text-blue-500" />
                 <span className="truncate font-medium">{job.location || "Remote"}</span>
              </div>
              {job.salary && (
                 <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    <DollarSign size={16} className="text-green-600 dark:text-green-500" />
                    <span className="font-medium">{job.salary}</span>
                 </div>
              )}
              
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                 <Clock size={16} className="text-purple-600 dark:text-purple-500" />
                 <span className="font-medium">
                   Posted {getRelativeTime(job.createdAt || job.date)}
                 </span>
              </div>
           </div>

           <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5 mt-auto">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                 {job.source === 'OneStop' || !job.source ? '⚡ Fast Apply' : '🔗 External Apply'}
              </div>
              
              {job.source === 'OneStop' || !job.source || job.isInternal ? (
                 <Link to={`/jobs/${job.id || job._id}`} className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    View Details <ChevronRight size={16} />
                 </Link>
              ) : (
                 <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Go to Site <ExternalLink size={16} />
                 </a>
              )}
           </div>
       </div>
    </motion.div>
  );
};

export default JobCard;
