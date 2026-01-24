import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Briefcase, MapPin, Clock, Search, Plus, 
  Users, ChevronRight, Filter, AlertCircle, Loader
} from "lucide-react";

export default function RecruiterJobs() {
  const api = useApi();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/recruiter/jobs?limit=50"); 
        const jobsList = Array.isArray(res) ? res : (res.jobs || []);
        setJobs(jobsList);
        setLoading(false);
      } catch (err) {
        console.error("Job Fetch Error:", err);
        setError("Failed to load job posts.");
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-3 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl"><Briefcase size={28} /></span>
            My Opportunities
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 ml-1 text-lg">
            Manage your posted jobs, internships, and hiring challenges.
          </p>
        </div>
        
        <button
          onClick={() => navigate("/rpanel/post-job")}
          className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={20} /> Post New Job
        </button>
      </motion.div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#0f1014] p-3 rounded-[1.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 mb-8 sticky top-4 z-10 flex gap-3">
        <div className="flex-1 relative group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
           <input 
             type="text" 
             placeholder="Search jobs by title or location..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-14 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] hover:bg-slate-100 dark:hover:bg-[#222] focus:bg-white dark:focus:bg-[#1a1a1a] border border-transparent focus:border-blue-500 dark:focus:border-blue-500/50 rounded-xl outline-none transition-all text-slate-900 dark:text-white font-medium"
           />
        </div>
        <button className="px-5 py-3 bg-slate-50 dark:bg-[#1a1a1a] hover:bg-slate-100 dark:hover:bg-[#222] text-slate-600 dark:text-slate-400 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
           <Filter size={20} />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-blue-600 dark:text-blue-400" size={40} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center p-8 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-3xl border border-red-100 dark:border-red-500/20 mb-6 flex flex-col items-center">
          <AlertCircle size={40} className="mb-3" />
          <p className="font-bold text-lg">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredJobs.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-[#0f1014] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-50 dark:bg-white/5 mb-6 text-slate-300 dark:text-slate-600">
                <Briefcase size={40} />
            </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">No jobs found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-lg mt-2">
            {searchTerm ? "No matches for your search terms." : "You haven't posted any opportunities yet. Start hiring today!"}
          </p>
          {!searchTerm && (
            <button 
                onClick={() => navigate("/rpanel/post-job")}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
                Create First Job
            </button>
          )}
        </div>
      )}

      {/* Job Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredJobs.map((job) => (
          <motion.div
            key={job._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 p-8 shadow-sm hover:shadow-xl dark:shadow-none hover:border-blue-300 dark:hover:border-blue-500/30 transition-all relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border
                        ${job.status === 'open' || job.status === 'approved' 
                            ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20' 
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'
                        }`}
                    >
                        {job.status === 'approved' ? 'Active' : job.status}
                    </span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Clock size={14} /> Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-4">
                  {job.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        <MapPin size={16} className="text-slate-400 dark:text-slate-500" /> {job.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        <Briefcase size={16} className="text-slate-400 dark:text-slate-500" /> {job.type || "Full Time"}
                    </span>
                    <span className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        {job.salary || "Not Disclosed"}
                    </span>
                </div>
              </div>

              {/* Right Content */}
              <div className="flex items-center gap-4">
                 <Link
                    to={`/rpanel/jobs/${job._id}/applications`}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-400 dark:hover:text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                 >
                    <Users size={18} /> 
                    View Applicants
                 </Link>
                 <button className="p-3 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/10 rounded-xl transition-colors border border-transparent dark:hover:border-white/10">
                    <ChevronRight size={24} />
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
