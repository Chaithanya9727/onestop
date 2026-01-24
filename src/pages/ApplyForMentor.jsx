import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { CheckCircle, Loader, Clock, Linkedin, Briefcase, Globe, AlertCircle, Sparkles, Send } from "lucide-react";
import { useToast } from "../components/ToastProvider";

export default function ApplyForMentor() {
  const { user, role, refreshUser } = useAuth();
  const { get, post } = useApi();
  const { showToast } = useToast();

  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    expertise: "",
    experience: "",
    bio: "",
    company: "",
    linkedin: "",
    motivation: ""
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await post("/mentor/apply", formData);
      showToast(res.message, "success");
      setFormData({ expertise: "", experience: "", bio: "", company: "", linkedin: "", motivation: "" });
      await loadStatus();
      await refreshUser();
    } catch (err) {
      console.error("Mentor apply error:", err);
      showToast(err.message || "Error submitting application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  const alreadyMentor = status?.mentorApproved || user?.mentorApproved;
  const alreadyApplied = status?.mentorRequested;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 pt-24 px-6 relative overflow-hidden transition-colors duration-300">
       
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px]" />
       </div>

       <div className="max-w-4xl mx-auto relative z-10">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-4">
               <Sparkles size={12} /> Join The Network
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-tight text-slate-900 dark:text-white">Become a Mentor</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-medium">Share your expertise, guide the next generation of tech leaders, and build your personal brand.</p>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
         >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 dark:from-white/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
               {alreadyMentor ? (
                  <div className="text-center py-10">
                     <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                        <CheckCircle size={48} />
                     </div>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Welcome Aboard!</h2>
                     <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto font-medium">Your profile is active. You can now manage your availability and sessions.</p>
                     <button onClick={() => window.location.href='/mentor-dashboard'} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20">
                        Go to Dashboard
                     </button>
                  </div>
               ) : alreadyApplied ? (
                  <div className="text-center py-10">
                     <div className="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 dark:text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <Clock size={48} />
                     </div>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Application Under Review</h2>
                     <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-medium">
                        Thank you for your interest! Our team is reviewing your profile to ensure quality standards. You will hear from us soon.
                     </p>
                  </div>
               ) : role !== "candidate" ? (
                  <div className="text-center py-10 flex flex-col items-center">
                     <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-500">
                        <AlertCircle size={48} />
                     </div>
                     <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-2">Access Restricted</h2>
                     <p className="text-slate-500 dark:text-slate-400 font-medium">Please switch to a Candidate account to apply as a mentor.</p>
                  </div>
               ) : (
                  <form onSubmit={handleSubmit} className="space-y-10">
                     
                     {/* Section 1 */}
                     <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"><Briefcase size={20}/></div> Professional Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider">Current Company</label>
                              <input type="text" required
                                 value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                                 className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                 placeholder="e.g. Google"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider">Experience (Years)</label>
                              <input type="number" required min="1"
                                 value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}
                                 className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                 placeholder="e.g. 5"
                              />
                           </div>
                           <div className="col-span-2 space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider">Primary Expertise</label>
                              <input type="text" required
                                 value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})}
                                 className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                 placeholder="e.g. Product Management, Marketing"
                              />
                           </div>
                        </div>
                     </div>

                     {/* Section 2 */}
                     <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"><Globe size={20}/></div> Social Proof
                        </h3>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 flex items-center gap-2 tracking-wider"><Linkedin size={14}/> LinkedIn Profile URL</label>
                           <input type="url" required
                              value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-colors font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                              placeholder="https://linkedin.com/in/username"
                           />
                        </div>
                     </div>

                     {/* Section 3 */}
                     <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20"><Sparkles size={20}/></div> Motivation
                        </h3>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider">Short Bio</label>
                              <textarea required rows={3}
                                 value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                                 className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-pink-500 dark:focus:border-pink-500 outline-none resize-none transition-colors font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 custom-scrollbar"
                                 placeholder="Introduce yourself..."
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider">Why do you want to mentor?</label>
                              <textarea required rows={3}
                                 value={formData.motivation} onChange={e => setFormData({...formData, motivation: e.target.value})}
                                 className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-pink-500 dark:focus:border-pink-500 outline-none resize-none transition-colors font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 custom-scrollbar"
                                 placeholder="What drives you?"
                              />
                           </div>
                        </div>
                     </div>

                     <button 
                        type="submit" disabled={submitting}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-xl transition-all hover:bg-slate-800 dark:hover:bg-slate-200 shadow-xl shadow-slate-900/10 dark:shadow-white/10 hover:scale-[1.01] flex items-center justify-center gap-2 text-lg"
                     >
                        {submitting ? <Loader className="animate-spin" size={24} /> : <span className="flex items-center gap-2"><Send size={20}/> Submit Application</span>}
                     </button>

                  </form>
               )}
            </div>
         </motion.div>
       </div>
    </div>
  );
}
