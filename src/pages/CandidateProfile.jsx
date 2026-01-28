import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import {
   FileText, Upload, Eye, Trash2, CheckCircle, AlertCircle, BookOpen, Clock,
   MapPin, Briefcase, Download, Save, X, Plus, GraduationCap, Award, Code, ExternalLink, Calendar, Edit2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CandidateProfile() {
   const { get, post, put, del } = useApi();
   const { user, refreshUser } = useAuth(); // Use refreshUser to sync context
   const [loading, setLoading] = useState(true);
   const [me, setMe] = useState(null);

   // File Upload State
   const [cvFile, setCvFile] = useState(null);
   const [coverLetter, setCoverLetter] = useState("");
   const [savingCL, setSavingCL] = useState(false);
   const [msg, setMsg] = useState("");

   // Section Modal States
   const [modalType, setModalType] = useState(null); // 'education', 'experience', 'project', 'certification'
   const [editItem, setEditItem] = useState(null); // If editing an existing item
   const [formData, setFormData] = useState({});

   const loadProfile = async () => {
      setLoading(true);
      try {
         const res = await get("/candidate/profile");
         setMe(res);
         setCoverLetter(res.coverLetter || "");
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadProfile();
   }, []);

   // --- Handlers ---
   const uploadResume = async () => {
      if (!cvFile) return;
      const formData = new FormData();
      formData.append("file", cvFile);
      try {
         setMsg("");
         const res = await post("/candidate/resume", formData, {
            headers: { "Content-Type": "multipart/form-data" },
         });
         setMsg(res.message || "Resume uploaded.");
         setCvFile(null);
         loadProfile();
      } catch (e) {
         setMsg(e.response?.data?.message || "Upload failed.");
      }
   };

   const saveCoverLetter = async () => {
      try {
         setSavingCL(true);
         const res = await put("/candidate/cover-letter", { coverLetter });
         setMsg(res.message || "Updated cover letter.");
      } catch (e) {
         setMsg(e.response?.data?.message || "Save failed.");
      } finally {
         setSavingCL(false);
      }
   };

   const handleSaveSection = async () => {
      try {
         // Construct new array based on modalType
         let updatedData = { ...me };
         let newArray = me[modalType] ? [...me[modalType]] : [];

         if (editItem) {
            // Update existing
            newArray = newArray.map(item => item._id === editItem._id ? { ...formData, _id: editItem._id } : item);
         } else {
            // Add new
            newArray.push(formData);
         }

         // Optimistic Update
         const reqBody = { [modalType]: newArray }; // e.g. { education: [...] }
         await put("/users/me", reqBody);

         setMe({ ...me, [modalType]: newArray });
         setModalType(null);
         setFormData({});
         setEditItem(null);
         setMsg(`${modalType} updated successfully!`);
         // refreshUser(); // Optional: Sync Global User Context if needed immediately elsewhere
      } catch (err) {
         setMsg(`Failed to save ${modalType}`);
      }
   };

   const handleDeleteItem = async (type, id) => {
      if (!window.confirm("Are you sure?")) return;
      try {
         const newArray = me[type].filter(i => i._id !== id);
         await put("/users/me", { [type]: newArray });
         setMe({ ...me, [type]: newArray });
         setMsg("Item deleted.");
      } catch (err) {
         setMsg("Failed to delete.");
      }
   };

   const unsaveJob = async (id) => {
      if (!window.confirm("Remove this job from saved?")) return;
      try {
         await del(`/candidate/save/${id}`);
         loadProfile();
      } catch (e) {
         console.error(e);
      }
   };

   const openModal = (type, item = null) => {
      setModalType(type);
      setEditItem(item);
      setFormData(item || {});
   };

   // --- Render Helpers ---
   const Modal = ({ title, children }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
               <button onClick={() => setModalType(null)}><X size={20} className="text-slate-500" /></button>
            </div>
            <div className="space-y-4">
               {children}
            </div>
            <div className="mt-8 flex gap-3">
               <button onClick={() => setModalType(null)} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
               <button onClick={handleSaveSection} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">Save</button>
            </div>
         </motion.div>
      </div>
   );

   const Input = ({ label, name, type = "text", placeholder }) => (
      <div>
         <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
         <input
            type={type}
            value={formData[name] || ""}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            placeholder={placeholder}
            className="w-full p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 dark:text-white font-medium transition-colors"
         />
      </div>
   );

   if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 pt-24 px-4 md:px-8">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: Main Profile (Resume Style) */}
            <div className="lg:col-span-8 space-y-8">

               {/* Header */}
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                     <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white dark:border-[#0f1014] shadow-lg">
                        <img src={me?.avatar || `https://ui-avatars.com/api/?name=${me?.name}`} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{me?.name}</h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-4">{me?.bio || "No headline added"}</p>

                        <div className="flex flex-wrap gap-2">
                           {me?.skills?.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">{s}</span>
                           ))}
                           <Link to="/profile" className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100 transition-colors flex items-center gap-1">
                              <Edit2 size={12} /> Edit Skills
                           </Link>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* EXPERIENCE */}
               <section className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-black flex items-center gap-2"><Briefcase className="text-blue-600" /> Experience</h2>
                     <button onClick={() => openModal('workExperience')} className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Plus size={20} /></button>
                  </div>
                  <div className="space-y-6">
                     {me?.workExperience?.length > 0 ? me.workExperience.map((exp, i) => ( // Accessing directly from me object
                        <div key={i} className="relative pl-6 border-l-2 border-slate-100 dark:border-white/10 pb-6 last:pb-0">
                           <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-600"></div>
                           <div className="flex justify-between items-start">
                              <div>
                                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">{exp.title}</h3>
                                 <p className="text-slate-500 font-medium">{exp.company}</p>
                                 <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                    <Calendar size={12} /> {exp.startDate ? new Date(exp.startDate).getFullYear() : 'N/A'} - {exp.current ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A')}
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => openModal('workExperience', exp)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400"><Edit2 size={14} /></button>
                                 <button onClick={() => handleDeleteItem('workExperience', exp._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                              </div>
                           </div>
                           {exp.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-xl">{exp.description}</p>}
                        </div>
                     )) : <p className="text-slate-400 italic">No experience added yet.</p>}
                  </div>
               </section>

               {/* EDUCATION */}
               <section className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-black flex items-center gap-2"><GraduationCap className="text-purple-600" /> Education</h2>
                     <button onClick={() => openModal('education')} className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"><Plus size={20} /></button>
                  </div>
                  <div className="grid gap-4">
                     {me?.education?.length > 0 ? me.education.map((edu, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-purple-200 transition-colors">
                           <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl font-black shadow-sm">
                              {(edu.school || "U").charAt(0)}
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between">
                                 <h3 className="font-bold text-slate-900 dark:text-white">{edu.school}</h3>
                                 <div className="flex gap-2">
                                    <button onClick={() => openModal('education', edu)} className="text-slate-400 hover:text-slate-600"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDeleteItem('education', edu._id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                 </div>
                              </div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{edu.degree} {edu.fieldOfStudy && `• ${edu.fieldOfStudy}`}</p>
                              <p className="text-xs text-slate-400 mt-1">{edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : ''}</p>
                              {edu.grade && <p className="text-xs font-bold text-green-600 mt-1">Grade: {edu.grade}</p>}
                           </div>
                        </div>
                     )) : <p className="text-slate-400 italic">No education added yet.</p>}
                  </div>
               </section>

               {/* PROJECTS */}
               <section className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-black flex items-center gap-2"><Code className="text-green-600" /> Projects</h2>
                     <button onClick={() => openModal('projects')} className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 transition-colors"><Plus size={20} /></button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                     {me?.projects?.length > 0 ? me.projects.map((proj, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:-translate-y-1 transition-transform">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => openModal('projects', proj)} className="text-slate-400 hover:text-slate-600"><Edit2 size={14} /></button>
                                 <button onClick={() => handleDeleteItem('projects', proj._id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                              </div>
                           </div>
                           {proj.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{proj.description}</p>}
                           {proj.link && (
                              <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-green-600 hover:underline">
                                 View Project <ExternalLink size={10} />
                              </a>
                           )}
                        </div>
                     )) : <p className="text-slate-400 italic col-span-2">No projects added yet.</p>}
                  </div>
               </section>

               {/* CERTIFICATIONS */}
               <section className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-black flex items-center gap-2"><Award className="text-amber-600" /> Certifications</h2>
                     <button onClick={() => openModal('certifications')} className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"><Plus size={20} /></button>
                  </div>
                  <div className="space-y-3">
                     {me?.certifications?.length > 0 ? me.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-lg"><Award size={20} /></div>
                              <div>
                                 <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cert.name}</h3>
                                 <p className="text-xs text-slate-500">{cert.organization} • {cert.issueDate ? new Date(cert.issueDate).getFullYear() : 'N/A'}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              {cert.link && <a href={cert.link} target="_blank" className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500"><ExternalLink size={16} /></a>}
                              <button onClick={() => handleDeleteItem('certifications', cert._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                           </div>
                        </div>
                     )) : <p className="text-slate-400 italic">No certifications added yet.</p>}
                  </div>
               </section>

            </div>


            {/* RIGHT COLUMN: Sidebar (Resume, Cover Letter, Saved) */}
            <div className="lg:col-span-4 space-y-8">

               {/* Status Messages for Desktop (Toast handled in layout but local msg used here too) */}
               <AnimatePresence>
                  {msg && (
                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 rounded-xl font-bold border flex items-center gap-3 ${msg.toLowerCase().includes('fail') ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20'}`}>
                        {msg.toLowerCase().includes('fail') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                        {msg}
                     </motion.div>
                  )}
               </AnimatePresence>

               <div className="bg-white dark:bg-[#0f1014] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2"><FileText className="text-blue-600" /> Resume</h3>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-center mb-4">
                     <input type="file" accept="application/pdf" onChange={(e) => setCvFile(e.target.files[0])} className="hidden" id="resume-upload" />
                     <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload size={24} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{cvFile ? cvFile.name : "Upload Resume (PDF)"}</span>
                     </label>
                  </div>
                  <button onClick={uploadResume} disabled={!cvFile} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 mb-3 shadow-lg shadow-blue-600/20">Upload</button>
                  {me?.resumeUrl && (
                     <a href={me.resumeUrl} target="_blank" rel="noreferrer" className="block w-full py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">View Current Resume</a>
                  )}
               </div>

               <div className="bg-white dark:bg-[#0f1014] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2"><BookOpen className="text-purple-600" /> Cover Letter</h3>
                  <textarea
                     value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                     className="w-full h-32 bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-sm focus:border-purple-500 border border-transparent outline-none resize-none mb-4"
                     placeholder="Draft your pitch..."
                  />
                  <button onClick={saveCoverLetter} disabled={savingCL} className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 disabled:opacity-50 shadow-lg shadow-purple-600/20">
                     {savingCL ? "Saving..." : "Save Draft"}
                  </button>
               </div>

               {/* Saved Jobs Mini-List */}
               <div className="bg-white dark:bg-[#0f1014] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2"><CheckCircle className="text-green-600" /> Saved Jobs</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                     {me?.savedJobs?.length > 0 ? me.savedJobs.map(job => (
                        <div key={job._id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-sm">
                           <div className="font-bold text-slate-900 dark:text-white mb-1 truncate">{job.title}</div>
                           <div className="flex gap-2">
                              <Link to={`/jobs/${job._id}`} className="text-xs font-bold text-blue-600 hover:text-blue-500">View</Link>
                              <button onClick={() => unsaveJob(job._id)} className="text-xs font-bold text-red-500 hover:text-red-400">Remove</button>
                           </div>
                        </div>
                     )) : <p className="text-slate-400 text-sm italic text-center">No saved jobs.</p>}
                  </div>
               </div>

            </div>
         </div>

         {/* MODALS */}
         <AnimatePresence>
            {modalType === 'education' && (
               <Modal title={editItem ? "Edit Education" : "Add Education"}>
                  <Input label="School / University" name="school" placeholder="Harvard University" />
                  <div className="grid grid-cols-2 gap-4">
                     <Input label="Degree" name="degree" placeholder="B.Sc, Masters..." />
                     <Input label="Field of Study" name="fieldOfStudy" placeholder="Computer Science" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <Input type="date" label="Start Date" name="startDate" />
                     <Input type="date" label="End Date" name="endDate" />
                  </div>
                  <Input label="Grade / GPA" name="grade" placeholder="3.8/4.0" />
               </Modal>
            )}

            {modalType === 'workExperience' && (
               <Modal title={editItem ? "Edit Experience" : "Add Experience"}>
                  <Input label="Company Name" name="company" placeholder="Google, Startup Inc..." />
                  <Input label="Job Title" name="title" placeholder="Software Engineer" />
                  <div className="grid grid-cols-2 gap-4">
                     <Input type="date" label="Start Date" name="startDate" />
                     <div className="space-y-1">
                        <Input type="date" label="End Date" name="endDate" />
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-2">
                           <input type="checkbox" checked={formData.current || false} onChange={e => setFormData({ ...formData, current: e.target.checked })} />
                           I currently work here
                        </label>
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Description</label>
                     <textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 h-24 resize-none dark:text-white" />
                  </div>
               </Modal>
            )}

            {modalType === 'projects' && (
               <Modal title={editItem ? "Edit Project" : "Add Project"}>
                  <Input label="Project Title" name="title" placeholder="Portfolio Website" />
                  <Input label="Project Link" name="link" placeholder="https://github.com/..." />
                  <div className="grid grid-cols-2 gap-4">
                     <Input type="date" label="Start Date" name="startDate" />
                     <Input type="date" label="End Date" name="endDate" />
                  </div>
                  <div>
                     <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Description</label>
                     <textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 h-24 resize-none dark:text-white" />
                  </div>
               </Modal>
            )}

            {modalType === 'certifications' && (
               <Modal title={editItem ? "Edit Certification" : "Add Certification"}>
                  <Input label="Name" name="name" placeholder="AWS Certified Solutions Architect" />
                  <Input label="Organization" name="organization" placeholder="Amazon Web Services" />
                  <div className="grid grid-cols-2 gap-4">
                     <Input type="date" label="Issue Date" name="issueDate" />
                     <Input label="Credential URL" name="link" placeholder="https://..." />
                  </div>
               </Modal>
            )}
         </AnimatePresence>

      </div>
   );
}
