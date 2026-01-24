import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, CheckCircle, Mail, Lock, User, Phone, Building, 
  Github, Loader, Star, Rocket, Shield, Users 
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  const [form, setForm] = useState({
    name: "", orgName: "", email: "", phone: "",
    password: "", confirmPassword: "", otp: "", agree: false,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const set = (name, val) => setForm(f => ({ ...f, [name]: val }));

  /* Actions */
  const sendOtp = async () => {
    if (!form.email) return showToast("Enter email address", "warning");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-verification-otp", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpSent(true);
      showToast("OTP sent successfully", "success");
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!form.otp) return showToast("Enter OTP", "warning");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-verification-otp", {
         method: "POST", headers: {"Content-Type":"application/json"},
         body: JSON.stringify({ email: form.email, otp: form.otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEmailVerified(true);
      setStep(3);
      showToast("Email verified!", "success");
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const registerUser = async () => {
     if (!form.agree) return showToast("Please accept terms", "warning");
     if (form.password !== form.confirmPassword) return showToast("Passwords don't match", "error");
     
     setLoading(true);
     try {
        const endpoint = role === "recruiter" ? "register-recruiter" : "register-candidate";
        const payload = { 
           name: form.name, email: form.email, password: form.password, mobile: form.phone,
           ...(role === "recruiter" && { orgName: form.orgName })
        };

        const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
           method: "POST", headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setStep(4);
        showToast("Account created! Redirecting...", "success");
        setTimeout(() => navigate("/login"), 1500);
     } catch (err) { showToast(err.message, "error"); }
     finally { setLoading(false); }
  };

  /* Step Renderers */
  const steps = [
     {
        id: 1,
        content: (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                <p className="text-slate-500 dark:text-slate-400">How would you like to join?</p>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                   { id: 'candidate', label: 'Candidate', icon: User, desc: 'Explore jobs, mentorship & contests' },
                   { id: 'recruiter', label: 'Recruiter', icon: Building, desc: 'Post jobs & hire top talent' }
                ].map(opt => (
                   <button 
                     key={opt.id}
                     onClick={() => { setRole(opt.id); setStep(2); }}
                     className={`group p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden
                        ${role === opt.id ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'}
                     `}
                   >
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${role === opt.id ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 group-hover:bg-blue-500 group-hover:text-white'}`}>
                        <opt.icon size={24} />
                     </div>
                     <p className={`font-bold text-lg mb-1 ${role === opt.id ? 'text-blue-700 dark:text-white' : 'text-slate-900 dark:text-white'}`}>{opt.label}</p>
                     <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{opt.desc}</p>
                   </button>
                ))}
             </div>
             
             <div className="text-center text-sm text-slate-500 dark:text-slate-500 mt-8">
                Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium hover:underline">Login here</Link>
             </div>
          </motion.div>
        )
     },
     {
        id: 2,
        content: (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ArrowLeft size={20} /></button>
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Email</h2>
                   <p className="text-sm text-slate-500 dark:text-slate-400">We need to verify it's you.</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                   <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input 
                         type="email" name="email" value={form.email} onChange={handleChange}
                         className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all shadow-sm"
                         placeholder="you@example.com"
                         disabled={otpSent}
                      />
                   </div>
                </div>

                {otpSent && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Verification Code</label>
                      <input 
                         type="text" name="otp" value={form.otp} onChange={handleChange}
                         className="w-full px-4 py-3.5 text-center tracking-[0.5em] font-mono text-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all shadow-sm"
                         placeholder="••••••"
                      />
                   </motion.div>
                )}

                <button 
                   onClick={otpSent ? verifyOtp : sendOtp}
                   disabled={loading}
                   className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 mt-4"
                >
                   {loading ? <Loader className="animate-spin" size={18} /> : otpSent ? "Verify Code" : "Send Verification Code"}
                </button>
             </div>
          </motion.div>
        )
     },
     {
        id: 3,
        content: (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
               <div className="flex items-center gap-4 mb-2">
                   <button onClick={() => setStep(2)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ArrowLeft size={20} /></button>
                   <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Details</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Tell us a bit about yourself.</p>
                   </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} className="w-full px-4 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                      <input type="tel" name="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  {role === 'recruiter' && (
                     <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Organization Name</label>
                        <input type="text" name="orgName" placeholder="Acme Inc." value={form.orgName} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all shadow-sm" />
                     </div>
                  )}
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                      <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm</label>
                      <input type="password" name="confirmPassword" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
               </div>

               <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <input type="checkbox" checked={form.agree} onChange={(e) => set('agree', e.target.checked)} className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-offset-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">I agree to the <span className="text-blue-600 dark:text-blue-400">Terms</span> & <span className="text-blue-600 dark:text-blue-400">Privacy Policy</span></span>
               </label>

               <button 
                  onClick={registerUser}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
               >
                  {loading ? <Loader className="animate-spin" size={20} /> : "Complete Registration"}
               </button>
           </motion.div>
        )
     },
     {
        id: 4,
        content: (
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
               <motion.div 
                 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}
                 className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto"
               >
                  <CheckCircle size={48} />
               </motion.div>
               <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">You're In! 🎉</h2>
                  <p className="text-slate-500 dark:text-slate-400">Your account has been created successfully.<br/>Taking you to the dashboard...</p>
               </div>
           </motion.div>
        )
     }
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
       {/* Left Side */}
       <div className="relative hidden lg:flex flex-col justify-between p-12 bg-white dark:bg-[#0f1014] overflow-hidden border-r border-slate-200 dark:border-white/5">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">O</span>
            </div>
            <span className="text-slate-900 dark:text-white">OneStop</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-5xl font-bold leading-tight mb-4 text-slate-900 dark:text-white">
                Join the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                  Innovation Hub
                </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                 Connect with mentors, find your dream job, and compete with the best.
              </p>
           </motion.div>

           <div className="space-y-4">
              {[
                 { icon: Rocket, title: "Accelerate Growth", desc: "Access premium mentorship and resources" },
                 { icon: Users, title: "Vibrant Community", desc: "Join 50k+ developers and recruiters" },
                 { icon: Shield, title: "Verified Opportunities", desc: "100% legitimate jobs and hackathons" }
              ].map((item, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5"
                 >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                       <item.icon size={20} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                       <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500 dark:text-slate-500">
           © 2024 OneStop Agency. Join us today.
        </div>
       </div>

       {/* Right Side */}
       <div className="flex items-center justify-center p-6 sm:p-12 relative">
          <div className="w-full max-w-md relative z-10">
              <div className="mb-8">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-400 dark:text-slate-400">Step {step} of 3</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{Math.round((step / 3) * 100)}%</span>
                 </div>
                 <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                       className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                       initial={{ width: 0 }}
                       animate={{ width: `${(step / 3) * 100}%` }}
                       transition={{ duration: 0.5 }}
                    />
                 </div>
              </div>

              <AnimatePresence mode="wait">
                 {steps.find(s => s.id === step)?.content}
              </AnimatePresence>
          </div>
       </div>
    </div>
  );
}
