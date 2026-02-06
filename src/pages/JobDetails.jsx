import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
   MapPin,
   Briefcase,
   DollarSign,
   Clock,
   CheckCircle,
   Building2,
   Calendar,
   Share2,
   ArrowLeft,
   AlertCircle,
   Globe,
   Award,
   Users,
   Timer,
   Rocket,
   Lock
} from "lucide-react";
import {
   CircularProgress,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions
} from "@mui/material";

export default function JobDetails() {
   const { id } = useParams();
   const navigate = useNavigate();
   const { get, post } = useApi();
   const { user } = useAuth();

   const [job, setJob] = useState(null);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('description');
   const [applying, setApplying] = useState(false);

   const [openApplyModal, setOpenApplyModal] = useState(false);
   const [applyMessage, setApplyMessage] = useState("");
   const [applyStatus, setApplyStatus] = useState("idle");
   const [resumeFile, setResumeFile] = useState(null);
   const [showAuthModal, setShowAuthModal] = useState(false);

   useEffect(() => {
      fetchJob();
   }, [id]);

   const fetchJob = async () => {
      try {
         const res = await get(`/jobs/${id}`);
         setJob(res.data || res);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleApplyClick = () => {
      if (!user) {
         setShowAuthModal(true);
         return;
      }
      setOpenApplyModal(true);
   };

   /* AI Feature States */
   const [eligibility, setEligibility] = useState(null); // { matchScore, reason, missingSkills }
   const [checkingEligibility, setCheckingEligibility] = useState(false);
   const [coverLetter, setCoverLetter] = useState("");
   const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

   /* AI Handlers */
   const checkEligibility = async () => {
      if (!user) {
         setShowAuthModal(true);
         return;
      }
      setCheckingEligibility(true);
      try {
         const res = await post("/ai/job-eligibility", {
            jobDescription: job.description,
            userSkills: user.skills || [],
            userExperience: user.experience
         });
         setEligibility(res.data || res);
      } catch (e) {
         console.error(e);
      } finally {
         setCheckingEligibility(false);
      }
   };

   const generateAICoverLetter = async () => {
      setGeneratingCoverLetter(true);
      try {
         const res = await post("/ai/cover-letter", {
            jobTitle: job.title,
            company: job.recruiter?.orgName,
            userProfile: user
         });
         setCoverLetter(res.coverLetter || res.data.coverLetter);
      } catch (e) {
         console.error(e);
      } finally {
         setGeneratingCoverLetter(false);
      }
   };

   const confirmApply = async () => {
      setApplying(true);
      setApplyStatus("idle");
      try {
         const formData = new FormData();
         if (resumeFile) formData.append("resume", resumeFile);
         if (coverLetter) formData.append("coverLetter", coverLetter);

         await post(`/jobs/${id}/apply`, formData, true);
         setApplyStatus("success");
         setApplyMessage("Application submitted successfully! Good luck.");
      } catch (err) {
         setApplyStatus("error");
         const errorMsg = err.response?.data?.message || err.message || "Failed to submit application.";
         setApplyMessage(errorMsg);
      } finally {
         setApplying(false);
      }
   };

   // ... (Rest of component methods)

   // ...

   // In JSX Sidebar:
   {/* AI Eligibility Card */ }
   <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden text-white transition-all hover:scale-[1.02]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <h3 className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-4 flex items-center gap-2">
         <Award size={14} /> AI Match Checker
      </h3>

      {!eligibility ? (
         <div className="text-center py-4">
            <p className="text-sm text-purple-100/80 mb-6">Unsure if you qualify? Let AI analyze your profile against this job.</p>
            <button
               onClick={checkEligibility}
               disabled={checkingEligibility}
               className="w-full py-3 bg-white text-purple-900 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
               {checkingEligibility ? <CircularProgress size={16} color="inherit" /> : <Rocket size={18} />}
               Am I Eligible?
            </button>
         </div>
      ) : (
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex items-center gap-4 mb-4">
               <div className={`text-4xl font-black ${eligibility.matchScore >= 80 ? 'text-green-400' : eligibility.matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {eligibility.matchScore}%
               </div>
               <div className="text-sm font-bold text-white/90 leading-tight">Match Score</div>
            </div>
            <p className="text-sm text-purple-100/90 leading-relaxed mb-4 border-t border-white/10 pt-4">
               "{eligibility.reason}"
            </p>
            {eligibility.missingSkills?.length > 0 && (
               <div className="text-xs text-purple-200">
                  <strong>Missing:</strong> {eligibility.missingSkills.join(", ")}
               </div>
            )}
         </motion.div>
      )}
   </div>

   {/* Existing Sidebar Content */ }

   // ...

   // In Modal Content:
   {/* Resume Upload Section */ }
   {/* ... existing resume code ... */ }

   {/* Cover Letter Section (New) */ }
   <div className="mb-8 text-left">
      <div className="flex justify-between items-center mb-3">
         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Letter (Optional)</label>
         <button
            onClick={generateAICoverLetter}
            disabled={generatingCoverLetter || coverLetter.length > 10}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline disabled:opacity-50"
         >
            {generatingCoverLetter ? <CircularProgress size={10} color="inherit" /> : <Rocket size={12} />}
            {coverLetter ? "Regenerate with AI" : "Write with AI"}
         </button>
      </div>
      <textarea
         value={coverLetter}
         onChange={(e) => setCoverLetter(e.target.value)}
         placeholder="Write your cover letter here or use AI to generate one..."
         rows={4}
         className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:border-purple-500 outline-none transition-all placeholder-slate-400"
      ></textarea>
   </div>


   if (loading) {
      return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]"><CircularProgress size={40} className="text-blue-500" /></div>;
   }

   if (!job) {
      return (
         <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-500">
            <AlertCircle size={48} className="mb-4 text-slate-700 dark:text-slate-500" />
            <p className="text-xl font-semibold mb-4">Job not found.</p>
            <button onClick={() => navigate("/opportunities/jobs")} className="px-6 py-2 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition-colors">
               Browse Jobs
            </button>
         </div>
      );
   }

   const isApplied = user && job.applicants?.some(a => a.user === user._id || a.user?._id === user._id);

   const timeline = [
      { title: "Applications Open", date: "Present", status: "completed" },
      { title: "Application Deadline", date: job.deadline ? new Date(job.deadline).toLocaleDateString() : "Flexible", status: "active" },
      { title: "Assessment / Interview", date: "TBA", status: "upcoming" },
      { title: "Final Results", date: "TBA", status: "upcoming" },
   ];

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 overflow-hidden relative transition-colors duration-300">

         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px] transition-colors" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px] transition-colors" />
         </div>

         {/* Hero / Header Section */}
         <div className="relative border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-sm transition-colors">
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
               {/* Breadcrumb */}
               <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
                  <button onClick={() => navigate("/opportunities/jobs")} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                     <ArrowLeft size={16} /> Back to Jobs
                  </button>
               </div>

               <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Logo Box */}
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 shadow-2xl p-4 flex-shrink-0 flex items-center justify-center relative overflow-hidden group">
                     {job.logo ? (
                        <img src={job.logo} alt={job.recruiter?.orgName} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                     ) : (
                        <Building2 size={48} className="text-slate-400 dark:text-slate-600" />
                     )}
                  </motion.div>

                  {/* Main Info */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
                     <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">{job.title}</h1>

                     <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-500 dark:text-slate-400 font-medium mb-6">
                        <span className="flex items-center gap-2"><Building2 size={18} className="text-blue-600 dark:text-blue-500" /> {job.recruiter?.orgName || job.company || "Company Confidential"}</span>
                        <span className="flex items-center gap-2"><MapPin size={18} className="text-purple-600 dark:text-purple-500" /> {job.location || "Remote"}</span>
                     </div>

                     {/* Highlights Bar */}
                     <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-white/5">
                           <DollarSign size={16} className="mr-1 text-green-600 dark:text-green-400" /> {job.salary ? `₹${job.salary}` : "Competitive Salary"}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-white/5">
                           <Briefcase size={16} className="mr-1 text-blue-600 dark:text-blue-400" /> {job.type || "Full-time"}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-white/5">
                           <Clock size={16} className="mr-1 text-orange-600 dark:text-orange-400" /> Exp: {job.experience || "Freshers"}
                        </span>
                     </div>
                  </motion.div>

                  {/* Apply Card (Desktop - Floating Right) */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:block min-w-[280px] text-right bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-none">
                     <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apply Before</div>
                     <div className="text-xl font-bold text-slate-900 dark:text-white mb-6">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "ASAP"}</div>

                     {isApplied ? (
                        <button disabled className="w-full px-6 py-4 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-bold border border-green-200 dark:border-green-500/20 flex items-center justify-center gap-2 cursor-default">
                           <CheckCircle size={20} /> Applied
                        </button>
                     ) : (
                        <button
                           onClick={handleApplyClick}
                           className="w-full px-6 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
                        >
                           Apply Now
                        </button>
                     )}
                     <div className="mt-4 text-xs text-slate-500 font-medium text-center">
                        {job.applicantsCount ? `${job.applicantsCount} people applied` : "Be one of the first applicants!"}
                     </div>
                  </motion.div>
               </div>
            </div>

            {/* Tabs / Navigation */}
            <div className="max-w-7xl mx-auto px-6 flex gap-8 border-t border-slate-200 dark:border-white/5 pt-0 mt-8">
               {['description', 'company', 'jobs'].map(tab => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`py-6 border-b-2 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === tab ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>

         {/* 2. Main Content Grid */}
         <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10 transition-colors">

            {/* Left Column (Content) */}
            <div className="lg:col-span-2 space-y-8">

               {activeTab === 'description' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     {/* Selection Process */}
                     <section className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                           <Timer className="text-blue-600 dark:text-blue-500" /> Application Process
                        </h3>

                        <div className="relative pl-4">
                           <div className="absolute top-2 bottom-2 left-[27px] w-0.5 bg-slate-200 dark:bg-white/10"></div>
                           <div className="space-y-8">
                              {timeline.map((step, idx) => (
                                 <div key={idx} className="relative flex items-center gap-6 group">
                                    <div className={`
                                 relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0f1014] transition-colors shadow-sm
                                 ${idx === 0 ? 'bg-green-500 text-white dark:text-black' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}
                               `}>
                                       {idx === 0 && <CheckCircle size={12} />}
                                    </div>
                                    <div>
                                       <h4 className="text-base font-bold text-slate-900 dark:text-white opacity-90">{step.title}</h4>
                                       <p className="text-xs text-slate-500 font-bold tracking-wide mt-0.5">{step.date}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </section>

                     {/* Job Description */}
                     <section className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                           <div className="w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-full"></div> About the Role
                        </h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed font-normal whitespace-pre-wrap">
                           {job.description}
                        </div>
                     </section>

                     {/* Skills */}
                     <section className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                           <div className="w-1 h-6 bg-purple-600 dark:bg-purple-500 rounded-full"></div> Skills Required
                        </h3>
                        <div className="flex flex-wrap gap-3">
                           {job.skills?.length > 0
                              ? job.skills.map((skill, i) => (
                                 <span key={i} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-default">
                                    {skill}
                                 </span>
                              ))
                              : <span className="text-slate-500 italic">No specific skills listed.</span>
                           }
                        </div>
                     </section>
                  </motion.div>
               )}

               {activeTab === 'company' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 flex items-center justify-center">
                           {job.logo ? <img src={job.logo} className="w-full h-full object-contain" /> : <Building2 size={32} className="text-slate-400 dark:text-slate-600" />}
                        </div>
                        <div>
                           <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{job.recruiter?.orgName || job.company}</h3>
                           <p className="text-slate-500 text-sm font-medium">Technology & Innovation</p>
                        </div>
                     </div>
                     <h4 className="font-bold text-slate-900 dark:text-white mb-4">About the Company</h4>
                     <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                        We are a leading technology company focused on innovation and building world-class products.
                        Our mission is to empower developers and businesses to achieve more through our platform.
                     </p>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                           <h5 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-2">Headquarters</h5>
                           <p className="text-slate-900 dark:text-white font-medium">{job.location || "Remote"}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                           <h5 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-2">Employees</h5>
                           <p className="text-slate-900 dark:text-white font-medium">500-1000</p>
                        </div>
                     </div>
                  </motion.div>
               )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">

               {/* AI Eligibility Card */}
               <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden text-white transition-all hover:scale-[1.02] mb-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <h3 className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Award size={14} /> AI Match Checker
                  </h3>

                  {!eligibility ? (
                     <div className="text-center py-4">
                        <p className="text-sm text-purple-100/80 mb-6 font-medium">Unsure if you qualify? Let AI analyze your profile.</p>
                        <button
                           onClick={checkEligibility}
                           disabled={checkingEligibility}
                           className="w-full py-3 bg-white text-purple-900 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                           {checkingEligibility ? <CircularProgress size={16} color="inherit" /> : <Rocket size={18} />}
                           Am I Eligible?
                        </button>
                     </div>
                  ) : (
                     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="flex items-center gap-4 mb-4">
                           <div className={`text-4xl font-black ${eligibility.matchScore >= 80 ? 'text-green-400' : eligibility.matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {eligibility.matchScore}%
                           </div>
                           <div className="text-sm font-bold text-white/90 leading-tight">Match Score</div>
                        </div>
                        <p className="text-sm text-purple-100/90 leading-relaxed mb-4 border-t border-white/10 pt-4 font-medium">
                           "{eligibility.reason}"
                        </p>
                        {eligibility.missingSkills?.length > 0 && (
                           <div className="text-xs text-purple-200">
                              <strong>Missing:</strong> {eligibility.missingSkills.join(", ")}
                           </div>
                        )}
                     </motion.div>
                  )}
               </div>

               {/* Eligibility Card */}
               <div className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Eligibility & Criteria</h3>
                  <div className="space-y-6">
                     <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-500/20">
                           <Users size={20} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-slate-900 dark:text-white">Experience</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{job.experience || "0-2 Years"}</p>
                        </div>
                     </div>
                     <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-200 dark:border-purple-500/20">
                           <Award size={20} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-slate-900 dark:text-white">Education</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">B.Tech / MCA or equivalent</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Share Card */}
               <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-[2rem] p-8 text-white text-center border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="relative z-10">
                     <h4 className="font-black text-xl mb-3">Refer a friend?</h4>
                     <p className="text-slate-300 text-sm mb-6 leading-relaxed">Know someone perfect for this role? Share this opportunity with them!</p>
                     <button onClick={() => { navigator.clipboard.writeText(window.location.href); setApplyMessage("Link Copied!"); setTimeout(() => setApplyMessage(""), 2000) }} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2">
                        <Share2 size={18} /> {applyMessage === "Link Copied!" ? "Link Copied!" : "Share Opportunity"}
                     </button>
                  </div>
               </div>

            </div>
         </div>

         {/* Mobile Floating Action Button */}
         <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/10 flex items-center gap-4 z-50 pb-8 backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90">
            <div className="flex-1">
               <div className="text-xs text-slate-500 font-bold uppercase">Deadline</div>
               <div className="text-sm font-bold text-slate-900 dark:text-white">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "ASAP"}</div>
            </div>
            {isApplied ? (
               <button disabled className="px-8 py-3 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400 font-bold border border-green-500/20">
                  Applied
               </button>
            ) : (
               <button onClick={handleApplyClick} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30">
                  Apply Now
               </button>
            )}
         </div>


         {/* Application Confirmation Modal */}
         <Dialog
            open={openApplyModal}
            onClose={() => setOpenApplyModal(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
               className: "bg-white dark:bg-[#0f1014] text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 rounded-3xl",
               style: { borderRadius: "24px" } // Inline style override for MUI Paper rounded corners if tailwind doesn't catch
            }}
            slotProps={{
               backdrop: {
                  className: "bg-black/60 dark:bg-black/80 backdrop-blur-sm"
               }
            }}
         >
            <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', pt: 3, fontSize: '1.5rem', color: 'inherit' }}>
               {applyStatus === 'success' ? '🚀 Application Sent!' : 'Confirm Application'}
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', pb: 3, color: 'inherit' }}>
               {applyStatus === 'idle' && (
                  <>
                     <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                        You are applying for <strong className="text-slate-900 dark:text-white">{job.title}</strong> at <strong className="text-slate-900 dark:text-white">{job.recruiter?.orgName}</strong>.
                     </p>

                     {/* Resume Upload Section */}
                     <div className="mb-8 text-left">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Resume (Required)</label>
                        <div className="relative border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-center cursor-pointer group">
                           <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setResumeFile(e.target.files[0])}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           />
                           <div className="flex flex-col items-center justify-center pointer-events-none">
                              {resumeFile ? (
                                 <>
                                    <div className="w-14 h-14 bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 border border-green-200 dark:border-green-500/20">
                                       <CheckCircle size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400 truncate max-w-[200px]">{resumeFile.name}</span>
                                    <span className="text-xs text-slate-500 mt-2">Click to change</span>
                                 </>
                              ) : (
                                 <>
                                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-200 dark:border-blue-500/20">
                                       <Briefcase size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-white">Upload Your Resume</span>
                                    <span className="text-xs text-slate-500 mt-2">PDF, DOCX up to 5MB</span>
                                 </>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Cover Letter Section (New) */}
                     <div className="mb-8 text-left">
                        <div className="flex justify-between items-center mb-3">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Letter (Optional)</label>
                           <button
                              onClick={generateAICoverLetter}
                              disabled={generatingCoverLetter || coverLetter.length > 10}
                              className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline disabled:opacity-50"
                           >
                              {generatingCoverLetter ? <CircularProgress size={10} color="inherit" /> : <Rocket size={12} />}
                              {coverLetter ? "Regenerate with AI" : "Write with AI"}
                           </button>
                        </div>
                        <textarea
                           value={coverLetter}
                           onChange={(e) => setCoverLetter(e.target.value)}
                           placeholder="Write your cover letter here or use AI to generate one..."
                           rows={6}
                           className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:border-purple-500 outline-none transition-all placeholder-slate-400 font-medium leading-relaxed"
                        ></textarea>
                     </div>

                     <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-500/20 text-left mb-4">
                        <h5 className="font-bold text-blue-600 dark:text-blue-400 text-sm mb-2">Notice</h5>
                        <p className="text-sm text-blue-800 dark:text-blue-300/80 leading-relaxed">
                           Your profile details, cover letter, and contact information will be shared with the recruiter securely.
                        </p>
                     </div>
                  </>
               )}
               {applyStatus === 'success' && (
                  <div className="flex flex-col items-center py-6">
                     <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 text-4xl shadow-lg shadow-green-200 dark:shadow-green-500/20 border border-green-200 dark:border-green-500/30"
                     >
                        <CheckCircle size={48} />
                     </motion.div>
                     <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg font-medium max-w-xs">{applyMessage}</p>
                  </div>
               )}
               {applyStatus === 'error' && (
                  <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-500/20 font-medium">
                     {applyMessage}
                  </div>
               )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 2, px: 4 }}>
               {applyStatus === 'idle' ? (
                  <>
                     <button
                        onClick={() => setOpenApplyModal(false)}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={confirmApply}
                        disabled={applying}
                        className={`px-8 py-3 rounded-xl text-black font-bold shadow-lg transition-all flex items-center gap-2
                    ${resumeFile || !job.recruiter?.orgName ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white dark:hover:bg-slate-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}
                 `}
                     >
                        {applying ? <CircularProgress size={20} color="inherit" /> : "Yes, Apply"}
                     </button>
                  </>
               ) : (
                  <button
                     onClick={() => { setOpenApplyModal(false); setApplyStatus("idle"); setResumeFile(null); }}
                     className="w-full px-6 py-4 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/10"
                  >
                     Close
                  </button>
               )}
            </DialogActions>
         </Dialog>


         {/* Auth Gatekeeper Modal */}
         <Dialog
            open={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
               className: "bg-white dark:bg-[#0f1014] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-3xl",
               style: { borderRadius: "24px" }
            }}
            slotProps={{
               backdrop: { className: "bg-black/60 dark:bg-black/80 backdrop-blur-sm" }
            }}
         >
            <div className="p-8 text-center">
               <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200 dark:border-blue-500/20">
                  <Lock size={32} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Login Required</h3>
               <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed font-medium">
                  Join OneStop to apply for jobs, track applications, and use exclusive AI features.
               </p>
               <div className="space-y-3">
                  <button
                     onClick={() => navigate("/login", { state: { from: `/jobs/${id}` } })}
                     className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                  >
                     Log In
                  </button>
                  <button
                     onClick={() => navigate("/register")}
                     className="w-full py-3.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5"
                  >
                     Create Account
                  </button>
               </div>
            </div>
         </Dialog>
      </div >
   );
}
