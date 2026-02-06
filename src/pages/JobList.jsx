import React, { useEffect, useState, useMemo } from "react";
import useApi from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import {
  MapPin,
  Clock,
  Search,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Building2,
  Loader,
  Globe,
  Briefcase
} from "lucide-react";

export default function JobList() {
  const { get } = useApi();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Auth Modal
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const categoryKeywords = useMemo(() => ({
    "Engineering": /developer|engineer|software|full stack|frontend|backend|devops|data|sre/i,
    "Business": /manager|business|analyst|sales|marketing|finance|hr|recruiter|operations|admin/i,
    "Design": /design|ui|ux|creative|artist|graphic|animator/i,
    "Product": /product manager|product owner|scrum|agile/i,
    "Marketing": /marketing|seo|content|social media|growth/i
  }), []);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await get("/jobs?type=all");
      setJobs(res.data || res || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (job.isExternal || (job.source && job.source !== 'OneStop')) {
      window.open(job.url, '_blank');
    } else {
      navigate(`/jobs/${job.id || job._id}`);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.recruiter?.orgName?.toLowerCase().includes(search.toLowerCase());

      const matchesType = filterType === "All" || (job.type && job.type.toLowerCase() === filterType.toLowerCase());
      const jobSource = job.source || "OneStop";
      const matchesSource = sourceFilter === "All" || jobSource === sourceFilter;

      let matchesCategory = true;
      if (categoryFilter !== "All") {
        const regex = categoryKeywords[categoryFilter];
        matchesCategory = regex ? regex.test(job.title) : true;
      }

      return matchesSearch && matchesType && matchesSource && matchesCategory;
    });
  }, [jobs, search, filterType, sourceFilter, categoryFilter, categoryKeywords]);

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

  const jobTypes = ["All", "Full-time", "Internship", "Contract"];
  const sources = ["All", "OneStop", "RemoteOK", "Jobicy", "Remotive"];

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]"><Loader size={40} className="text-blue-600 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors" />
      </div>

      {/* Hero Section */}
      <div className="relative pt-12 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <TrendingUp size={14} /> Curated Opportunities
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight text-slate-900 dark:text-white"
          >
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Dream Job</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Discover thousands of career opportunities from top companies. Apply securely and get hired.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto relative group z-20"
          >
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={24} />
            </div>
            <input
              type="text"
              placeholder="Search by role, company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl focus:shadow-blue-500/10 focus:border-blue-500/50 text-slate-900 dark:text-white text-lg font-medium outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              autoFocus
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 transition-colors">
        {/* Filters */}
        <div className="flex flex-col gap-6 mb-12 items-center">

          <div className="flex flex-wrap justify-center gap-2">
            {["All", "Engineering", "Business", "Design", "Product", "Marketing"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${categoryFilter === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg dark:bg-white dark:text-black dark:border-white dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 overflow-x-auto max-w-full">
              {sources.map(src => (
                <button
                  key={src}
                  onClick={() => setSourceFilter(src)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${sourceFilter === src
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-blue-600 dark:text-white dark:shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                  {src}
                </button>
              ))}
            </div>

            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 overflow-x-auto max-w-full">
              {jobTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterType === type
                      ? 'bg-white text-purple-600 shadow-sm dark:bg-purple-600 dark:text-white dark:shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Search size={40} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id || job.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -8 }}
                  className="bg-white dark:bg-[#0f1014] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-lg dark:shadow-none hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
                  onClick={() => handleJobClick(job)}
                >
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 dark:from-blue-600/5 to-purple-50 dark:to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-white font-bold text-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                        {job.logo ? <img src={job.logo} alt="logo" className="w-full h-full object-cover" /> : (job.recruiter?.orgName?.charAt(0) || <Building2 size={24} className="text-slate-400 dark:text-slate-600" />)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${job.type === 'Full-time' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' :
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
                      {job.recruiter?.orgName || job.company || "Company Confidential"}
                    </p>

                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        <MapPin size={16} className="text-blue-600 dark:text-blue-500" />
                        <span className="truncate font-medium">{job.location || "Remote"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        <DollarSign size={16} className="text-green-600 dark:text-green-500" />
                        <span className="font-medium">{job.salary || "Competitive Salary"}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        <Clock size={16} className="text-purple-600 dark:text-purple-500" />
                        <span className="font-medium">
                          Posted {getRelativeTime(job.createdAt)}
                        </span>
                        {job.createdAt && (
                          <span className="text-xs text-slate-400 dark:text-slate-600 border-l border-slate-200 dark:border-white/10 pl-2">
                            {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {job.deadline && (
                        <div className="pt-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${new Date(job.deadline) < new Date() ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20' :
                              (new Date(job.deadline) - new Date()) < (3 * 24 * 60 * 60 * 1000) ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-500/20' :
                                'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-white/5'
                            }`}>
                            <Clock size={12} />
                            Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5 mt-auto">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {job.source === 'OneStop' || !job.source ? '⚡ Fast Apply' : '🔗 External Apply'}
                      </div>
                      <div className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        View Details <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
