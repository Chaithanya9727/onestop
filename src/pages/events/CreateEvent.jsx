import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { 
  Calendar, MapPin, AlignLeft, Users, Tag, Trophy, Scroll, HelpCircle, Image as ImageIcon, Plus, Trash2, Save, Loader, X, ArrowLeft
} from "lucide-react";

export default function CreateEvent() {
  const { post } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
  });

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

      if (cover) fd.append("cover", cover);

      await post("/events", fd, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Event created successfully!", "success");
      navigate("/admin/events");
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

  const handleCoverSelect = (e) => {
     const file = e.target.files[0];
     if(file) {
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
                    <ArrowLeft size={20}/>
                 </button>
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create New Event</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Configure details, prizes, and rules.</p>
                 </div>
             </div>
             <button onClick={submit} disabled={loading} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader className="animate-spin" size={20}/> : <Save size={20}/>} Publish Event
             </button>
          </div>

          <div className="grid gap-8">
             
             {/* Basic Info */}
             <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><AlignLeft size={20}/></div>
                   Basic Information
                </h2>
                
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
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider text-indigo-500">Linked Job ID (For Hiring Challenges)</label>
                      <div className="relative">
                         <input type="text" value={form.linkedJob} onChange={e => set('linkedJob', e.target.value)} className="w-full p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl font-bold text-indigo-900 dark:text-indigo-200 outline-none focus:border-indigo-500 transition-all placeholder:text-indigo-300" placeholder="Paste Job ID here..." />
                         <span className="text-[10px] font-bold text-indigo-400/70 absolute right-4 top-5 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">Optional</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Logistics */}
             <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                   <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center"><Calendar size={20}/></div>
                   Logistics
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Start Date *</label>
                      <input type="datetime-local" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">End Date *</label>
                      <input type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Registration Deadline *</label>
                      <input type="datetime-local" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Location</label>
                      <div className="relative">
                         <MapPin size={18} className="absolute left-4 top-4 text-slate-400"/>
                         <input type="text" value={form.location} onChange={e => set('location', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all placeholder:font-medium" placeholder="e.g. Online or Delhi" />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Max Team Size</label>
                      <div className="relative">
                         <Users size={18} className="absolute left-4 top-4 text-slate-400"/>
                         <input type="number" min="1" value={form.maxTeamSize} onChange={e => set('maxTeamSize', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all" />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Tags</label>
                      <div className="relative">
                         <Tag size={18} className="absolute left-4 top-4 text-slate-400"/>
                         <input type="text" value={form.tags.join(', ')} onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()))} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 transition-all placeholder:font-medium" placeholder="Comma separated..." />
                      </div>
                   </div>
                </div>
             </div>

             {/* Prizes & Rules */}
             <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center"><Trophy size={20}/></div>
                        Prizes
                      </h2>
                      <button onClick={() => addStr('prizes')} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors"><Plus size={20}/></button>
                   </div>
                   <div className="space-y-4 flex-1">
                      {form.prizes.map((p, i) => (
                         <div key={i} className="flex gap-2">
                             <div className="flex-1 relative">
                                <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-300 dark:text-slate-600">#{i+1}</span>
                                <input type="text" value={p} onChange={e => setStr('prizes', i, e.target.value)} className="w-full pl-8 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all" placeholder="Prize description..." />
                             </div>
                            <button onClick={() => delStr('prizes', i)} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors rounded-xl"><Trash2 size={20}/></button>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"><Scroll size={20}/></div>
                        Rules
                      </h2>
                      <button onClick={() => addStr('rules')} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors"><Plus size={20}/></button>
                   </div>
                   <div className="space-y-4 flex-1">
                      {form.rules.map((r, i) => (
                         <div key={i} className="flex gap-2">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-300 dark:text-slate-600">#{i+1}</span>
                                <input type="text" value={r} onChange={e => setStr('rules', i, e.target.value)} className="w-full pl-8 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all" placeholder="Rule description..." />
                             </div>
                            <button onClick={() => delStr('rules', i)} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors rounded-xl"><Trash2 size={20}/></button>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* FAQs */}
             <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center"><HelpCircle size={20}/></div>
                     FAQs
                   </h2>
                   <button onClick={addFaq} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors"><Plus size={20}/></button>
                </div>
                <div className="space-y-4">
                   {faqs.map((f, i) => (
                      <div key={i} className="flex flex-col md:flex-row gap-4 items-start bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                         <div className="flex-1 w-full space-y-2">
                            <input type="text" value={f.q} onChange={e => setFaq(i, 'q', e.target.value)} className="w-full p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none placeholder:font-medium" placeholder="Question" />
                            <input type="text" value={f.a} onChange={e => setFaq(i, 'a', e.target.value)} className="w-full p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:border-indigo-500 outline-none placeholder:font-medium" placeholder="Answer" />
                         </div>
                         <button onClick={() => delFaq(i)} className="p-2 hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors rounded-xl"><Trash2 size={20}/></button>
                      </div>
                   ))}
                </div>
             </div>

             {/* Cover Image */}
             <div className="bg-white dark:bg-[#0f1014] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white mb-8">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><ImageIcon size={20}/></div>
                   Cover Image
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-8">
                   <div className="w-full md:w-80 h-48 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex items-center justify-center overflow-hidden relative group">
                      {coverPreview ? (
                         <>
                            <img src={coverPreview} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => {setCover(null); setCoverPreview(null)}} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors shadow-lg"><Trash2 size={20}/></button>
                            </div>
                         </>
                      ) : (
                         <div className="text-center p-4">
                            <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2"/>
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

          </div>
       </motion.div>
    </div>
  );
}
