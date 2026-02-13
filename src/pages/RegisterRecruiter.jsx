import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, User, Mail, Lock, Phone, ArrowRight, CheckCircle2,
  Loader2, BadgeCheck, Globe, Briefcase, Linkedin, ShieldCheck,
  Sparkles, ShieldAlert, AlertCircle, CreditCard, Target, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundGlow from "../components/BackgroundGlow";
import useApi from "../hooks/useApi";

export default function RegisterRecruiter() {
  const navigate = useNavigate();
  const { post } = useApi();

  // Stages: 0: Email Verification, 1: Details
  const [step, setStep] = useState(0);

  // State
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    isEmailVerified: false,
    isEmailOtpSent: false,
    fullName: "",
    orgName: "",
    companyWebsite: "",
    designation: "",
    linkedin: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
    // KYC
    pan: "",
    gst: "",
    aadhaarFile: null,
    aadhaarLast4: "",
    aadhaarPreview: "",
    aadhaarFullNumber: "",
    aadhaarOtp: "",
    aadhaarOtpSent: false,
    isAadhaarVerified: false,
    aiAudit: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [warning, setWarning] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
    setSuccessMsg("");
    setWarning("");

    if (name === "email" && value.includes("@")) {
      const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com', 'icloud.com', 'me.com', 'live.com'];
      const domain = value.split('@')[1]?.toLowerCase();
      if (domain && genericDomains.includes(domain)) {
        setWarning("⚠️ Note: Work emails are preferred for faster verification.");
      }
    }
  };

  const handleAadhaarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) return setError("File size must be less than 5MB");

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, aadhaarFile: file, aadhaarPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, aadhaarFile: file, aadhaarPreview: "" }));
    }
    setError("");
  };

  const sendAadhaarOtp = async () => {
    if (formData.aadhaarFullNumber.length !== 12) return setError("Enter valid 12-digit Aadhaar");
    setLoading(true);
    try {
      const res = await post("/auth/aadhaar/send-otp", { aadhaarNumber: formData.aadhaarFullNumber });
      setSuccessMsg(res.message);
      setFormData(prev => ({ ...prev, aadhaarOtpSent: true }));
    } catch (err) {
      setError(err.message || "Aadhaar service unreachable");
    } finally {
      setLoading(false);
    }
  };

  const verifyAadhaarOtp = async () => {
    if (!formData.aadhaarOtp) return setError("Enter OTP sent to mobile");
    setLoading(true);
    try {
      await post("/auth/aadhaar/verify-otp", {
        aadhaarNumber: formData.aadhaarFullNumber,
        otp: formData.aadhaarOtp
      });
      setFormData(prev => ({
        ...prev,
        isAadhaarVerified: true,
        aadhaarLast4: formData.aadhaarFullNumber.slice(-4)
      }));
      setSuccessMsg("Identity Verified Successfully ✅");
    } catch (err) {
      setError("Invalid Aadhaar OTP");
    } finally {
      setLoading(false);
    }
  };

  const runAiAudit = async () => {
    if (!formData.aadhaarFile) return setError("Please upload an Aadhaar image first");
    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", formData.aadhaarFile);
      const uploadRes = await post("/auth/upload-aadhaar", uploadData, true);

      const auditRes = await post("/ai/analyze-aadhaar", {
        imageUrl: uploadRes.url,
        userName: formData.fullName
      });

      setFormData(prev => ({ ...prev, aiAudit: auditRes }));
      setSuccessMsg("AI Audit Completed 🧠");
    } catch (err) {
      setError("AI Audit failed. Proceeding with manual review.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!formData.email) return setError("Please enter an official work email.");
    setLoading(true);
    try {
      await post("/auth/send-verification-otp", { email: formData.email });
      setSuccessMsg("OTP sent to your email!");
      setFormData(prev => ({ ...prev, isEmailOtpSent: true }));
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!formData.otp) return setError("Please enter the OTP.");
    setLoading(true);
    try {
      await post("/auth/verify-verification-otp", { email: formData.email, otp: formData.otp });
      setFormData(prev => ({ ...prev, isEmailVerified: true, isEmailOtpSent: false }));
      setSuccessMsg("Email verified! Let's build your recruiter profile.");
      setTimeout(() => {
        setStep(1);
        setSuccessMsg("");
        setError("");
      }, 1500);
    } catch (err) {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const registerRecruiter = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    if (!formData.agree) return setError("Please accept the terms.");

    setLoading(true);
    try {
      let aadhaarDocumentUrl = "";
      if (formData.aadhaarFile) {
        const uploadData = new FormData();
        uploadData.append("file", formData.aadhaarFile);
        const uploadRes = await post("/auth/upload-aadhaar", uploadData, true);
        aadhaarDocumentUrl = uploadRes.url;
      }

      await post("/auth/register-recruiter", {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        orgName: formData.orgName,
        mobile: formData.phone,
        designation: formData.designation,
        companyWebsite: formData.companyWebsite,
        linkedinProfile: formData.linkedin,
        aadhaarDocumentUrl,
        aadhaarLast4: formData.aadhaarLast4,
        aadhaarVerified: formData.isAadhaarVerified,
        pan: formData.pan,
        gst: formData.gst
      });

      setSuccessMsg("🎉 Registration Successful! Awaiting admin approval...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden pt-10 pb-20">
      <BackgroundGlow />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#0f1014] rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200 dark:border-white/5 min-h-[700px]"
        >
          {/* Left Side: Branding (Unstop Style) */}
          <div className="lg:w-[40%] bg-indigo-600 p-8 md:p-12 text-white relative flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-3xl translate-y-20 -translate-x-10"></div>

            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg group-hover:rotate-12 transition-transform">
                  <BadgeCheck size={24} />
                </div>
                <span className="text-2xl font-black tracking-tight">OneStop Recruiter</span>
              </Link>

              <h1 className="text-4xl md:text-5xl font-black mb-8 leading-[1.1]">
                Start Hiring <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
                  Better Talent
                </span> Today
              </h1>

              <div className="space-y-6 mb-12">
                {[
                  "Post Jobs & Internships for free",
                  "Host Hackathons & Hiring Challenges",
                  "Access 100k+ Verified Profiles",
                  "AI-Powered Automated Screening"
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-center gap-3"
                  >
                    <div className="bg-white/20 p-1 rounded-full shrink-0">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                    <p className="text-white/90 font-bold text-sm tracking-wide">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Already have an account?</div>
                <Link to="/login" className="text-sm font-black underline hover:text-indigo-100">Log in</Link>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-[60%] p-8 md:p-12 bg-white dark:bg-[#0f1014] relative">
            <div className="max-w-xl mx-auto">
              <div className="mb-10 text-center lg:text-left">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create Account</h3>
                <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 0 ? 'w-24 bg-indigo-600' : 'w-12 bg-green-500'}`}></div>
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 0 ? 'w-12 bg-slate-200 dark:bg-white/5' : 'w-24 bg-indigo-600'}`}></div>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Step {step + 1} of 2: {step === 0 ? "Work Verification" : "Profile Details"}</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
                  <AlertCircle size={18} /> {error}
                </motion.div>
              )}

              {successMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-3">
                  <CheckCircle2 size={18} /> {successMsg}
                </motion.div>
              )}

              {warning && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold flex items-center gap-3">
                  <AlertCircle size={18} /> {warning}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {step === 0 ? (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black font-sans uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1 mb-2 block">Official Work Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@company.com"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm dark:text-white"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-3 font-medium flex items-center gap-1.5"><ShieldCheck size={12} /> Work emails are prioritized for 24-hour approval.</p>
                    </div>

                    {formData.isEmailOtpSent && (
                      <motion.div initial={{ opacity: 0, h: 0 }} animate={{ opacity: 1, h: 'auto' }}>
                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1 mb-2 block">Verification Code</label>
                        <div className="relative group">
                          <Zap className="absolute left-4 top-4 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
                          <input
                            name="otp"
                            type="text"
                            required
                            maxLength="6"
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder="Enter 6-digit OTP"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-xl tracking-[0.5em] dark:text-white text-center"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="pt-4 flex justify-center">
                      {!formData.isEmailOtpSent ? (
                        <motion.button
                          type="button"
                          onClick={() => {
                            console.log("Send OTP clicked");
                            sendOtp();
                          }}
                          disabled={loading}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          style={{
                            backgroundSize: "200% auto",
                            backgroundImage: "linear-gradient(to right, #4338ca, #6366f1, #4f46e5, #4338ca)"
                          }}
                          className="w-full max-w-[280px] py-4 text-white font-black rounded-[20px] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer pointer-events-none"></div>
                          {loading ? <Loader2 className="animate-spin" /> : <>Get OTP <ArrowRight size={20} /></>}
                        </motion.button>
                      ) : (
                        <motion.button
                          type="button"
                          onClick={() => {
                            console.log("Verify OTP clicked");
                            verifyOtp();
                          }}
                          disabled={loading}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          style={{
                            backgroundSize: "200% auto",
                            backgroundImage: "linear-gradient(to right, #059669, #10b981, #34d399, #059669)"
                          }}
                          className="w-full max-w-[280px] py-4 text-white font-black rounded-[20px] shadow-2xl shadow-green-600/30 flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer pointer-events-none"></div>
                          {loading ? <Loader2 className="animate-spin" /> : <>Verify & Continue <CheckCircle2 size={20} /></>}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <form onSubmit={registerRecruiter} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="John Doe" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="+91 98765..." />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Company Name</label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input name="orgName" required value={formData.orgName} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="Acme Corp" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Your Designation</label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input name="designation" required value={formData.designation} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="HR Lead" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Website (Optional)</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="acmecorp.com" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">LinkedIn Profile</label>
                          <div className="relative">
                            <Linkedin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="linkedin.com/in/..." />
                          </div>
                        </div>
                      </div>

                      {/* verification section */}
                      <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-200 dark:border-white/10 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <ShieldCheck className="text-indigo-600" size={20} />
                          <h4 className="text-xs font-black uppercase tracking-widest">Enhanced Verification (Optional)</h4>
                          <span className="ml-auto px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-black rounded-lg uppercase tracking-tighter">Gold Trust</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">PAN Card</label>
                            <div className="relative group">
                              <CreditCard className="absolute left-3 top-3 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={16} />
                              <input name="pan" value={formData.pan} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-yellow-500/50 outline-none font-bold text-xs dark:text-white uppercase" placeholder="ABCDE1234F" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">GST No</label>
                            <div className="relative group">
                              <Globe className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                              <input name="gst" value={formData.gst} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500/50 outline-none font-bold text-xs dark:text-white uppercase" placeholder="22AAAA..." />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Aadhaar (Last 4) - Optional</label>
                            <div className="relative group">
                              <Target className="absolute left-3 top-3 text-slate-400 group-focus-within:text-green-500 transition-colors" size={16} />
                              <input name="aadhaarFullNumber" maxLength="12" value={formData.aadhaarFullNumber} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-green-500/50 outline-none font-bold text-xs dark:text-white" placeholder="Optional 12-digit No" />
                            </div>
                          </div>
                        </div>

                        {!formData.isAadhaarVerified && formData.aadhaarFullNumber.length === 12 && !formData.aadhaarOtpSent && (
                          <button type="button" onClick={sendAadhaarOtp} className="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase rounded-lg hover:bg-indigo-100 transition-colors tracking-widest">Verify Aadhaar Identity</button>
                        )}

                        {formData.aadhaarOtpSent && !formData.isAadhaarVerified && (
                          <div className="flex gap-2">
                            <input name="aadhaarOtp" maxLength="6" value={formData.aadhaarOtp} onChange={handleChange} className="w-24 px-3 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none font-black text-sm tracking-widest text-center" placeholder="123456" />
                            <button type="button" onClick={verifyAadhaarOtp} className="flex-1 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">Confirm UIDAI OTP</button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aadhaar Document (Optional)</label>
                            <input type="file" onChange={handleAadhaarUpload} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                          </div>
                          <div className="flex flex-col justify-end">
                            {formData.aadhaarPreview && !formData.aiAudit && (
                              <button type="button" onClick={runAiAudit} className="py-2.5 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Sparkles size={14} /> Run AI Liveness Audit</button>
                            )}
                            {formData.aiAudit && (
                              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20 flex items-center justify-between">
                                <span className="text-[10px] font-black text-purple-700 uppercase">AI Trust Score</span>
                                <span className="text-sm font-black text-purple-700">{formData.aiAudit.trustScore}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="••••••••" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="••••••••" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 py-2">
                        <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} className="w-5 h-5 rounded-[6px] border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                        <span className="text-xs text-slate-500 font-bold">I agree to the <a href="#" className="text-indigo-600 underline">Terms</a> & <a href="#" className="text-indigo-600 underline">Privacy Policy</a></span>
                      </div>

                      <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-black rounded-[24px] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg">
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <>Complete Registration <ArrowRight size={20} /></>}
                      </button>

                      <div className="text-center">
                        <button onClick={() => setStep(0)} type="button" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors">← Back to Verification</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
