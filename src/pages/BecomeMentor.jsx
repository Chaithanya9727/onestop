import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Users, DollarSign, Globe, ArrowRight, Sparkles } from "lucide-react";

export default function BecomeMentor() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-100 dark:bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold text-xs uppercase tracking-widest mb-8"
            >
               <Sparkles size={14} /> Join the Elite OneStop Community
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-slate-900 dark:text-white">
              Inspire the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Next Generation.</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg font-medium">
              Share your expertise, build your personal brand, and earn by guiding students through 1:1 sessions, mock interviews, and resume reviews.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/apply-for-mentor" className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-indigo-950 font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-indigo-50 transition-all flex items-center gap-2 text-lg shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-105 active:scale-95">
                Apply Now <ArrowRight size={20}/>
              </Link>
              <Link to="/mentors" className="px-8 py-4 bg-white dark:bg-white/5 text-slate-700 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                View Mentors
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="relative hidden md:block">
             <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-[2.5rem] opacity-20 blur-2xl animate-pulse"></div>
             <img 
               src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=2069&auto=format&fit=crop" 
               alt="Mentorship" 
               className="rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-slate-800 relative z-10 w-full object-cover transform rotate-2 hover:rotate-0 transition-transform duration-700 h-[600px]"
             />
             
             {/* Floating Stats */}
             <div className="absolute -left-8 top-20 bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 z-20 flex gap-4 items-center max-w-xs animate-bounce-slow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-500 font-bold text-xl">$</div>
                <div>
                   <div className="font-black text-slate-900 dark:text-white">Earn Extra Income</div>
                   <div className="text-xs text-slate-500 dark:text-slate-400">Set your own rates & schedule</div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
         <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Why Become a Mentor?</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Join thousands of industry experts making a difference while boosting their careers.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-8">
            {[
               { icon: <Users size={32}/>, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/20", title: "Build Your Legacy", desc: "Impact careers and build a strong personal brand in the developer community." },
               { icon: <DollarSign size={32}/>, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/20", title: "Earn on Your Terms", desc: "Set your own prices and schedule. Monetize your free time effectively." },
               { icon: <Globe size={32}/>, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/20", title: "Global Reach", desc: "Connect with talent from top universities across the globe." }
            ].map((item, i) => (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-slate-50 dark:bg-[#0f1014] p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-xl dark:shadow-none transition-all group hover:-translate-y-2"
               >
                  <div className={`w-20 h-20 rounded-[1.5rem] ${item.bg} flex items-center justify-center mb-8 ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
                     {item.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
               </motion.div>
            ))}
         </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 text-center py-20">
         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-indigo-600/30 relative overflow-hidden border border-white/10 text-white">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
            <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to Start?</h2>
                <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium">Join the waitlist or apply directly if you have 2+ years of experience in your field.</p>
                <Link to="/apply-for-mentor" className="inline-block px-12 py-5 bg-white text-indigo-900 font-extrabold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95 text-lg">
                   Start Application
                </Link>
            </div>
         </div>
      </div>

    </div>
  );
}
