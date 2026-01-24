import React, { useEffect, useState, useMemo } from "react";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Search, Eye, Check, X, Trash2, Briefcase, Users, Loader, Filter
} from "lucide-react";

export default function AdminJobs() {
  const { get, patch, del } = useApi();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [viewJob, setViewJob] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await get("/admin/jobs");
      const list = res || [];
      setJobs(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const stats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter(j => j.status === 'open' || j.status === 'active' || j.status === 'approved').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    closed: jobs.filter(j => j.status === 'closed' || j.status === 'rejected').length,
  }), [jobs]);

  const handleAction = async (jobId, action) => {
    if(!window.confirm(`Are you sure you want to ${action} this job?`)) return;

    setActionLoading(jobId);
    try {
      await patch(`/admin/jobs/${jobId}/approve`, { approved: action === 'approve' });
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: action === 'approve' ? 'approved' : 'rejected' } : j));
      if (viewJob?._id === jobId) setViewJob(prev => ({...prev, status: action === 'approve' ? 'approved' : 'rejected'}));
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("⚠️ ARE YOU SURE? \n\nThis will PERMANENTLY DELETE this job and all associated applications from the database.\nThis action cannot be undone.")) return;

    setActionLoading(jobId);
    try {
        await del(`/admin/jobs/${jobId}`);
        
        setJobs(prev => prev.filter(j => j._id !== jobId));
        if (viewJob?._id === jobId) setViewJob(null);
        alert("Job deleted permanently.");
    } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete job.");
    } finally {
        setActionLoading(null);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title?.toLowerCase().includes(search.toLowerCase()) || 
                            job.postedBy?.name?.toLowerCase().includes(search.toLowerCase());
      
      if (filter === 'all') return matchesSearch;
      if (filter === 'pending') return matchesSearch && job.status === 'pending';
      if (filter === 'active') return matchesSearch && (job.status === 'approved' || job.status === 'active' || job.status === 'open');
      if (filter === 'closed') return matchesSearch && (job.status === 'closed' || job.status === 'rejected');
      
      return matchesSearch;
    });
  }, [jobs, search, filter]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><ShieldCheck size={28} /></span>
          Job Oversight
        </h1>
        <p className="text-slate-500 font-medium mt-2 ml-1">Manage and moderate job postings.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Jobs", val: stats.total, color: "bg-slate-50 text-slate-600" },
          { label: "Pending", val: stats.pending, color: "bg-amber-50 text-amber-600" },
          { label: "Active", val: stats.active, color: "bg-green-50 text-green-600" },
          { label: "Closed/Rejected", val: stats.closed, color: "bg-red-50 text-red-600" },
        ].map((s, i) => (
           <div key={i} className={`p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between ${s.color}`}>
              <span className="font-bold text-sm uppercase tracking-wide opacity-80">{s.label}</span>
              <span className="text-2xl font-black">{s.val}</span>
           </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
           <div className="flex gap-1 bg-slate-100 p-1 rounded-xl self-start">
             {['pending', 'active', 'closed', 'all'].map(f => (
               <button key={f} onClick={() => setFilter(f)} 
                 className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                 {f}
               </button>
             ))}
           </div>
           <div className="relative w-full md:w-80">
             <Search className="absolute left-3.5 top-2.5 text-slate-400" size={20} />
             <input type="text" placeholder="Search jobs or recruiters..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium transition-colors" />
           </div>
        </div>

        {/* List */}
        {filteredJobs.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Briefcase size={48} className="mb-4 opacity-30" />
              <p className="font-bold">No jobs found matching your criteria.</p>
           </div>
        ) : (
           <div className="divide-y divide-slate-100">
             {filteredJobs.map((job) => (
                <div key={job._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
                         <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border
                            ${job.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              job.status === 'approved' || job.status === 'active' || job.status === 'open' ? 'bg-green-50 text-green-700 border-green-200' : 
                              'bg-red-50 text-red-700 border-red-200'}`}>
                            {job.status}
                         </span>
                      </div>
                      <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                         <Briefcase size={14} /> {job.type} <span className="text-slate-300">•</span> 
                         <Users size={14} /> {job.location} <span className="text-slate-300">•</span>
                         Posted by <span className="text-blue-600">{job.postedBy?.name || "Unknown"}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 self-end md:self-auto">
                      <button onClick={() => setViewJob(job)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="View Details">
                         <Eye size={20} />
                      </button>
                      
                      {job.status === 'pending' && (
                         <>
                            <button onClick={() => handleAction(job._id, 'approve')} disabled={actionLoading === job._id}
                               className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 text-sm disabled:opacity-50">
                               {actionLoading === job._id ? <Loader className="animate-spin" size={16} /> : <Check size={16} />} Approve
                            </button>
                            <button onClick={() => handleAction(job._id, 'reject')} disabled={actionLoading === job._id}
                               className="px-4 py-2 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 flex items-center gap-2 text-sm disabled:opacity-50">
                               {actionLoading === job._id ? <Loader className="animate-spin" size={16} /> : <X size={16} />} Reject
                            </button>
                         </>
                      )}
                      
                       {job.status !== 'pending' && (
                          <button onClick={() => handleDelete(job._id)} disabled={actionLoading === job._id} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete Permanently">
                             {actionLoading === job._id ? <Loader className="animate-spin" size={20} /> : <Trash2 size={20} />}
                          </button>
                       )}
                   </div>
                </div>
             ))}
           </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
         {viewJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
                  className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                  <div className="p-6 md:p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h2 className="text-2xl font-black text-slate-800">{viewJob.title}</h2>
                           <p className="text-slate-500 font-medium mt-1">
                              Posted by <span className="text-blue-600">{viewJob.postedBy?.name}</span> on {new Date(viewJob.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                        <button onClick={() => setViewJob(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                           <X size={20} className="text-slate-600" />
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-slate-50 rounded-xl">
                           <p className="text-xs font-bold text-slate-400 uppercase mb-1">Salary</p>
                           <p className="text-slate-800 font-bold">{viewJob.salary || "Not Disclosed"}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                           <p className="text-xs font-bold text-slate-400 uppercase mb-1">Location</p>
                           <p className="text-slate-800 font-bold">{viewJob.location}</p>
                        </div>
                     </div>

                     <div className="mb-6">
                        <p className="text-sm font-bold text-slate-800 mb-2">Description</p>
                        <div className="text-slate-600 leading-relaxed text-sm p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                           {viewJob.description}
                        </div>
                     </div>
                     
                     {viewJob.status === 'pending' && (
                        <div className="flex gap-3 pt-6 border-t border-slate-100">
                           <button onClick={() => handleAction(viewJob._id, 'approve')} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200">
                              Approve Job
                           </button>
                           <button onClick={() => handleAction(viewJob._id, 'reject')} className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 border border-red-200">
                              Reject Job
                           </button>
                        </div>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
