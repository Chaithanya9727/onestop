import { useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { GraduationCap, Loader } from "lucide-react"; 
import JobCard from "../components/JobCard"; 

const Internships = () => {
  const { get } = useApi();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const data = await get("/internships"); // Assuming endpoint exists or maps to jobs?
        // If internships endpoint doesn't exist, we might need to query jobs using type=internship
        // For now trusting the existing logic but using useApi
        setInternships(data || []);
      } catch (error) {
        console.error("Error fetching internships:", error);
        // Fallback or retry with jobs endpoint?
        try {
             const jobsData = await get("/jobs?type=Internship");
             setInternships(jobsData.data || jobsData || []);
        } catch(e) { console.error("Double fail", e)}
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, [get]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]"><Loader size={40} className="text-purple-600 animate-spin" /></div>;
 }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">
      
       {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-100 dark:bg-pink-600/10 rounded-full blur-[120px] transition-colors" />
       </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12 text-center max-w-2xl mx-auto">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-4"
           >
             <GraduationCap size={14} /> Student Opportunities
           </motion.div>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900 dark:text-white"
           >
             Launch Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">Career</span>
           </motion.h1>
           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-slate-600 dark:text-slate-400 text-lg"
           >
             Find the best internships and co-op programs to kickstart your journey.
           </motion.p>
        </div>

        {internships.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
               <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
               <GraduationCap size={40} className="text-slate-400 dark:text-slate-500" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No internships found</h3>
               <p className="text-slate-500 dark:text-slate-400">Check back later for new opportunities.</p>
            </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {internships.map((job) => (
               <JobCard key={job.id || job._id} job={job} />
             ))}
           </div>
        )}
      </main>
    </div>
  );
};

export default Internships;
