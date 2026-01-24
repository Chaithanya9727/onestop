import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { Upload, Link, AlertCircle, CheckCircle, Loader, FileText, Send, X } from "lucide-react";
import { motion } from "framer-motion";

export default function SubmitEntry() {
  const { id } = useParams();
  const { post } = useApi();
  const navigate = useNavigate();

  const [submissionLink, setSubmissionLink] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async () => {
    if (!submissionLink && !file) {
      return setStatus({ type: "error", msg: "Please provide either a link or upload a file." });
    }

    const formData = new FormData();
    formData.append("submissionLink", submissionLink);
    if (file) formData.append("file", file);

    try {
      setLoading(true);
      setStatus({ type: "", msg: "" });
      
      await post(`/events/${id}/submit`, formData, {
         headers: { "Content-Type": "multipart/form-data" },
      });
      
      setStatus({ type: "success", msg: "Submission uploaded successfully!" });
      setTimeout(() => navigate(`/events/${id}`), 2000);
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus({ type: "error", msg: "Submission failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px]" />
       </div>

       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0f1014] w-full max-w-lg rounded-[2.5rem] shadow-2xl dark:shadow-none border border-slate-200 dark:border-white/5 overflow-hidden relative z-10 transition-colors duration-300">
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 p-10 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
             <button onClick={() => navigate(-1)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                <X size={20}/>
             </button>
             <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-white backdrop-blur-sm shadow-lg">
                <Send size={36} />
             </div>
             <h1 className="text-3xl font-black text-white mb-2">Submit Entry</h1>
             <p className="text-indigo-100 font-medium text-lg">Showcase your work to the world.</p>
          </div>

          <div className="p-10 space-y-8">
             
             {status.msg && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${status.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
                   {status.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                   {status.msg}
                </motion.div>
             )}

             <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2 px-1">
                   <Link size={16}/> Submission Link (Optional)
                </label>
                <input 
                   type="url" 
                   value={submissionLink} onChange={e => setSubmissionLink(e.target.value)}
                   placeholder="https://github.com/project..." 
                   className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400"
                />
             </div>

             <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#0f1014] px-4 text-slate-400 font-black tracking-widest">OR</span></div>
             </div>

             <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2 px-1">
                   <FileText size={16}/> Upload File (Optional)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-40 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group overflow-hidden relative">
                   <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 relative z-10">
                      {file ? (
                         <>
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                               <FileText size={24} />
                            </div>
                            <p className="text-sm text-slate-900 dark:text-white font-bold truncate max-w-full">{file.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                         </>
                      ) : (
                         <>
                            <div className="w-12 h-12 bg-slate-200 dark:bg-white/5 rounded-xl flex items-center justify-center mb-3 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all">
                               <Upload size={24} />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-bold group-hover:text-indigo-500 transition-colors">Click to upload file</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF, DOC, ZIP (Max 10MB)</p>
                         </>
                      )}
                   </div>
                   <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                </label>
             </div>

             <div className="pt-4">
                <button 
                   onClick={handleSubmit} 
                   disabled={loading} 
                   className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                >
                   {loading ? <Loader className="animate-spin" size={24}/> : <Send size={24}/>} Submit Entry
                </button>
             </div>

          </div>
       </motion.div>
    </div>
  );
}
