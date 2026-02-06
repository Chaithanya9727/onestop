import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import {
   CheckCircle, Loader, Clock, Linkedin, Briefcase, Globe, AlertCircle,
   Sparkles, Send, User, ChevronRight, Building, Upload, FileText, Github, Link as LinkIcon
} from "lucide-react";
import { useToast } from "../components/ToastProvider";

export default function ApplyForMentor() {
   const { user, role, refreshUser } = useAuth();
   const { get, post } = useApi();
   const { showToast } = useToast();

   const [status, setStatus] = useState(null);
   const [formData, setFormData] = useState({
      company: "",
      experience: "",
      expertise: "",
      linkedin: "",
      github: "",
      portfolio: "",
      bio: "",
      motivation: ""
   });

   // File States
   const [files, setFiles] = useState({
      resume: null,
      experienceCert: null
   });
   const [fileUrls, setFileUrls] = useState({
      resume: "",
      experienceCert: ""
   });
   const [uploading, setUploading] = useState({
      resume: false,
      experienceCert: false
   });

   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);

   // Load status
   const loadStatus = async () => {
      setLoading(true);
      try {
         const data = await get("/mentor/status");
         setStatus(data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadStatus();
   }, []);

   const handleFileUpload = async (file, type) => {
      if (!file) return;

      // Validate file size (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
         showToast("File size too large (max 5MB)", "error");
         return;
      }

      setUploading(prev => ({ ...prev, [type]: true }));
      try {
         const data = new FormData();
         data.append("file", file);

         const res = await post("/users/upload-doc", data, true);
         setFileUrls(prev => ({ ...prev, [type]: res.url }));
         setFiles(prev => ({ ...prev, [type]: file }));
         showToast(`${type === 'resume' ? 'Resume' : 'Certificate'} uploaded successfully`, "success");
      } catch (err) {
         console.error("Upload error:", err);
         showToast("Failed to upload file", "error");
      } finally {
         setUploading(prev => ({ ...prev, [type]: false }));
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!fileUrls.resume) {
         showToast("Please upload your Resume for verification.", "warning");
         return;
      }

      setSubmitting(true);
      try {
         const payload = {
            ...formData,
            documents: {
               resume: fileUrls.resume,
               experienceCert: fileUrls.experienceCert || "" // Optional
            },
            socials: {
               linkedin: formData.linkedin,
               github: formData.github,
               portfolio: formData.portfolio
            }
         };

         const res = await post("/mentor/apply", payload);
         showToast(res.message, "success");
         setFormData({ company: "", experience: "", expertise: "", linkedin: "", github: "", portfolio: "", bio: "", motivation: "" });
         setFileUrls({ resume: "", experienceCert: "" });
         setFiles({ resume: null, experienceCert: null });
         await loadStatus();
         await refreshUser();
      } catch (err) {
         console.error("Mentor apply error:", err);
         showToast(err.message || "Error submitting application", "error");
      } finally {
         setSubmitting(false);
      }
   };

   if (loading) return <div className="h-screen flex items-center justify-center bg-[#030712] text-white"><Loader className="animate-spin text-blue-600" size={32} /></div>;

   const alreadyMentor = status?.mentorApproved || user?.mentorApproved;
   const alreadyApplied = status?.mentorRequested;

   return (
      <div className="min-h-screen bg-[#030712] text-white pb-20 pt-28 px-6 font-sans selection:bg-indigo-500/30">

         <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
         </div>

         <div className="max-w-3xl mx-auto relative z-10">

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center mb-16"
            >
               <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Mentor Application</h1>
               <p className="text-slate-400 text-lg">Join us in shaping the next generation of tech leaders.</p>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.1 }}
               className="bg-[#0f1014] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

               <div className="relative z-10">
                  {alreadyMentor ? (
                     <div className="text-center py-10">
                        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                           <CheckCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">You're already a Mentor!</h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Your profile is active. manage your sessions in the dashboard.</p>
                        <button onClick={() => window.location.href = '/mentor-dashboard'} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-600/20">
                           Open Dashboard
                        </button>
                     </div>
                  ) : alreadyApplied ? (
                     <div className="text-center py-10">
                        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                           <Clock size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">Application Pending</h2>
                        <p className="text-slate-400 max-w-md mx-auto">
                           We are currently reviewing your application. You'll receive an email notification once the process is complete (usually within 48 hours).
                        </p>
                     </div>
                  ) : role !== "candidate" ? (
                     <div className="text-center py-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-500">
                           <AlertCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Account Restriction</h2>
                        <p className="text-slate-400">Please switch to a Candidate account to apply as a mentor.</p>
                     </div>
                  ) : (
                     <form onSubmit={handleSubmit} className="space-y-12">

                        {/* Section 1: Professional Info */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-xs border-b border-white/5 pb-4">
                              <Briefcase size={16} /> <span>Professional Background</span>
                           </div>

                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-400">Current Company</label>
                                 <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="text" required
                                       value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })}
                                       className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 outline-none transition-all focus:bg-indigo-500/5 placeholder:text-slate-600 font-medium"
                                       placeholder="e.g. Google, Microsoft"
                                    />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-400">Experience (Years)</label>
                                 <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="number" required min="1"
                                       value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                       className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 outline-none transition-all focus:bg-indigo-500/5 placeholder:text-slate-600 font-medium"
                                       placeholder="e.g. 5"
                                    />
                                 </div>
                              </div>
                              <div className="col-span-2 space-y-2">
                                 <label className="text-sm font-bold text-slate-400">Primary Expertise</label>
                                 <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="text" required
                                       value={formData.expertise} onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                                       className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 outline-none transition-all focus:bg-indigo-500/5 placeholder:text-slate-600 font-medium"
                                       placeholder="e.g. Full Stack Development, distributed Systems"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Section 2: Verification Documents */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-xs border-b border-white/5 pb-4">
                              <FileText size={16} /> <span>Verification Documents</span>
                           </div>
                           <div className="grid md:grid-cols-2 gap-6">
                              {[
                                 { label: 'Resume / CV', type: 'resume', desc: 'PDF or Word (Max 5MB)' },
                                 { label: 'Experience Certificate', type: 'experienceCert', desc: 'Proof of employment (Optional)' }
                              ].map((field) => (
                                 <div key={field.type} className={`relative bg-black/20 border border-dashed text-center rounded-xl p-6 flex flex-col items-center justify-center transition-all ${!files[field.type] ? 'border-white/10 hover:bg-white/5 hover:border-indigo-500/30' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                                    {fileUrls[field.type] ? (
                                       <div className="w-full">
                                          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                                             <CheckCircle size={24} />
                                          </div>
                                          <p className="text-sm font-bold text-emerald-500 mb-1">Uploaded Successfully</p>
                                          <p className="text-xs text-slate-500 truncate px-4">{files[field.type]?.name}</p>
                                       </div>
                                    ) : uploading[field.type] ? (
                                       <div className="flex flex-col items-center">
                                          <Loader className="animate-spin text-indigo-500 mb-2" size={24} />
                                          <p className="text-xs text-indigo-400">Uploading...</p>
                                       </div>
                                    ) : (
                                       <>
                                          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-500/20">
                                             <Upload size={24} />
                                          </div>
                                          <label className="cursor-pointer w-full h-full absolute inset-0 flex items-center justify-center z-10" htmlFor={field.type}>
                                             <input
                                                id={field.type}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.png"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e.target.files[0], field.type)}
                                             />
                                          </label>
                                          <span className="text-sm font-bold text-indigo-400 hover:text-indigo-300 block mb-1">{field.label}</span>
                                          <p className="text-xs text-slate-600">{field.desc}</p>
                                       </>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Section 3: Social Proof (Expanded) */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-xs border-b border-white/5 pb-4">
                              <Globe size={16} /> <span>Social Presence</span>
                           </div>
                           <div className="space-y-4">
                              <div className="relative">
                                 <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                 <input type="url" required
                                    value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 outline-none transition-all focus:bg-indigo-500/5 placeholder:text-slate-600 font-medium"
                                    placeholder="LinkedIn Profile URL"
                                 />
                              </div>
                              <div className="relative">
                                 <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                 <input type="url"
                                    value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 outline-none transition-all focus:bg-indigo-500/5 placeholder:text-slate-600 font-medium"
                                    placeholder="GitHub Profile URL (Optional)"
                                 />
                              </div>
                              <div className="relative">
                                 <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                 <input type="url"
                                    value={formData.portfolio} onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 outline-none transition-all focus:bg-indigo-500/5 placeholder:text-slate-600 font-medium"
                                    placeholder="Portfolio / Personal Website (Optional)"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Section 4: Motivation */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-xs border-b border-white/5 pb-4">
                              <Sparkles size={16} /> <span>About You</span>
                           </div>
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-400">Short Bio</label>
                                 <textarea required rows={3}
                                    value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-indigo-500 outline-none transition-all focus:bg-indigo-500/5 placeholder:text-slate-600 font-medium resize-none"
                                    placeholder="Tell us about yourself..."
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-400">Why do you want to mentor?</label>
                                 <textarea required rows={3}
                                    value={formData.motivation} onChange={e => setFormData({ ...formData, motivation: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-indigo-500 outline-none transition-all focus:bg-indigo-500/5 placeholder:text-slate-600 font-medium resize-none"
                                    placeholder="What motivates you to help others?"
                                 />
                              </div>
                           </div>
                        </div>

                        <button
                           type="submit" disabled={submitting}
                           className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.01] hover:shadow-indigo-600/40 flex items-center justify-center gap-2 text-lg"
                        >
                           {submitting ? <Loader className="animate-spin" size={24} /> : <>Submit Application <ChevronRight size={20} /></>}
                        </button>

                     </form>
                  )}
               </div>
            </motion.div>
         </div>
      </div>
   );
}
