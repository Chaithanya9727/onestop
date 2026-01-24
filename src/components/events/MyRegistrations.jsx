import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { ExternalLink, Trophy, RotateCw, Calendar, CheckCircle } from "lucide-react";

export default function MyRegistrations() {
  const { get } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get("/events/registrations/me");
      setRows(data.registrations || []);
      // showToast("✅ Loaded your registrations", "success");
    } catch (err) {
      console.error("MyRegistrations error:", err);
      showToast("❌ Failed to load your registrations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—");

  const renderStatus = (r) => {
    switch (r.submissionStatus) {
      case "submitted":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Submitted</span>;
      case "reviewed":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Reviewed</span>;
      case "not_submitted":
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">Pending</span>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
       <div className="max-w-6xl mx-auto px-6">
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 mb-2">My Registrations</h1>
                   <p className="text-slate-500 font-medium">Manage your event participations.</p>
                </div>
                <button onClick={load} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors">
                   <RotateCw size={20}/>
                </button>
             </div>

             {loading ? (
                <div className="text-center py-12 text-slate-400">Loading...</div>
             ) : rows.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50 text-2xl">🎟️</div>
                   <h3 className="text-lg font-bold text-slate-700">No registrations yet</h3>
                   <button onClick={() => navigate('/events')} className="mt-4 text-indigo-600 font-bold hover:underline">Browse Events</button>
                </div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Event</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Dates</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Status</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Registered</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody>
                         {rows.map((r) => (
                            <tr key={r.eventId} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                               <td className="p-4">
                                  <div className="font-bold text-slate-900">{r.title}</div>
                                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{r.category}</div>
                               </td>
                               <td className="p-4 text-sm font-medium text-slate-600">
                                  <div className="flex items-center gap-2"><Calendar size={14}/> {fmt(r.startDate)}</div>
                               </td>
                               <td className="p-4">
                                  {renderStatus(r)}
                               </td>
                               <td className="p-4 text-sm text-slate-500">
                                  {fmt(r.registeredAt)}
                               </td>
                               <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     <button onClick={() => navigate(`/events/${r.eventId}`)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors">
                                        View
                                     </button>
                                     {r.submissionStatus === "not_submitted" && (
                                        <button onClick={() => navigate(`/events/submit/${r.eventId}`)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1">
                                           <Trophy size={12}/> Submit
                                        </button>
                                     )}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>

       </div>
    </div>
  );
}
