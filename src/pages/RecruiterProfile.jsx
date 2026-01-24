import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Building2, Mail, Phone, Globe, CheckCircle
} from "lucide-react";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider.jsx";

export default function RecruiterProfile() {
  const { get } = useApi();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await get("/recruiter/rpanel/profile");
      setData(res);
    } catch (err) {
      console.error(err);
      showToast("Failed to load recruiter profile", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 pb-20 bg-slate-50 dark:bg-[#0a0a0a] min-h-screen transition-colors duration-300"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-600 dark:to-violet-900 border border-white/10"></div>
         {/* Decorative Background Elements */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>
         <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="shrink-0 group">
             <div className="w-36 h-36 rounded-[2rem] border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center relative transform group-hover:scale-105 transition-transform duration-500">
                {data.avatar ? (
                   <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
                ) : (
                   <User size={64} className="text-white/60" />
                )}
             </div>
          </div>
          <div className="text-center md:text-left flex-1">
             <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight drop-shadow-sm">{data.name || "Recruiter Name"}</h1>
             <p className="text-xl text-indigo-100 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                <Building2 size={20} className="text-indigo-200" /> {data.orgName || "Organization Name"}
             </p>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-400/30 text-emerald-100 shadow-sm">
                   <div className="bg-emerald-400 rounded-full p-0.5"><CheckCircle size={10} className="text-emerald-900" strokeWidth={3} /></div> Verified Recruiter
                </div>
                <div className="px-4 py-1.5 bg-black/20 backdrop-blur-md rounded-full text-sm font-medium flex items-center gap-2 border border-white/10 text-white/90">
                   <Mail size={14} /> {data.email}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Personal Info */}
         <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500/30 transition-all">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                 <User size={20} />
               </div>
               Personal Information
            </h2>

            <div className="space-y-8">
               <div className="group flex items-start gap-4">
                  <div className="mt-1 w-1 h-8 bg-slate-200 dark:bg-white/10 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                  <div>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Full Name</p>
                     <p className="text-slate-900 dark:text-white font-bold text-lg">{data.name}</p>
                  </div>
               </div>
               <div className="group flex items-start gap-4">
                  <div className="mt-1 w-1 h-8 bg-slate-200 dark:bg-white/10 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                  <div>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Email</p>
                     <p className="text-slate-900 dark:text-white font-bold text-lg">{data.email}</p>
                  </div>
               </div>
               <div className="group flex items-start gap-4">
                  <div className="mt-1 w-1 h-8 bg-slate-200 dark:bg-white/10 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                  <div>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Mobile</p>
                     <p className="text-slate-900 dark:text-white font-bold text-lg">{data.mobile || "Not Provided"}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Company Info */}
         <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-purple-500/30 transition-all">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                 <Building2 size={20} />
               </div>
               Company Details
            </h2>

            <div className="space-y-8">
               <div className="group flex items-start gap-4">
                  <div className="mt-1 w-1 h-8 bg-slate-200 dark:bg-white/10 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                  <div>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Organization</p>
                     <p className="text-slate-900 dark:text-white font-bold text-lg">{data.orgName}</p>
                  </div>
               </div>
               <div className="group flex items-start gap-4">
                  <div className="mt-1 w-1 h-8 bg-slate-200 dark:bg-white/10 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                  <div>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Website</p>
                     <a href={data.companyWebsite} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline block truncate max-w-[200px] flex items-center gap-1">
                        {data.companyWebsite || "Not Provided"} <Globe size={14} />
                     </a>
                  </div>
               </div>
               <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-600 dark:text-slate-400 text-sm leading-relaxed border border-slate-200 dark:border-white/5 shadow-inner">
                  <p className="font-bold text-slate-900 dark:text-white mb-2 uppercase text-xs tracking-wider">About Company</p>
                  <p>{data.companyDescription || "No description provided."}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="mt-12 text-center">
         <p className="text-slate-400 dark:text-slate-600 text-sm font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} Recruiter Profile ·  OneStop</p>
      </div>

    </motion.div>
  );
}
