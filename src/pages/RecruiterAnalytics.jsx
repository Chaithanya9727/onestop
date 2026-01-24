import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { 
  BarChart2, TrendingUp, Users, Briefcase, CheckCircle, PieChart, Activity
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler
} from "chart.js";

// Register ChartJS
ChartJS.register(
  LineElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title, Filler
);

export default function RecruiterAnalytics() {
  const { get } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await get("/recruiter/analytics");
      setData(res);
    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-screen"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!data) return null;

  const { totalJobs, totalApplications, hiredCount, counts, trends } = data;

  // --- CHART CONFIG ---
  const lineData = {
    labels: trends.map((t) => new Date(t.date).toLocaleDateString(undefined, {weekday:'short', day:'numeric'})),
    datasets: [{
      label: "Applications",
      data: trends.map((t) => t.applications),
      borderColor: "#4F46E5", // indigo-600
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(79, 70, 229, 0.3)");
        gradient.addColorStop(1, "rgba(79, 70, 229, 0)");
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#4F46E5",
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, weight: '600' }, color: '#64748b' } },
      y: { border: { dash: [4, 4], display: false }, grid: { color: "#f1f5f9" }, ticks: { stepSize: 1, color: '#64748b' } },
    }
  };

  const doughnutData = {
    labels: ["Shortlisted", "Rejected", "Hired", "Pending"],
    datasets: [{
      data: [counts.shortlisted, counts.rejected, counts.hired, counts.applied],
      backgroundColor: ["#3b82f6", "#ef4444", "#10b981", "#cbd5e1"],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { weight: 'bold' } } }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Activity size={28} /></span>
          Analytics Hub
        </h1>
        <p className="text-slate-500 font-medium mt-2 ml-1">
          Real-time insights into your hiring pipeline and job performance.
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
           <div className="relative z-10">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Jobs Posted</p>
              <h3 className="text-4xl font-black text-slate-800">{totalJobs}</h3>
              <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1"><Briefcase size={12} /> Active Listings</p>
           </div>
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl relative z-10"><Briefcase size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
           <div className="relative z-10">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Applicants</p>
              <h3 className="text-4xl font-black text-slate-800">{totalApplications}</h3>
              <p className="text-xs text-indigo-600 font-bold mt-2 flex items-center gap-1"><Users size={12} /> Across all jobs</p>
           </div>
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl relative z-10"><Users size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
           <div className="relative z-10">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Candidates Hired</p>
              <h3 className="text-4xl font-black text-slate-800">{hiredCount}</h3>
              <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"><CheckCircle size={12} /> Filled Positions</p>
           </div>
           <div className="p-3 bg-green-50 text-green-600 rounded-xl relative z-10"><CheckCircle size={24} /></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart (Line) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={24} className="text-indigo-600" />
                Application Growth
              </h3>
              <p className="text-sm text-slate-500 font-medium">Activity over last 7 days</p>
            </div>
            <div className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold uppercase">Weekly</div>
          </div>
          <div className="h-[350px] w-full">
             <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Status Breakdown (Doughnut) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <PieChart size={24} className="text-blue-600" />
            Pipeline Status
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-8">Current candidate distribution</p>
          
          <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
               <div className="text-center">
                 <p className="text-4xl font-black text-slate-800">{totalApplications}</p>
                 <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mt-1">Total</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
