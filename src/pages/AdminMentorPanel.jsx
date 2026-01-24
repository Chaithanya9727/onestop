import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle, Users, Mail, Loader, Award } from "lucide-react";
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

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
         <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={28} /></span>
            Mentor Panel
         </h1>
         <p className="text-slate-500 font-medium mt-2 ml-1">Manage incoming mentor requests and profiles.</p>
      </motion.div>

      {mentors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <Award size={48} className="text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold text-lg">No pending mentor requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <AnimatePresence>
             {mentors.map((mentor) => (
               <motion.div 
                 key={mentor._id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
               >
                  <div className="flex items-start gap-4 mb-6">
                     <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-2xl shrink-0 overflow-hidden">
                        {mentor.avatar ? (
                           <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                        ) : mentor.name?.charAt(0)}
                     </div>
                     <div className="overflow-hidden">
                        <h3 className="text-lg font-bold text-slate-800 truncate">{mentor.name}</h3>
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-1 truncate"><Mail size={12} /> {mentor.email}</p>
                     </div>
                  </div>

                  <div className="space-y-3 mb-6">
                     <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500 font-medium">Expertise</span>
                        <span className="font-bold text-slate-800">{mentor.mentorProfile?.expertise || "—"}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500 font-medium">Experience</span>
                        <span className="font-bold text-slate-800">{mentor.mentorProfile?.experience || 0} years</span>
                     </div>
                     <div className="text-sm p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500 font-medium block mb-1">Bio</span>
                        <p className="italic text-slate-600 leading-relaxed text-xs">"{mentor.mentorProfile?.bio || "No bio"}"</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => handleAction(mentor._id, 'approve')} className="py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-200">
                        <CheckCircle size={16} /> Approve
                     </button>
                     <button onClick={() => handleAction(mentor._id, 'reject')} className="py-2.5 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm">
                        <XCircle size={16} /> Reject
                     </button>
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
}
