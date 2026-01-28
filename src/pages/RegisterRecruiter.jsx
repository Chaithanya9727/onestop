import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, User, Mail, Lock, Phone, ArrowRight, CheckCircle2,
  Loader2, BadgeCheck, Globe, Briefcase, Linkedin, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundGlow from "../components/BackgroundGlow";
import useApi from "../hooks/useApi"; // Use standard hook

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
    fullName: "",
    orgName: "",
    companyWebsite: "",
    designation: "", // HR, Talent Lead etc
    linkedin: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
    // Aadhaar verification
    aadhaarFile: null,
    aadhaarLast4: "",
    aadhaarPreview: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const handleAadhaarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image (JPG, PNG) or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          aadhaarFile: file,
          aadhaarPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        aadhaarFile: file,
        aadhaarPreview: ""
      }));
    }
    setError("");
  };

  /* ===========================
     STEP 1: EMAIL VERIFICATION
     =========================== */
  const sendOtp = async () => {
    if (!formData.email) return setError("Please enter an official work email.");
    if (formData.email.includes("@gmail") || formData.email.includes("@yahoo")) {
      // Just a warning, not a block (some startups use gmail)
      setError("⚠️ We recommend using your official work email for faster approval.");
    }

    setLoading(true);
    try {
      await post("/auth/send-verification-otp", { email: formData.email });
      setSuccessMsg("OTP sent to your email!");
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
      setFormData(prev => ({ ...prev, isEmailVerified: true }));
      setSuccessMsg("Email verified successfully! Please complete your profile.");
      setTimeout(() => {
        setStep(1);
        setSuccessMsg("");
        setError("");
      }, 1000);
    } catch (err) {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     STEP 2: FINAL REGISTRATION
     =========================== */
  const registerRecruiter = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    if (!formData.agree) return setError("Please accept the terms.");

    setLoading(true);
    try {
      let aadhaarDocumentUrl = "";

      // Upload Aadhaar document to Cloudinary if provided
      if (formData.aadhaarFile) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", formData.aadhaarFile);
        cloudinaryFormData.append("upload_preset", "onestop_aadhaar"); // You'll need to create this preset
        cloudinaryFormData.append("folder", "aadhaar_documents");

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'}/image/upload`,
          {
            method: "POST",
            body: cloudinaryFormData,
          }
        );

        if (cloudinaryResponse.ok) {
          const cloudinaryData = await cloudinaryResponse.json();
          aadhaarDocumentUrl = cloudinaryData.secure_url;
        } else {
          throw new Error("Failed to upload Aadhaar document");
        }
      }

      // Register recruiter with all data
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
      });

      setSuccessMsg("🎉 Registration Successful! Awaiting admin approval...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafe] dark:bg-[#050505] p-6 relative overflow-hidden transition-colors duration-500 text-slate-900 dark:text-white font-sans">
      <BackgroundGlow />

      {/* Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white dark:bg-[#0f1014] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-white/5 relative z-10"
      >

        {/* Left Side: Branding / Info */}
        <div className="w-full md:w-5/12 bg-indigo-600 p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90 z-0"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-10">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg">
                <BadgeCheck size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight">OneStop Recruiter</span>
            </Link>

            <h2 className="text-4xl font-extrabold mb-6 leading-tight">Hire the top 1% talent efficiently.</h2>
            <ul className="space-y-4 text-indigo-100 font-medium">
              <li className="flex items-start gap-3"><CheckCircle2 className="shrink-0 text-green-300" /> Post Jobs & Internships for free</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="shrink-0 text-green-300" /> Host Hackathons & Challenges</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="shrink-0 text-green-300" /> Access Verified Candidate Profiles</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="shrink-0 text-green-300" /> AI-Powered Resume Screening</li>
            </ul>
          </div>

          <div className="relative z-10 mt-10">
            <p className="text-sm text-indigo-200">Already have an account?</p>
            <Link to="/login" className="text-white font-bold underline hover:text-indigo-100 transition-colors">Log in to Dashboard</Link>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 relative bg-white dark:bg-[#0f1014]">

          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Create Recruiter Account</h3>
              <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden flex">
                <div className={`h-full bg-indigo-600 transition-all duration-500 ${step === 0 ? "w-1/2" : "w-full"}`}></div>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">Step {step + 1} of 2: {step === 0 ? "Verify Work Email" : "Organization Details"}</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
                <ShieldCheck size={18} /> {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-3">
                <CheckCircle2 size={18} /> {successMsg}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Official Work Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@company.com"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 ml-1">We recommend using your corporate email domain for faster verification.</p>
                    </div>

                    {/* OTP Input - Only show if OTP sent */}
                    {successMsg === "OTP sent to your email!" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase mt-4">Verification Code</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                          <input
                            name="otp"
                            type="text"
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder="Enter 6-digit OTP"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold transition-all tracking-widest text-lg"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="mt-8">
                      {successMsg !== "OTP sent to your email!" ? (
                        <button onClick={sendOtp} disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                          {loading ? <Loader2 className="animate-spin" /> : "Verify Email"} <ArrowRight size={18} />
                        </button>
                      ) : (
                        <button onClick={verifyOtp} disabled={loading} className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                          {loading ? <Loader2 className="animate-spin" /> : "Confirm OTP"} <CheckCircle2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <form onSubmit={registerRecruiter} className="space-y-4">

                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="John Doe" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="+91 98765..." />
                        </div>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Organization / Company Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input name="orgName" required value={formData.orgName} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="Acme Corp" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Website</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="acmecorp.com" />
                        </div>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Your Designation</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input name="designation" required value={formData.designation} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="HR Manager" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">LinkedIn Profile</label>
                        <div className="relative">
                          <Linkedin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="linkedin.com/in/..." />
                        </div>
                      </div>
                    </div>

                    {/* ⭐ Aadhaar Verification Section */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                      <div className="flex items-start gap-2 mb-3">
                        <ShieldCheck className="text-amber-600 dark:text-amber-400 mt-0.5" size={20} />
                        <div>
                          <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Identity Verification (Recommended)</h4>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Upload Aadhaar for faster approval & higher trust score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1 uppercase">Aadhaar Document</label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleAadhaarUpload}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-500/20 dark:file:text-indigo-300"
                          />
                          {formData.aadhaarFile && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-bold">✓ {formData.aadhaarFile.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1 uppercase">Last 4 Digits</label>
                          <input
                            name="aadhaarLast4"
                            type="text"
                            maxLength="4"
                            pattern="[0-9]{4}"
                            value={formData.aadhaarLast4}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white"
                            placeholder="1234"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Only last 4 digits stored</p>
                        </div>
                      </div>

                      {formData.aadhaarPreview && (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Preview:</p>
                          <img src={formData.aadhaarPreview} alt="Aadhaar preview" className="max-h-32 rounded-lg border border-slate-200 dark:border-white/10" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="Create robust password" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none font-bold text-sm dark:text-white" placeholder="Repeat password" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                      <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-xs text-slate-500 font-bold">I agree to the <a href="#" className="underline hover:text-indigo-600">Terms of Service</a> & <a href="#" className="underline hover:text-indigo-600">Privacy Policy</a></span>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"} <ArrowRight size={18} />
                    </button>

                    <div className="text-center">
                      <button onClick={() => setStep(0)} type="button" className="text-xs font-bold text-slate-400 hover:text-indigo-500 uppercase tracking-widest">Back to Verification</button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </motion.div >
    </div >
  );
}
