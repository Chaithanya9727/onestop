import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Users, DollarSign, Globe, ArrowRight, Sparkles, Star, Zap, Shield, TrendingUp } from "lucide-react";

export default function BecomeMentor() {
   return (
      <div className="min-h-screen bg-[#030712] text-white pb-20 font-sans selection:bg-indigo-500/30">

         {/* Background Ambient */}
         <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px]" />
         </div>

         {/* Hero Section */}
         <div className="relative pt-32 pb-24 px-6 overflow-hidden z-10">
            <div className="max-w-7xl mx-auto text-center relative z-10">
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 font-bold text-sm mb-8 backdrop-blur-md"
               >
                  <Sparkles size={14} className="text-indigo-400" />
                  <span className="uppercase tracking-widest">Join the Elite Mentorship Network</span>
               </motion.div>

               <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl md:text-8xl font-black mb-8 leading-[1]"
               >
                  Turn Your Experience <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Into Impact.</span>
               </motion.h1>

               <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
               >
                  Join a curated community of industry leaders. Monetize your spare time by guiding the next generation of tech talent through high-impact 1:1 sessions.
               </motion.p>

               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap justify-center gap-4"
               >
                  <Link to="/apply-for-mentor" className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2 text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95">
                     Apply to Mentor <ArrowRight size={20} />
                  </Link>
               </motion.div>
            </div>
         </div>

         {/* The "Bento" Grid Benefits */}
         <div className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">

               {/* Card 1: Earnings (Large) */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="md:col-span-2 bg-[#0f1014] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
               >
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <DollarSign size={200} />
                  </div>
                  <div className="relative z-10">
                     <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                        <TrendingUp size={28} />
                     </div>
                     <h3 className="text-3xl font-black mb-4">Significant Monthly Earnings</h3>
                     <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        Top mentors on OneStop earn over <span className="text-white font-bold">$2,000/month</span> working just a few hours a week. Set your own rates for calls, resume reviews, and mock interviews.
                     </p>
                  </div>
               </motion.div>

               {/* Card 2: Flexibility */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                  className="bg-[#0f1014] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
               >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                     <Zap size={28} />
                  </div>
                  <h3 className="text-2xl font-black mb-4">100% Flexible</h3>
                  <p className="text-slate-400 leading-relaxed">
                     Sync your calendar and take sessions only when you want. No minimum commitments.
                  </p>
               </motion.div>

               {/* Card 3: Personal Brand */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                  className="bg-[#0f1014] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-purple-500/30 transition-colors"
               >
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                     <Star size={28} />
                  </div>
                  <h3 className="text-2xl font-black mb-4">Build Your Brand</h3>
                  <p className="text-slate-400 leading-relaxed">
                     Gain recognition as an industry expert. Get reviews that boost your professional reputation.
                  </p>
               </motion.div>

               {/* Card 4: Global Reach (Large) */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                  className="md:col-span-2 bg-[#0f1014] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-amber-500/30 transition-colors"
               >
                  <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Globe size={300} />
                  </div>
                  <div className="relative z-10">
                     <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6">
                        <Users size={28} />
                     </div>
                     <h3 className="text-3xl font-black mb-4">Impact on a Global Scale</h3>
                     <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                        Connect with ambitious talent from Ivy League universities, top bootcamps, and emerging tech hubs around the world. Your advice can change career trajectories.
                     </p>
                  </div>
               </motion.div>

            </div>
         </div>

         {/* How it Works / Steps */}
         <div className="max-w-5xl mx-auto px-6 pb-32 relative z-10">
            <div className="text-center mb-20">
               <h2 className="text-4xl font-black mb-4">How It Works</h2>
               <p className="text-slate-400">Simple steps to start your mentorship journey.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

               {[
                  { title: "Apply", desc: "Share your professional background and expertise.", step: "01" },
                  { title: "Get Verified", desc: "Our team reviews your profile within 48 hours.", step: "02" },
                  { title: "Start Earning", desc: "Set your availability and start receiving bookings.", step: "03" }
               ].map((item, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                     className="relative text-center pt-8"
                  >
                     <div className="w-24 h-24 bg-[#0a0a0a] border-4 border-[#030712] rounded-full flex items-center justify-center text-2xl font-black text-white relative z-10 mx-auto mb-6 shadow-xl shadow-indigo-500/10">
                        {item.step}
                     </div>
                     <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                     <p className="text-slate-400 px-6">{item.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* CTA */}
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="bg-gradient-to-b from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-[3rem] p-12 md:p-24 backdrop-blur-xl relative overflow-hidden">

               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

               <div className="relative z-10">
                  <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">Ready to Inspire?</h2>
                  <p className="text-xl text-indigo-200 mb-12 max-w-2xl mx-auto">
                     Join OneStop Mentorship today and start shaping the future of tech while building your legacy.
                  </p>
                  <Link to="/apply-for-mentor" className="inline-block px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95 text-lg">
                     Join Waitlist Now
                  </Link>
               </div>
            </div>
         </div>

      </div>
   );
}
