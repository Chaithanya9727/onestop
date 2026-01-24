import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, DollarSign, Clock, Users, FileText, 
  CheckCircle, XCircle, MoreVertical, Briefcase, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider.jsx";

export default function RecruiterJobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { get, patch } = useApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const jobsRes = await get("/recruiter/jobs");
      const found = Array.isArray(jobsRes) ? jobsRes.find((j) => String(j._id) === String(jobId)) : null;

      if (!found) {
        try {
          const fallback = await get(`/jobs/${jobId}`);
          setJob(fallback);
        } catch (err) {
          console.warn("Job not found", err);
          setJob(null);
        }
      } else {
        setJob(found);
      }

      const appsRes = await get("/recruiter/applications");
      const appsArray = Array.isArray(appsRes) ? appsRes : appsRes?.applications ?? [];
      const filtered = appsArray.filter((a) => String(a.job?._id || a.job) === String(jobId) || String(a.job) === String(jobId));
      setApplications(filtered);
    } catch (err) {
      console.error("Failed to load details", err);
      showToast("Failed to load job details", "error");
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const map = { applied: 0, shortlisted: 0, rejected: 0, hired: 0 };
    applications.forEach((a) => {
      const s = (a.status || "applied").toLowerCase();
      if (map[s] !== undefined) map[s] += 1;
      else map.applied += 1; // Count unknown as applied or ignore
    });
    return map;
  }, [applications]);

  const updateStatus = async (applicationId, newStatus) => {
    if (!window.confirm(`Marks this candidate as ${newStatus}?`)) return;
    try {
      setProcessingId(applicationId);
      await patch(`/recruiter/applications/${applicationId}/status`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (String(a._id) === String(applicationId) ? { ...a, status: newStatus } : a))
      );
      showToast(`Application updated to "${newStatus}"`, "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
     return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!job) {
    return (
       <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-800">Job Not Found</h2>
          <button onClick={() => navigate("/recruiter/jobs")} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Back to Jobs</button>
       </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
           <ArrowLeft size={24} />
        </button>
        <div>
           <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">{job.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border
                 ${job.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
              >
                 {job.status === 'approved' ? 'Active' : job.status}
              </span>
           </div>
           <p className="text-slate-500 text-sm mt-1">{job.recruiter?.orgName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Sidebar */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Briefcase size={16} /> Job Details
               </h3>
               
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                     <MapPin className="text-slate-400 mt-1" size={18} />
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Location</p>
                        <p className="font-medium text-slate-700">{job.location || "Remote"}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <DollarSign className="text-slate-400 mt-1" size={18} />
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Salary</p>
                        <p className="font-medium text-slate-700">{job.salary || "Not Disclosed"}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <Clock className="text-slate-400 mt-1" size={18} />
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Posted On</p>
                        <p className="font-medium text-slate-700">{new Date(job.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
               </div>

               <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                     {(job.skills || []).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold border border-slate-100">
                           {skill}
                        </span>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Users size={16} /> Pipeline Summary
               </h3>
               <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                     <span className="text-sm font-medium text-slate-600">Total Applicants</span>
                     <span className="font-bold text-slate-900">{applications.length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-center">
                        <div className="text-2xl font-bold">{counts.shortlisted}</div>
                        <div className="text-xs font-semibold uppercase">Shortlisted</div>
                     </div>
                     <div className="p-3 bg-green-50 text-green-700 rounded-xl text-center">
                        <div className="text-2xl font-bold">{counts.hired}</div>
                        <div className="text-xs font-semibold uppercase">Hired</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Content */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Applicants</h3>
                  <button onClick={() => navigate(`/recruiter/applications?job=${job._id}`)} className="text-blue-600 text-sm font-bold hover:underline">
                     View Full Board
                  </button>
               </div>

               {applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                     <Users size={48} className="opacity-20 mb-4" />
                     <p>No applicants yet.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                           <tr>
                              <th className="px-6 py-4">Candidate</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Applied</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                           {applications.map(app => (
                              <tr key={app._id} className="hover:bg-slate-50 transition-colors group">
                                 <td className="px-6 py-4">
                                    <div>
                                       <p className="font-bold text-slate-800">{app.candidate?.name || "Unknown"}</p>
                                       <p className="text-slate-500 text-xs">{app.candidate?.email || "No Email"}</p>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border
                                       ${app.status === 'hired' ? 'bg-green-50 text-green-700 border-green-200' :
                                         app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                         app.status === 'shortlisted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                         'bg-slate-50 text-slate-600 border-slate-200'}`}
                                    >
                                       {app.status || "Applied"}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-slate-500">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       {app.resumeUrl && (
                                          <button 
                                             onClick={() => window.open(app.resumeUrl, "_blank")}
                                             className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-400 font-bold"
                                             title="View Resume"
                                          >
                                             <ExternalLink size={16} />
                                          </button>
                                       )}
                                       {(!app.status || app.status === 'applied') && (
                                          <>
                                             <button onClick={() => updateStatus(app._id, 'shortlisted')} disabled={processingId === app._id} className="p-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100" title="Shortlist">
                                                <CheckCircle size={16} />
                                             </button>
                                             <button onClick={() => updateStatus(app._id, 'rejected')} disabled={processingId === app._id} className="p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100" title="Reject">
                                                <XCircle size={16} />
                                             </button>
                                          </>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         </div>
      </div>
    </motion.div>
  );
}
