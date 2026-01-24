import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { RefreshCw, Calendar, Loader } from "lucide-react";

const COLORS = ["#6366f1", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"];

export default function AdminEventMetrics() {
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await get("/events/admin/metrics");
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMetrics(); }, [reloadKey]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]"><Loader className="animate-spin text-blue-600" size={32} /></div>;
  if (!metrics) return <div className="text-center py-20 text-slate-400 font-bold bg-slate-50 dark:bg-[#0a0a0a] min-h-screen">Failed to load event metrics.</div>;

  const chartData = metrics.byCategory?.map((c) => ({ name: c._id || "Other", value: c.count })) || [];
  const barData = chartData.map((c) => ({ name: c.name, Events: c.value }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-6 md:p-10 pb-20 transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
               <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="p-2.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl border border-violet-100 dark:border-violet-500/20"><Calendar size={28} /></span>
                  Event Analytics
               </h1>
               <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 ml-1">Insights into platform events and engagement.</p>
            </div>
            <button onClick={() => setReloadKey(k => k + 1)} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
               <RefreshCw size={18} /> Refresh Data
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#0f1014] p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none md:col-span-1 flex flex-col justify-center items-center text-center">
               <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Events</p>
               <h2 className="text-5xl font-black text-slate-900 dark:text-white">{metrics.total || 0}</h2>
            </div>
            <div className="bg-white dark:bg-[#0f1014] p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none md:col-span-3">
               <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Category Breakdown</p>
               <div className="flex flex-wrap gap-3">
                  {metrics.byCategory?.map((c, i) => (
                     <div key={c._id} className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{c._id}</span>
                        <span className="px-2 py-0.5 bg-white dark:bg-black/20 rounded-md text-xs font-bold border border-slate-200 dark:border-white/10 shadow-sm text-slate-900 dark:text-white">{c.count}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white dark:bg-[#0f1014] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><div className="w-1.5 h-6 bg-blue-500 rounded-full"></div> Distribution</h3>
               <div className="flex-1 min-h-[350px] relative">
                  {chartData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={chartData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                              {chartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <ReTooltip 
                              contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)", backgroundColor: "rgba(255, 255, 255, 0.9)", color: "#1e293b" }} 
                              itemStyle={{ color: "#1e293b", fontWeight: "bold" }}
                           />
                           <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-slate-600 dark:text-slate-400 font-bold ml-1">{value}</span>} />
                        </PieChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600 font-bold">No Data</div>
                  )}
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                     <span className="text-5xl font-black text-slate-900 dark:text-white">{metrics.total}</span>
                     <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Events</span>
                  </div>
               </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white dark:bg-[#0f1014] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><div className="w-1.5 h-6 bg-pink-500 rounded-full"></div> Comparison</h3>
               <div className="flex-1 min-h-[350px]">
                  {barData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} className="dark:stroke-slate-800" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={15} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                           <ReTooltip 
                              cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} 
                              contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)", backgroundColor: "rgba(255, 255, 255, 0.9)", color: "#1e293b" }}
                              itemStyle={{ color: "#1e293b", fontWeight: "bold" }}
                           />
                           <Bar dataKey="Events" radius={[8, 8, 0, 0]}>
                              {barData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600 font-bold">No Data</div>
                  )}
               </div>
            </div>
         </div>
      </div>

    </motion.div>
  );
}
