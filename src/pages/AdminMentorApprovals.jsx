import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle, GraduationCap, Loader, Mail } from "lucide-react";

export default function AdminMentorApprovals() {
  const { role } = useAuth();
  const { get, put } = useApi();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await get("/mentor/requests");
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch mentor requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionType) => {
    try {
      setActionLoading(id);
      await put(`/mentor/${actionType}/${id}`);
      showToast(`Mentor ${actionType}d successfully`, "success");
      loadRequests();
    } catch (err) {
      console.error(err);
      showToast(`Failed to ${actionType} mentor`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  if (role !== "admin" && role !== "superadmin") {
     return <div className="text-center py-20 text-red-500 font-bold">Access Denied</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 pb-20"
    >
      <div className="mb-8">
         <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="p-2.5 bg-violet-50 text-violet-600 rounded-xl"><GraduationCap size={28} /></span>
            Mentor Approvals
         </h1>
         <p className="text-slate-500 font-medium mt-2 ml-1">Review applications from aspiring mentors.</p>
      </div>

      {requests.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-bold text-lg">No pending mentor applications.</p>
         </div>
      ) : (
         <div className="space-y-4">
            {requests.map((req) => (
               <div key={req._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                     <div className="flex items-center justify-between mb-4">
                        <div>
                           <h3 className="text-xl font-bold text-slate-800">{req.name || "Unnamed User"}</h3>
                           <p className="text-slate-500 text-sm font-medium flex items-center gap-1"><Mail size={14} /> {req.email}</p>
                        </div>
                        <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-100">
                           Pending Review
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-4">
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expertise</p>
                           <p className="font-semibold text-slate-700">{req.mentorProfile?.expertise || "—"}</p>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                           <p className="font-semibold text-slate-700">{req.mentorProfile?.experience || "0"} years</p>
                        </div>
                        <div className="md:col-span-2">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</p>
                           <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{req.mentorProfile?.bio || "No bio provided"}"</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-center gap-3 shrink-0">
                     <button 
                        onClick={() => handleAction(req._id, "approve")}
                        disabled={actionLoading === req._id}
                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                     >
                        {actionLoading === req._id ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />} Approve
                     </button>
                     <button 
                        onClick={() => handleAction(req._id, "reject")}
                        disabled={actionLoading === req._id}
                        className="px-6 py-3 bg-white text-red-600 border-2 border-red-50 font-bold rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
                     >
                        {actionLoading === req._id ? <Loader className="animate-spin" size={18} /> : <XCircle size={18} />} Reject
                     </button>
                  </div>
               </div>
            ))}
         </div>
      )}
    </motion.div>
  );
}
