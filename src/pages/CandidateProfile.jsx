import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import { 
  FileText, Upload, Eye, Trash2, CheckCircle, AlertCircle, BookOpen, Clock, MapPin, Briefcase, Download, Save, X 
} from "lucide-react";

export default function CandidateProfile() {
  const { get, post, put, del } = useApi();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [savingCL, setSavingCL] = useState(false);
  const [msg, setMsg] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await get("/candidate/profile");
      setMe(res.data);
      setCoverLetter(res.data.coverLetter || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadResume = async () => {
    if (!cvFile) return;
    const formData = new FormData();
    formData.append("file", cvFile);
    try {
      setMsg("");
      const res = await post("/candidate/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg(res.data.message || "Resume uploaded.");
      setCvFile(null); // Clear file
      loadProfile();
    } catch (e) {
      setMsg(e.response?.data?.message || "Upload failed.");
    }
  };

  const saveCoverLetter = async () => {
    try {
      setSavingCL(true);
      const res = await put("/candidate/cover-letter", { coverLetter });
      setMsg(res.data.message || "Updated cover letter.");
    } catch (e) {
      setMsg(e.response?.data?.message || "Save failed.");
    } finally {
      setSavingCL(false);
    }
  };

  const unsaveJob = async (id) => {
    if(!window.confirm("Remove this job from saved?")) return;
    try {
      await del(`/candidate/save/${id}`);
      loadProfile();
    } catch (e) {
      console.error(e);
    }
  };

  const withdrawApplication = async (jobId) => {
    if(!window.confirm("Are you sure you want to withdraw?")) return;
    try {
      await put(`/candidate/applications/${jobId}/status`, { status: "withdrawn" }); // Assuming PUT/PATCH
      setMsg("Application withdrawn.");
      loadProfile();
    } catch (e) {
      setMsg("Failed to withdraw.");
    }
  };


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]">
         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">
       
       {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
       </div>

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
           
           <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
              <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                     <Briefcase size={14} /> Career Profile
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                     Candidate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Profile</span>
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Manage your resume, cover letter, and saved opportunities.</p>
              </div>
           </div>

           <AnimatePresence>
             {msg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 rounded-xl font-bold border flex items-center gap-3 ${msg.toLowerCase().includes('fail') ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20'}`}>
                   {msg.toLowerCase().includes('fail') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                   {msg}
                </motion.div>
             )}
           </AnimatePresence>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Resume & Cover Letter */}
              <div className="space-y-8">
                 {/* Resume Section */}
                 <div className="bg-white dark:bg-[#0f1014] p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                       <FileText className="text-blue-600 dark:text-blue-500" /> Resume
                    </h3>
                    
                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-center mb-6">
                       <input 
                          type="file" 
                          accept="application/pdf" 
                          onChange={(e) => setCvFile(e.target.files[0])}
                          className="hidden" 
                          id="resume-upload"
                       />
                       <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-3 group">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Upload size={20} />
                          </div>
                          <div>
                             <span className="text-sm font-bold text-slate-700 dark:text-white block">{cvFile ? cvFile.name : "Upload Resume (PDF)"}</span>
                             <span className="text-xs text-slate-500 dark:text-slate-400">Click to select file</span>
                          </div>
                       </label>
                    </div>

                    <div className="flex gap-3">
                       <button 
                          onClick={uploadResume} 
                          disabled={!cvFile} 
                          className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                       >
                          Upload
                       </button>
                       {me?.resumeUrl && (
                          <a 
                             href={me.resumeUrl} 
                             target="_blank" 
                             rel="noreferrer"
                             className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                          >
                             <Eye size={18} /> View Current
                          </a>
                       )}
                    </div>
                 </div>

                 {/* Cover Letter Section */}
                 <div className="bg-white dark:bg-[#0f1014] p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                       <BookOpen className="text-purple-600 dark:text-purple-500" /> Cover Letter
                    </h3>
                    <textarea 
                       placeholder="Write a short cover letter default for your applications..."
                       value={coverLetter}
                       onChange={(e) => setCoverLetter(e.target.value)}
                       className="w-full h-40 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 outline-none transition-colors resize-none mb-4"
                    />
                    <div className="flex justify-end">
                       <button 
                          onClick={saveCoverLetter} 
                          disabled={savingCL} 
                          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20 flex items-center gap-2"
                       >
                          {savingCL ? "Saving..." : <><Save size={18}/> Save Cover Letter</>}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Right Column: Saved Jobs & Applications */}
              <div className="space-y-8">
                 
                 {/* Saved Jobs */}
                 <div className="bg-white dark:bg-[#0f1014] p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                       <CheckCircle className="text-green-600 dark:text-green-500" /> Saved Jobs
                    </h3>
                    {me?.savedJobs?.length > 0 ? (
                       <div className="space-y-4">
                          {me.savedJobs.map(job => (
                             <div key={job._id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                   <h4 className="font-bold text-slate-900 dark:text-white">{job.title}</h4>
                                   <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${job.status === 'open' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                      {job.status}
                                   </div>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 mb-4">
                                   <span className="flex items-center gap-1"><MapPin size={12}/> {job.location || "Remote"}</span>
                                </div>
                                <div className="flex gap-2">
                                   <Link to={`/jobs/${job._id}`} className="flex-1 py-2 bg-white dark:bg-white/10 text-slate-900 dark:text-white text-xs font-bold rounded-lg text-center hover:bg-slate-100 dark:hover:bg-white/20 transition-colors border border-slate-200 dark:border-transparent">View</Link>
                                   <button onClick={() => unsaveJob(job._id)} className="px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-transparent">
                                      <Trash2 size={14} />
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="text-center py-8 text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 border-dashed">
                          No saved jobs found.
                       </div>
                    )}
                 </div>

                 {/* Recent Applications (Mini View) */}
                 <div className="bg-white dark:bg-[#0f1014] p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Briefcase className="text-amber-600 dark:text-amber-500" /> Applications
                        </h3>
                        <Link to="/candidate/applications" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
                           View All
                        </Link>
                    </div>
                    
                    {me?.applications?.length > 0 ? (
                       <div className="space-y-4">
                          {me.applications.slice().reverse().slice(0, 3).map(a => (
                             <div key={`${a.job?._id}-${a.appliedAt}`} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                                <div className="flex justify-between mb-1">
                                   <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[180px]">{a.job?.title || "Job Unavailable"}</h4>
                                   <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                      a.status === 'hired' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                                      a.status === 'rejected' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                                      'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                   }`}>
                                      {a.status}
                                   </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                   {new Date(a.appliedAt).toLocaleDateString()}
                                </div>
                                <Link to={`/jobs/${a.job?._id}`} className="block w-full py-2 bg-white dark:bg-white/10 text-slate-900 dark:text-white text-xs font-bold rounded-lg text-center hover:bg-slate-100 dark:hover:bg-white/20 transition-colors border border-slate-200 dark:border-transparent">
                                   View Job
                                </Link>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="text-center py-8 text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 border-dashed">
                          No applications yet.
                       </div>
                    )}
                 </div>

              </div>
           </div>

        </motion.div>
      </div>
    </div>
  );
}
