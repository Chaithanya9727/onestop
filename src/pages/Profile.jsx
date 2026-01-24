import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { UAParser } from "ua-parser-js";
import { 
  User, Mail, Shield, Camera, Trash2, Key, Smartphone, Upload, Clock, Monitor, 
  LayoutGrid, CheckCircle, AlertCircle, Loader, X, Edit, Zap, Github, Linkedin, 
  Globe, Menu, LogOut, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { user, setUser, role, refreshUser } = useAuth();
  const { get, put, post } = useApi();

  const [activeTab, setActiveTab] = useState("general");
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState(""); 
  const [socials, setSocials] = useState({ github: "", linkedin: "", website: "" });
  const [openToTeaming, setOpenToTeaming] = useState(false); 
  const [newRole, setNewRole] = useState("guest");
  
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(true);

  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passStatus, setPassStatus] = useState({ type: "", msg: "" });

  // Avatar State
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [viewAvatarOpen, setViewAvatarOpen] = useState(false);

  // Security History
  const [loginHistory, setLoginHistory] = useState([]);
  
  // Verify Logic
  const [openEmailVerify, setOpenEmailVerify] = useState(false);
  const [openPasswordVerify, setOpenPasswordVerify] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await get("/auth/me");
        setName(data.name || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        setSkills((data.skills || []).join(", ")); 
        setSocials({
            github: data.socials?.github || "",
            linkedin: data.socials?.linkedin || "",
            website: data.socials?.website || ""
        });
        setOpenToTeaming(data.openToTeaming || false);
        setNewRole(data.role || "guest");

        const act = await get("/useractivity/me/logins");
        setLoginHistory(act.loginHistory || []);
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [get]);

  const sendEmailVerification = async () => {
    setOtpStatus("");
    setOtpLoading(true);
    try {
      const res = await post("/auth/send-verification-otp", { email });
      setOtpStatus(res.message);
      setOpenEmailVerify(true);
    } catch {
      setOtpStatus("Failed to send verification OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    try {
      const res = await post("/auth/verify-verification-otp", { email, otp });
      if (res.success) {
        setOtpStatus("✅ Email verified successfully!");
        setOpenEmailVerify(false);
        handleProfileSave(true);
      } else {
        setOtpStatus("Invalid or expired OTP.");
      }
    } catch {
      setOtpStatus("Verification failed.");
    }
  };

  const handleProfileSave = async (skipVerify = false) => {
    setStatus({ type: "", msg: "" });
    try {
      if (!skipVerify && user && email !== user.email) {
        await sendEmailVerification();
        return;
      }
      const sk = skills.split(",").map(s => s.trim()).filter(Boolean); 
      const body = { 
          name, 
          email, 
          bio,
          skills: sk, 
          socials, // Expecting backend to handle this object structure
          openToTeaming 
      };
      
      if (role === "admin" && newRole) body.role = newRole;

      const updated = await put("/users/me", body);
      setUser(updated);
      setStatus({ type: "success", msg: "Profile updated successfully!" });
      await refreshUser();
      
      // Auto-hide success message
      setTimeout(() => setStatus({ type: "", msg: "" }), 3000);
    } catch {
      setStatus({ type: "error", msg: "Update failed. Please try again." });
    }
  };

  const handlePasswordVerification = async () => {
    setOtpLoading(true);
    setPassStatus({ type: "", msg: "" });
    try {
      const res = await put("/users/me/password", { oldPassword, newPassword });
      setPassStatus({ type: "success", msg: res.message || "Password updated!" });
      setOpenPasswordVerify(false);
      setOldPassword("");
      setNewPassword("");
    } catch {
      setPassStatus({ type: "error", msg: "Password update failed. Check old password." });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setStatus({ type: "", msg: "" });

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);
      const updated = await put("/users/me/avatar", formData, {
         headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(updated);
      await refreshUser();
      setStatus({ type: "success", msg: "Avatar updated!" });
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch {
      setStatus({ type: "error", msg: "Avatar upload failed" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
        if(!window.confirm("Are you sure you want to remove your profile picture?")) return;
        await put("/users/me/avatar", { remove: true });
        setUser({ ...user, avatar: "" });
        setStatus({ type: "success", msg: "Avatar removed!" });
    } catch {
        setStatus({ type: "error", msg: "Removal failed" });
    }
  };

  const formatUserAgent = (uaString) => {
    if (!uaString) return "Unknown device";
    const parser = new UAParser(uaString);
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";
    return `${browser} on ${os}`;
  };

  const SidebarItem = ({ id, label, icon: Icon }) => (
     <button 
        onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === id 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
        }`}
     >
        <Icon size={18} />
        {label}
        {activeTab === id && <ChevronRight size={16} className="ml-auto opacity-50"/>}
     </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px] transition-colors" />
       </div>

       <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10 h-full">
          
          {/* Top Bar for Mobile */}
          <div className="md:hidden flex items-center justify-between mb-8">
             <h1 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h1>
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-white dark:bg-white/10 rounded-lg border border-slate-200 dark:border-white/10">
                <Menu size={20} />
             </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 min-h-[80vh]">
             
             {/* Sidebar */}
             <div className={`
                fixed md:static inset-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl md:backdrop-blur-none md:bg-transparent p-6 md:p-0 md:w-64 flex flex-col gap-2 transition-transform duration-300 md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
             `}>
                <div className="mb-8 hidden md:block">
                   <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage your account</p>
                </div>
                
                <div className="space-y-1">
                   <p className="px-4 py-2 text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Account</p>
                   <SidebarItem id="general" label="Public Profile" icon={User} />
                   <SidebarItem id="socials" label="Social Links" icon={Globe} />
                </div>

                <div className="mt-4 space-y-1">
                   <p className="px-4 py-2 text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Security</p>
                   <SidebarItem id="security" label="Login & Security" icon={Shield} />
                </div>
                
                <div className="mt-auto md:hidden">
                    <button onClick={() => setSidebarOpen(false)} className="w-full py-3 bg-slate-100 dark:bg-white/10 rounded-xl font-bold">Close Menu</button>
                </div>
             </div>
             
             {/* Content Area */}
             <div className="flex-1 max-w-4xl">
                
                {/* Status Toasts */}
                <AnimatePresence>
                   {status.msg && (
                      <motion.div initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl font-bold border flex items-center gap-3 shadow-2xl ${status.type === 'error' ? 'bg-red-500 text-white border-red-400' : 'bg-green-500 text-white border-green-400'}`}>
                         {status.type === 'error' ? <AlertCircle size={20} className="text-white/80" /> : <CheckCircle size={20} className="text-white/80" />}
                         {status.msg}
                      </motion.div>
                   )}
                </AnimatePresence>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : (
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <>
                         {/* Avatar Card */}
                                <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none mb-8">
                                    {/* Banner */}
                                    <div className="h-44 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                        
                                        {/* Avatar (Absolute Positioned) */}
                                        <div className="absolute -bottom-16 left-1/2 md:left-10 transform -translate-x-1/2 md:translate-x-0 cursor-pointer group z-10" onClick={() => setViewAvatarOpen(true)}>
                                             <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-[6px] border-white dark:border-[#0f1014] shadow-2xl bg-white relative">
                                                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${name}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                                   <Camera className="text-white drop-shadow-md" size={32} />
                                                </div>
                                             </div>
                                        </div>
                                    </div>

                                    {/* Content (Pushed down) */}
                                    <div className="pt-20 px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                                        
                                        {/* Text Info */}
                                        <div className="flex-1 md:pl-40">
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{name}</h2>
                                            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                                               {role === 'candidate' ? <User size={12}/> : <Shield size={12}/>}
                                               {role === 'candidate' ? 'Job Seeker' : 'Administrator'}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer hover:scale-105 transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-wide flex items-center gap-2">
                                                <Upload size={16} /> Update Photo
                                                <input type="file" hidden accept="image/*" onChange={handleAvatarSelect} />
                                            </label>
                                            {user?.avatar && (
                                                <button onClick={handleRemoveAvatar} className="px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-xs uppercase tracking-wide">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload Preview (Conditional) */}
                                    {avatarPreview && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-8 pb-8 md:pl-48">
                                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-blue-500/30 flex items-center gap-4 max-w-lg mx-auto md:mx-0">
                                                <img src={avatarPreview} className="w-12 h-12 rounded-xl object-cover" />
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">New photo selected</p>
                                                    <p className="text-xs text-slate-500">Save required</p>
                                                </div>
                                                <button onClick={handleAvatarUpload} disabled={avatarUploading} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">
                                                    {avatarUploading ? <Loader className="animate-spin" size={14}/> : 'Save'}
                                                </button>
                                                <button onClick={() => { setAvatarPreview(null); setAvatarFile(null); }} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Personal Info Form */}
                                <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400"><User size={20}/></div>
                                            Basic Information
                                        </h3>
                                        <button onClick={() => handleProfileSave(false)} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 text-sm">
                                            Save Changes
                                        </button>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Full Name</label>
                                            <input 
                                                type="text" value={name} onChange={e => setName(e.target.value)}
                                                className="w-full p-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl font-bold focus:border-blue-500 outline-none transition-colors text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Email Address</label>
                                            <input 
                                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                                className="w-full p-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl font-bold focus:border-blue-500 outline-none transition-colors text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Bio / Headline</label>
                                            <textarea 
                                                value={bio} onChange={e => setBio(e.target.value)}
                                                placeholder="Software Engineer | Tech Enthusiast"
                                                className="w-full p-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl font-medium focus:border-blue-500 outline-none transition-colors text-slate-900 dark:text-white resize-none h-24"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Skills (Comma separated)</label>
                                            <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl focus-within:border-blue-500 transition-colors">
                                                <input 
                                                    type="text" value={skills} onChange={e => setSkills(e.target.value)}
                                                    placeholder="React, Node.js, Python..."
                                                    className="w-full bg-transparent font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                                                />
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {skills.split(',').filter(s => s.trim()).map((s, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            {s.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-600/5 rounded-2xl border border-blue-200 dark:border-blue-500/20">
                                                <div className="p-3 bg-white dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                                                    <Zap size={24} className="fill-current" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-900 dark:text-white">Open to Teaming</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow other users to find you for hackathons and team events.</div>
                                                </div>
                                                 <input 
                                                    type="checkbox" 
                                                    checked={openToTeaming} 
                                                    onChange={e => setOpenToTeaming(e.target.checked)}
                                                    className="w-6 h-6 accent-blue-600 rounded cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* SOCIALS TAB */}
                        {activeTab === 'socials' && (
                             <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400"><Globe size={20}/></div>
                                        Social Links
                                    </h3>
                                    <button onClick={() => handleProfileSave(false)} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 text-sm">
                                        Save Changes
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                                            <Github size={24} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">GitHub URL</label>
                                            <input 
                                                type="url" 
                                                value={socials.github} 
                                                onChange={e => setSocials({...socials, github: e.target.value})}
                                                placeholder="https://github.com/username" 
                                                className="w-full p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl font-medium focus:border-purple-500 outline-none transition-colors text-slate-900 dark:text-white placeholder-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10 text-blue-600 dark:text-blue-400">
                                            <Linkedin size={24} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">LinkedIn URL</label>
                                            <input 
                                                type="url" 
                                                value={socials.linkedin} 
                                                onChange={e => setSocials({...socials, linkedin: e.target.value})}
                                                placeholder="https://linkedin.com/in/username" 
                                                className="w-full p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl font-medium focus:border-purple-500 outline-none transition-colors text-slate-900 dark:text-white placeholder-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                                            <Globe size={24} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Portfolio / Website</label>
                                            <input 
                                                type="url" 
                                                value={socials.website} 
                                                onChange={e => setSocials({...socials, website: e.target.value})}
                                                placeholder="https://yourwebsite.com" 
                                                className="w-full p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl font-medium focus:border-purple-500 outline-none transition-colors text-slate-900 dark:text-white placeholder-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                {/* Password Card */}
                                <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400"><Key size={20}/></div>
                                        Change Password
                                    </h3>

                                    {passStatus.msg && (
                                        <div className={`p-4 rounded-xl text-sm font-bold border mb-6 ${passStatus.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20'}`}>
                                            {passStatus.msg}
                                        </div>
                                    )}

                                    <form onSubmit={(e) => { e.preventDefault(); setOpenPasswordVerify(true); }} className="space-y-4 max-w-lg">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Current Password</label>
                                            <input 
                                                type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                                                className="w-full p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl font-bold focus:border-amber-500 outline-none transition-colors text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">New Password</label>
                                            <input 
                                                type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                                className="w-full p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl font-bold focus:border-amber-500 outline-none transition-colors text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <button type="submit" disabled={!oldPassword || !newPassword} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                            Update Password
                                        </button>
                                    </form>
                                </div>

                                {/* Login History */}
                                <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"><Monitor size={20}/></div>
                                        Recent Devices
                                    </h3>
                                    <div className="space-y-1">
                                        {loginHistory.map((log, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400">
                                                        <Monitor size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white text-sm">{formatUserAgent(log.userAgent)}</div>
                                                        <div className="text-xs text-slate-500 font-mono mt-1">{log.ip || "IP Unknown"} • {new Date(log.at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                {i === 0 && <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase rounded-lg">Active Now</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </motion.div>
                )}
             </div>
          </div>

          {/* View Avatar Modal */}
          <AnimatePresence>
             {viewAvatarOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setViewAvatarOpen(false)}>
                   <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative max-w-md w-full">
                      <img src={user?.avatar} className="w-full h-auto rounded-3xl shadow-2xl border border-white/10" />
                      <button onClick={() => setViewAvatarOpen(false)} className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2"><X size={32}/></button>
                   </motion.div>
                </div>
             )}

             {/* Email Verification Modal */}
             {openEmailVerify && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-500/20">
                         <Mail size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verify Email</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">We sent a code to <br/><b className="text-slate-900 dark:text-white">{email}</b></p>
                      
                      <input 
                         type="text" placeholder="000000" className="w-full text-center text-3xl tracking-[1rem] font-black p-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white mb-6 uppercase"
                         value={otp} onChange={e => setOtp(e.target.value)}
                         maxLength={6}
                      />
                      
                      {otpStatus && <p className={`text-xs font-bold mb-4 ${otpStatus.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>{otpStatus}</p>}

                      <button onClick={verifyEmailOtp} disabled={otpLoading} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                         {otpLoading ? <Loader className="animate-spin mx-auto"/> : 'Verify Code'}
                      </button>
                   </motion.div>
                </div>
             )}

             {/* Password Confirm Modal */}
             {openPasswordVerify && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Confirm Changes</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Are you sure you want to change your password?</p>
                      <div className="flex gap-4">
                         <button onClick={() => setOpenPasswordVerify(false)} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
                         <button onClick={handlePasswordVerification} disabled={otpLoading} className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/20">
                            {otpLoading ? <Loader className="animate-spin mx-auto"/> : 'Confirm'}
                         </button>
                      </div>
                   </motion.div>
                </div>
             )}
          </AnimatePresence>

       </div>
    </div>
  );
}
