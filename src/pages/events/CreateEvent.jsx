import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import {
   Calendar, MapPin, AlignLeft, Users, Tag, Trophy, Scroll, HelpCircle, Image as ImageIcon, Plus, Trash2, Save, Loader, X, ArrowLeft, Eye, Edit
} from "lucide-react";

export default function CreateEvent() {
   const { post } = useApi();
   const { showToast } = useToast();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [isPreviewMode, setIsPreviewMode] = useState(false);
   const getMinDate = (daysToAdd = 0) => {
      const d = new Date();
      d.setDate(d.getDate() + daysToAdd);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Adjust for local timezone
      return d.toISOString().slice(0, 16);
   };

   const minDateTime = getMinDate(0);
   const minStartDateTime = getMinDate(7); // 7 Days rule

   const [form, setForm] = useState({
      title: "",
      subtitle: "",
      description: "",
      organizer: "",
      category: "other",
      tags: [],
      location: "Online",
      startDate: "",
      endDate: "",
      registrationDeadline: "",
      maxTeamSize: 1,
      prizes: [""],
      rules: [""],
      linkedJob: "",
      teamFinderEnabled: true,
      certificateConfig: {
         enabled: false,
         templateUrl: "",
         issuingAuthority: "",
      },
   });

   const [rounds, setRounds] = useState([
      { roundNumber: 1, title: "Submission Round", type: "submission", description: "", isElimination: true }
   ]);

   const [customFields, setCustomFields] = useState([]);

   const [faqs, setFaqs] = useState([{ q: "", a: "" }]);
   const [cover, setCover] = useState(null);
   const [coverPreview, setCoverPreview] = useState(null);

   const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

   const validateForm = () => {
      const { title, startDate, endDate, registrationDeadline } = form;
      if (!title || !startDate || !endDate || !registrationDeadline) {
         showToast("Please fill all required fields marked with *", "warning");
         return false;
      }

      const now = new Date();
      const regDate = new Date(registrationDeadline);
      const start = new Date(startDate);
      const end = new Date(endDate);

      const minStart = new Date();
      minStart.setDate(minStart.getDate() + 7);
      // Reset time portion for cleaner day comparison if needed, but strict 7x24h is usually better and safer.
      // We will stick to strict time comparison as backend does.

      // Past date check
      if (regDate < now) {
         showToast("Registration deadline cannot be in the past.", "warning");
         return false;
      }
      if (start < minStart) {
         showToast("Event start date must be at least 7 days from today to ensure proper planning.", "warning");
         return false;
      }

      // Sequence check
      if (regDate > start) {
         showToast("Registration deadline must be before the event start date.", "warning");
         return false;
      }
      if (start > end) {
         showToast("Event start date must be before the end date.", "warning");
         return false;
      }

      return true;
   };

   const submit = async () => {
      if (!validateForm()) return;
      setLoading(true);

      try {
         const fd = new FormData();

         Object.entries(form).forEach(([key, val]) => {
            if (Array.isArray(val)) fd.append(key, JSON.stringify(val));
            else fd.append(key, val);
         });

         fd.append("faqs", JSON.stringify(faqs.filter((f) => f.q.trim() && f.a.trim()).map((f) => ({ question: f.q, answer: f.a }))));
         fd.append("rounds", JSON.stringify(rounds));
         fd.append("customFields", JSON.stringify(customFields));

         if (cover) fd.append("cover", cover);

         await post("/events", fd, { headers: { "Content-Type": "multipart/form-data" } });
         showToast("Event created successfully!", "success");
         navigate("/manage/events");
      } catch (err) {
         console.error("CreateEvent error:", err);
         showToast(`Failed to create event: ${err.message}`, "error");
      } finally {
         setLoading(false);
      }
   };

   const addStr = (key) => setForm((f) => ({ ...f, [key]: [...f[key], ""] }));
   const setStr = (key, idx, val) => {
      const arr = [...form[key]];
      arr[idx] = val;
      setForm({ ...form, [key]: arr });
   };
   const delStr = (key, idx) => {
      const arr = [...form[key]];
      arr.splice(idx, 1);
      setForm({ ...form, [key]: arr });
   };

   const setFaq = (idx, key, val) =>
      setFaqs((rows) => rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));
   const addFaq = () => setFaqs((s) => [...s, { q: "", a: "" }]);
   const delFaq = (idx) => setFaqs((s) => s.filter((_, i) => i !== idx));

   const addRound = () => setRounds([...rounds, { roundNumber: rounds.length + 1, title: "", type: "submission", description: "", isElimination: true }]);
   const updateRound = (idx, key, val) => setRounds(rows => rows.map((r, i) => i === idx ? { ...r, [key]: val } : r));
   const delRound = (idx) => setRounds(rows => rows.filter((_, i) => i !== idx).map((r, i) => ({ ...r, roundNumber: i + 1 })));

   const addField = () => setCustomFields([...customFields, { id: Date.now().toString(), label: "", type: "text", required: false, placeholder: "" }]);
   const updateField = (idx, key, val) => setCustomFields(rows => rows.map((r, i) => i === idx ? { ...r, [key]: val } : r));
   const delField = (idx) => setCustomFields(rows => rows.filter((_, i) => i !== idx));

   const handleCoverSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
         setCover(file);
         setCoverPreview(URL.createObjectURL(file));
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white py-10 pb-24 relative overflow-hidden transition-colors duration-300">
         {/* Background Glow */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[120px] transition-colors" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors" />
         </div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6 relative z-10">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
               <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-500 dark:text-slate-400">
                     <ArrowLeft size={20} />
                  </button>
                  <div>
                     <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create New Event</h1>
                     <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {isPreviewMode ? "Review all details before publishing" : "Configure details, prizes, and rules."}
                     </p>
                  </div>
               </div>
               {isPreviewMode && (
                  <button
                     onClick={() => setIsPreviewMode(false)}
                     className="px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white font-black rounded-2xl shadow-xl shadow-slate-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                     <Edit size={20} /> Edit Details
                  </button>
               )}
            </div>

            {!isPreviewMode ? (
               <div className="grid gap-8">

                  {/* Basic Info */}
                  <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                     <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><AlignLeft size={20} /></div>
                        General Details
                     </h2>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 -mt-4 ml-13">Enter the primary information that identifies your event on the platform.</p>

                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Event Title *</label>
                           <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all placeholder:font-medium text-lg" placeholder="e.g. HackOverflow 2.0" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Subtitle</label>
                           <input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all placeholder:font-medium" placeholder="A short tagline..." />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Category</label>
                           <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all appearance-none cursor-pointer">
                              <option value="hackathon" className="bg-white dark:bg-[#0f1014]">Hackathon</option>
                              <option value="quiz" className="bg-white dark:bg-[#0f1014]">Quiz</option>
                              <option value="case" className="bg-white dark:bg-[#0f1014]">Case Study</option>
                              <option value="job-challenge" className="bg-white dark:bg-[#0f1014]">Job Challenge</option>
                              <option value="workshop" className="bg-white dark:bg-[#0f1014]">Workshop</option>
                              <option value="other" className="bg-white dark:bg-[#0f1014]">Other</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Organizer</label>
                           <input type="text" value={form.organizer} onChange={e => set('organizer', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all placeholder:font-medium" placeholder="Organization Name" />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Description</label>
                           <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all resize-none placeholder:font-medium leading-relaxed" placeholder="Detailed event description..." />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider text-indigo-500">Hiring Challenge Integration (Optional)</label>
                           <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 -mt-2">Link this event to an existing Job ID to automatically process candidates for hiring.</p>
                           <div className="relative">
                              <input type="text" value={form.linkedJob} onChange={e => set('linkedJob', e.target.value)} className="w-full p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl font-bold text-indigo-900 dark:text-indigo-200 outline-none focus:border-indigo-500 transition-all placeholder:text-indigo-300" placeholder="Paste Job ID here..." />
                              <span className="text-[10px] font-bold text-indigo-400/70 absolute right-4 top-5 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">Optional</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Opportunity Timeline & Venue */}
                  <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                     <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center"><Calendar size={20} /></div>
                        Opportunity Timeline & Venue
                     </h2>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 -mt-4 ml-13">Define the key dates, location, and team requirements for event participants.</p>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Start Date *</label>
                           <input type="datetime-local" min={minStartDateTime} value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">End Date *</label>
                           <input type="datetime-local" min={minDateTime} value={form.endDate} onChange={e => set('endDate', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Registration Deadline *</label>
                           <input type="datetime-local" min={minDateTime} value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Location</label>
                           <div className="relative">
                              <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                              <input type="text" value={form.location} onChange={e => set('location', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all placeholder:font-medium" placeholder="e.g. Online or Delhi" />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Max Team Size</label>
                           <div className="relative">
                              <Users size={18} className="absolute left-4 top-4 text-slate-400" />
                              <input type="number" min="1" value={form.maxTeamSize} onChange={e => set('maxTeamSize', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all" />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Tags</label>
                           <div className="relative">
                              <Tag size={18} className="absolute left-4 top-4 text-slate-400" />
                              <input type="text" value={form.tags.join(', ')} onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()))} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all placeholder:font-medium" placeholder="Comma separated..." />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* 🏆 Multi-Round Pipeline */}
                  <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                           <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center"><Trophy size={20} /></div>
                           Event Rounds (Pipeline)
                        </h2>
                        <button onClick={addRound} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-orange-600 dark:text-orange-400 transition-colors flex items-center gap-2 text-sm font-bold">
                           <Plus size={18} /> Add Round
                        </button>
                     </div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 -mt-6">Define stages like Quizzes, Case Studies, or Interviews. Candidates will be filtered after each round.</p>

                     <div className="grid gap-6">
                        {rounds.map((r, i) => (
                           <div key={i} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 relative group">
                              <div className="absolute -left-3 top-6 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shadow-lg">{r.roundNumber}</div>

                              <div className="grid md:grid-cols-3 gap-6 ml-4">
                                 <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Round Title</label>
                                    <input type="text" value={r.title} onChange={e => updateRound(i, 'title', e.target.value)} className="w-full p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl font-bold" placeholder="e.g. Preliminary Quiz" />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</label>
                                    <select value={r.type} onChange={e => updateRound(i, 'type', e.target.value)} className="w-full p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl font-bold">
                                       <option value="quiz">Quiz</option>
                                       <option value="submission">Submission</option>
                                       <option value="interview">Interview</option>
                                       <option value="other">Other</option>
                                    </select>
                                 </div>
                                 <div className="md:col-span-3">
                                    <textarea value={r.description} onChange={e => updateRound(i, 'description', e.target.value)} className="w-full p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm" placeholder="Rules or instructions for this round..." rows={2} />
                                 </div>
                              </div>
                              <button onClick={() => delRound(i)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* 📝 Custom Registration Form Builder */}
                  <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                           <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center"><Scroll size={20} /></div>
                           Custom Registration Fields
                        </h2>
                        <button onClick={addField} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-purple-600 dark:text-purple-400 transition-colors flex items-center gap-2 text-sm font-bold">
                           <Plus size={18} /> Add Field
                        </button>
                     </div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 -mt-6">Collect specific data from participants (e.g. Portfolio Link, Github, Branch, Graduation Year).</p>

                     <div className="grid gap-4">
                        {customFields.map((f, i) => (
                           <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 items-center">
                              <input type="text" value={f.label} onChange={e => updateField(i, 'label', e.target.value)} className="flex-1 p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm" placeholder="Field Label (e.g. LinkedIn Profile)" />
                              <select value={f.type} onChange={e => updateField(i, 'type', e.target.value)} className="p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm">
                                 <option value="text">Short Text</option>
                                 <option value="url">URL Link</option>
                                 <option value="number">Number</option>
                                 <option value="file">File Upload</option>
                              </select>
                              <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={f.required} onChange={e => updateField(i, 'required', e.target.checked)} className="rounded border-slate-300 dark:border-white/10" />
                                 <span className="text-xs font-bold text-slate-500 uppercase">Required</span>
                              </label>
                              <button onClick={() => delField(i)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Team Finder & Certificates */}
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Users size={20} /></div>
                           Team Finder
                        </h2>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                           <div className="space-y-1">
                              <p className="font-bold text-sm">Enable "Looking for Teammates"</p>
                              <p className="text-xs text-slate-500">Allows users to list themselves for teaming up.</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={form.teamFinderEnabled} onChange={e => set('teamFinderEnabled', e.target.checked)} className="sr-only peer" />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                           </label>
                        </div>
                     </div>

                     <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                           <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Scroll size={20} /></div>
                           Certificates
                        </h2>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                           <div className="space-y-1">
                              <p className="font-bold text-sm">Auto-Generate Certificates</p>
                              <p className="text-xs text-slate-500">Available for winners and participants.</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={form.certificateConfig.enabled} onChange={e => set('certificateConfig', { ...form.certificateConfig, enabled: e.target.checked })} className="sr-only peer" />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                           </label>
                        </div>
                     </div>
                  </div>

                  {/* Prizes & Rules */}
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                           <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                              <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center"><Trophy size={20} /></div>
                              Rewards & Recognition
                           </h2>
                           <button onClick={() => addStr('prizes')} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors"><Plus size={20} /></button>
                        </div>
                        <div className="space-y-4 flex-1">
                           {form.prizes.map((p, i) => (
                              <div key={i} className="flex gap-2">
                                 <div className="flex-1 relative">
                                    <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-300 dark:text-slate-600">#{i + 1}</span>
                                    <input type="text" value={p} onChange={e => setStr('prizes', i, e.target.value)} className="w-full pl-8 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all" placeholder="Prize description..." />
                                 </div>
                                 <button onClick={() => delStr('prizes', i)} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors rounded-xl"><Trash2 size={20} /></button>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                           <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"><Scroll size={20} /></div>
                              Guidelines & Compliance
                           </h2>
                           <button onClick={() => addStr('rules')} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors"><Plus size={20} /></button>
                        </div>
                        <div className="space-y-4 flex-1">
                           {form.rules.map((r, i) => (
                              <div key={i} className="flex gap-2">
                                 <div className="flex-1 relative">
                                    <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-300 dark:text-slate-600">#{i + 1}</span>
                                    <input type="text" value={r} onChange={e => setStr('rules', i, e.target.value)} className="w-full pl-8 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all" placeholder="Rule description..." />
                                 </div>
                                 <button onClick={() => delStr('rules', i)} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors rounded-xl"><Trash2 size={20} /></button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* FAQs */}
                  <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                     <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center"><HelpCircle size={20} /></div>
                           FAQs
                        </h2>
                        <button onClick={addFaq} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors"><Plus size={20} /></button>
                     </div>
                     <div className="space-y-4">
                        {faqs.map((f, i) => (
                           <div key={i} className="flex flex-col md:flex-row gap-4 items-start bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                              <div className="flex-1 w-full space-y-2">
                                 <input type="text" value={f.q} onChange={e => setFaq(i, 'q', e.target.value)} className="w-full p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none placeholder:font-medium" placeholder="Question" />
                                 <input type="text" value={f.a} onChange={e => setFaq(i, 'a', e.target.value)} className="w-full p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:border-indigo-500 outline-none placeholder:font-medium" placeholder="Answer" />
                              </div>
                              <button onClick={() => delFaq(i)} className="p-2 hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors rounded-xl"><Trash2 size={20} /></button>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Cover Image */}
                  <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                     <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><ImageIcon size={20} /></div>
                        Cover Image
                     </h2>
                     <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-80 h-48 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex items-center justify-center overflow-hidden relative group">
                           {coverPreview ? (
                              <>
                                 <img src={coverPreview} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => { setCover(null); setCoverPreview(null) }} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors shadow-lg"><Trash2 size={20} /></button>
                                 </div>
                              </>
                           ) : (
                              <div className="text-center p-4">
                                 <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                 <span className="text-slate-400 dark:text-slate-500 text-sm font-bold">No image selected</span>
                              </div>
                           )}
                        </div>
                        <label className="px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-2xl cursor-pointer transition-colors border border-slate-200 dark:border-white/5">
                           Choose Image
                           <input type="file" hidden accept="image/*" onChange={handleCoverSelect} />
                        </label>
                     </div>
                  </div>

                  {/* Bottom Preview Button */}
                  <div className="flex justify-center mt-4">
                     <button
                        onClick={() => {
                           if (validateForm()) {
                              setIsPreviewMode(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                           }
                        }}
                        className="px-10 py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black rounded-2xl shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                     >
                        <Eye size={20} /> Preview Event
                     </button>
                  </div>

               </div>
            ) : (
               <div className="space-y-6">
                  {/* Preview Mode */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-8 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800">
                     <h2 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-4">Event Preview</h2>
                     <p className="text-indigo-700 dark:text-indigo-300 font-medium">Review all details carefully before publishing your event.</p>
                  </div>

                  {coverPreview && (
                     <div className="bg-white dark:bg-[#0f1014] p-6 rounded-3xl border border-slate-200 dark:border-white/5">
                        <img src={coverPreview} alt="Cover" className="w-full h-64 object-cover rounded-2xl" />
                     </div>
                  )}

                  <div className="bg-white dark:bg-[#0f1014] p-8 rounded-3xl border border-slate-200 dark:border-white/5 space-y-8">
                     {/* Header Info */}
                     <div>
                        <div className="flex flex-wrap gap-3 mb-4">
                           <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-black uppercase tracking-wider">
                              {form.category}
                           </span>
                           {form.organizer && (
                              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                                 by {form.organizer}
                              </span>
                           )}
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{form.title || "Untitled Event"}</h3>
                        {form.subtitle && <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">{form.subtitle}</p>}

                        {form.tags && form.tags.length > 0 && form.tags[0] !== "" && (
                           <div className="flex flex-wrap gap-2 mt-4">
                              {form.tags.map((tag, i) => (
                                 <span key={i} className="px-3 py-1 border border-slate-200 dark:border-white/10 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                                    #{tag}
                                 </span>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* Key Details Grid */}
                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                           <MapPin className="text-pink-500" size={18} />
                           <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Location</p>
                              <span className="font-bold text-slate-900 dark:text-white">{form.location}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                           <Users className="text-blue-500" size={18} />
                           <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Team Size</p>
                              <span className="font-bold text-slate-900 dark:text-white">Max {form.maxTeamSize} Members</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                           <Calendar className="text-orange-500" size={18} />
                           <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Start Date</p>
                              <span className="font-bold text-slate-900 dark:text-white">{form.startDate ? new Date(form.startDate).toLocaleString() : "Not set"}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                           <Calendar className="text-red-500" size={18} />
                           <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Deadline</p>
                              <span className="font-bold text-slate-900 dark:text-white">{form.registrationDeadline ? new Date(form.registrationDeadline).toLocaleString() : "Not set"}</span>
                           </div>
                        </div>
                     </div>

                     {/* Description */}
                     {form.description && (
                        <div>
                           <h4 className="font-black text-slate-900 dark:text-white mb-3 text-lg">About Event</h4>
                           <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{form.description}</p>
                        </div>
                     )}

                     {/* Features Badges */}
                     <div className="flex flex-wrap gap-4">
                        {form.teamFinderEnabled && (
                           <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm">
                              <Users size={16} /> Team Finder Enabled
                           </div>
                        )}
                        {form.certificateConfig.enabled && (
                           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-sm">
                              <Scroll size={16} /> Certificates Provided
                           </div>
                        )}
                        {form.linkedJob && (
                           <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-sm">
                              <Tag size={16} /> Linked to Job: {form.linkedJob}
                           </div>
                        )}
                     </div>

                     <div className="grid md:grid-cols-2 gap-8">
                        {/* Prizes */}
                        {form.prizes.filter(p => p.trim()).length > 0 && (
                           <div>
                              <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                                 <Trophy className="text-yellow-500" size={20} /> Prizes & Rewards
                              </h4>
                              <ul className="space-y-3">
                                 {form.prizes.filter(p => p.trim()).map((p, i) => (
                                    <li key={i} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
                                       <span className="font-black text-yellow-600 dark:text-yellow-500">#{i + 1}</span>
                                       <span className="font-medium text-slate-800 dark:text-slate-200">{p}</span>
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        )}

                        {/* Rules */}
                        {form.rules.filter(r => r.trim()).length > 0 && (
                           <div>
                              <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                                 <Scroll className="text-slate-500" size={20} /> Rules & Guidelines
                              </h4>
                              <ul className="space-y-3">
                                 {form.rules.filter(r => r.trim()).map((r, i) => (
                                    <li key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                                       <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                                       <span className="font-medium text-slate-700 dark:text-slate-300">{r}</span>
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        )}
                     </div>

                     {/* Rounds */}
                     {rounds.length > 0 && (
                        <div>
                           <h4 className="font-black text-slate-900 dark:text-white mb-4 text-lg">Event Stages</h4>
                           <div className="space-y-3">
                              {rounds.map((r, i) => (
                                 <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm font-black flex-shrink-0">{r.roundNumber}</span>
                                    <div>
                                       <div className="flex flex-wrap items-center gap-2 mb-1">
                                          <h5 className="font-bold text-slate-900 dark:text-white">{r.title}</h5>
                                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-slate-500 dark:text-slate-400">{r.type}</span>
                                       </div>
                                       {r.description && <p className="text-sm text-slate-600 dark:text-slate-400">{r.description}</p>}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* FAQs */}
                     {faqs.filter(f => f.q.trim() && f.a.trim()).length > 0 && (
                        <div>
                           <h4 className="font-black text-slate-900 dark:text-white mb-4 text-lg">Frequently Asked Questions</h4>
                           <div className="grid md:grid-cols-2 gap-4">
                              {faqs.filter(f => f.q.trim() && f.a.trim()).map((f, i) => (
                                 <div key={i} className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                    <p className="font-bold text-slate-900 dark:text-white mb-2 text-sm">Q: {f.q}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">A: {f.a}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Custom Fields */}
                     {customFields.length > 0 && (
                        <div>
                           <h4 className="font-black text-slate-900 dark:text-white mb-4 text-lg">Additional Registration Info</h4>
                           <div className="flex flex-wrap gap-2">
                              {customFields.map((f, i) => (
                                 <div key={i} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5">
                                    {f.label} <span className="opacity-50 text-xs uppercase ml-1">({f.type})</span>
                                    {f.required && <span className="text-red-500 ml-1">*</span>}
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )
            }


            {/* Publish Button - Always at bottom */}
            {
               isPreviewMode && (
                  <div className="sticky bottom-6 mt-8 flex justify-center">
                     <button
                        onClick={submit}
                        disabled={loading}
                        className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                     >
                        {loading ? <Loader className="animate-spin" size={24} /> : <Save size={24} />}
                        Publish Event
                     </button>
                  </div>
               )
            }
         </motion.div >
      </div >
   );
}
