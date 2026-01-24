import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { CheckCircle, XCircle, Briefcase, Mail, Phone, Loader } from "lucide-react";

export default function AdminRecruiterApprovals() {
  const { get, patch } = useApi();
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchRecruiters = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await get("/admin/recruiters");
      // Filter for only pending if the API returns mixed, generally approval page is for pending
      const allRecruiters = Array.isArray(list) ? list : list?.data || [];
      // If we want to show all but highlight pending, we can keep all. 
      // Existing code showed all but actions only for pending. Let's stick to that.
      setRecruiters(allRecruiters);
    } catch (err) {
      console.error(err);
      setError("Failed to load recruiter data.");
      setRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    setError("");
    try {
      await patch(`/admin/recruiters/${id}/${action}`);
      setRecruiters((prev) => prev.map(r => 
        r._id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
      ));
    } catch (err) {
      console.error(err);
      setError("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 pb-20"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <span className="p-2.5 bg-pink-50 text-pink-600 rounded-xl"><Briefcase size={28} /></span>
          Recruiter Approvals
        </h1>
        <p className="text-slate-500 font-medium mt-2 ml-1">Validate incoming recruiter registrations.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100">
           {error}
        </div>
      )}

      {recruiters.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <p className="text-slate-400 font-bold text-lg">No recruiter applications pending.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">Recruiter</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                 {recruiters.map((rec) => (
                   <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 font-bold text-slate-800">{rec.orgName || "—"}</td>
                     <td className="px-6 py-4 font-medium">{rec.name || "—"}</td>
                     <td className="px-6 py-4 text-slate-500">
                        <div className="flex flex-col gap-1">
                           <span className="flex items-center gap-1.5"><Mail size={12} /> {rec.email}</span>
                           <span className="flex items-center gap-1.5"><Phone size={12} /> {rec.mobile || "—"}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border
                          ${rec.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            rec.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'}`}
                        >
                           {rec.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           {rec.status === "pending" && (
                             <>
                               <button 
                                 onClick={() => handleAction(rec._id, "approve")}
                                 disabled={actionLoading === rec._id}
                                 className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center gap-2"
                               >
                                  {actionLoading === rec._id ? <Loader className="animate-spin" size={14} /> : <CheckCircle size={14} />} Approve
                               </button>
                               <button 
                                 onClick={() => handleAction(rec._id, "reject")}
                                 disabled={actionLoading === rec._id}
                                 className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-2"
                               >
                                  {actionLoading === rec._id ? <Loader className="animate-spin" size={14} /> : <XCircle size={14} />} Reject
                               </button>
                             </>
                           )}
                           {rec.status !== 'pending' && <span className="text-slate-400 font-medium text-xs">Completed</span>}
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </motion.div>
  );
}
