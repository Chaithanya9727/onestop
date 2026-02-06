import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle, Users, Mail, Loader, Award, Briefcase, Globe, Info } from "lucide-react";
import { useToast } from "../components/ToastProvider";

export default function AdminMentorPanel() {
  const { role } = useAuth();
  const { get, put } = useApi();
  const { showToast } = useToast();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const data = await get("/users/mentors/pending");
      setMentors(data);
    } catch (err) {
      console.error("Error fetching mentors:", err);
      showToast("Failed to fetch mentors", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const endpoint = action === 'approve' ? `/users/mentors/${id}/approve` : `/users/mentors/${id}/reject`;
      await put(endpoint);
      showToast(`Mentor ${action}d successfully`, "success");
      loadMentors();
    } catch (err) {
      showToast(`Error ${action}ing mentor`, "error");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#030712]"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-6 md:p-10 pb-20 pt-24 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20"><Users size={28} /></span>
              Mentor Approvals
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 ml-1 text-lg">Review and manage incoming mentorship applications.</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Info size={18} /> {mentors.length} Pending Request{mentors.length !== 1 && 's'}
            </div>
          </div>
        </motion.div>

        {mentors.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[#0f1014] rounded-[2.5rem] border border-dashed border-slate-300 dark:border-white/10">
            <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
              <Award size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No pending mentor requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence>
              {mentors.map((mentor) => (
                <motion.div
                  key={mentor._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-[#0f1014] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CheckCircle size={100} className="text-indigo-500" />
                  </div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-white font-black text-3xl shrink-0 overflow-hidden border border-indigo-100 dark:border-indigo-500/20 shadow-lg">
                        {mentor.avatar ? (
                          <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                        ) : mentor.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate mb-1">{mentor.name}</h3>
                        <div className="flex flex-col gap-1">
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-1.5 truncate"><Mail size={14} className="text-indigo-500" /> {mentor.email}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-1.5 truncate"><Globe size={14} className="text-purple-500" /> {mentor.mentorProfile?.linkedin || "No LinkedIn Provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-6 border border-slate-100 dark:border-white/5">
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1 block">Company</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Briefcase size={16} className="text-indigo-500" /> {mentor.mentorProfile?.company || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1 block">Experience</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{mentor.mentorProfile?.experience || 0} years</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1 block">Expertise</span>
                        <span className="text-md font-medium text-slate-900 dark:text-white bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 inline-block">{mentor.mentorProfile?.expertise || "—"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1 block">Bio / Motivation</span>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic border-l-2 border-indigo-500 pl-3">
                          "{mentor.mentorProfile?.bio || mentor.mentorProfile?.motivation || "No additional info provided."}"
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleAction(mentor._id, 'approve')} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02]">
                        <CheckCircle size={20} /> Approve Application
                      </button>
                      <button onClick={() => handleAction(mentor._id, 'reject')} className="py-4 bg-white dark:bg-white/5 text-red-600 dark:text-red-400 border border-slate-200 dark:border-white/10 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2 hover:border-red-200">
                        <XCircle size={20} /> Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
