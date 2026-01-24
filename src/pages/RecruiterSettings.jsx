import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider.jsx";
import { motion } from "framer-motion";
import { 
  User, Building2, Settings, Upload, Save, Mail, Phone, Globe, FileText, LayoutDashboard
} from "lucide-react";

export default function RecruiterSettings() {
  const { get, patch } = useApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    orgName: "",
    avatar: "",
    companyWebsite: "",
    companyDescription: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await get("/recruiter/rpanel/profile");
      setForm({
        name: data.name || "",
        mobile: data.mobile || "",
        orgName: data.orgName || "",
        avatar: data.avatar || "",
        companyWebsite: data.companyWebsite || "",
        companyDescription: data.companyDescription || "",
      });
    } catch (err) {
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await patch("/recruiter/rpanel/profile", form);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast("Profile update failed", "error");
    }
  };

  const uploadAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: "profile", label: "Profile Details", icon: User },
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "account", label: "Account Settings", icon: Settings },
  ];

  if (loading) {
     return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a0a0a]"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300 pb-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
             <LayoutDashboard size={14} /> Dashboard Settings
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
             Settings & Preferences
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-2 text-lg">
            Manage your personal profile and organization details.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 overflow-hidden sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all border-l-4
                    ${activeTab === tab.id 
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white border-transparent'
                    }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#0f1014] rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 p-8"
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
                     <User className="text-blue-600 dark:text-blue-500" size={24} /> Profile Details
                  </h2>
                  
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 border-dashed">
                     <div className="relative shrink-0 group">
                       <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#0f1014] shadow-lg bg-white dark:bg-[#1a1a1a] relative">
                          {form.avatar ? (
                            <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-300 dark:text-slate-600">
                               <User size={40} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Upload className="text-white" size={24} />
                          </div>
                       </div>
                       <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={uploadAvatar} />
                     </div>
                     <div className="text-center md:text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Profile Picture</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Upload a professional photo to build trust with candidates.</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Supports JPG/PNG. Max 2MB.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                        <div className="relative">
                           <User className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
                           <input 
                             type="text" name="name" value={form.name} onChange={handleChange}
                             className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                             placeholder="John Doe"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
                        <div className="relative">
                           <Phone className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
                           <input 
                             type="text" name="mobile" value={form.mobile} onChange={handleChange}
                             className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                             placeholder="+1 234 567 890"
                           />
                        </div>
                     </div>
                  </div>
                </>
              )}

              {/* Company Tab */}
              {activeTab === "company" && (
                 <>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
                      <Building2 className="text-blue-600 dark:text-blue-500" size={24} /> Company Information
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Organization Name</label>
                        <div className="relative">
                           <Building2 className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
                           <input 
                             type="text" name="orgName" value={form.orgName} onChange={handleChange}
                             className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                             placeholder="Acme Corp"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Website</label>
                        <div className="relative">
                           <Globe className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
                           <input 
                             type="text" name="companyWebsite" value={form.companyWebsite} onChange={handleChange}
                             className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                             placeholder="https://example.com"
                           />
                        </div>
                     </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                      <div className="relative">
                         <FileText className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                         <textarea 
                           name="companyDescription" value={form.companyDescription} onChange={handleChange}
                           rows={6}
                           className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none font-medium leading-relaxed"
                           placeholder="Tell us about your company culture, mission, and values..."
                         />
                      </div>
                   </div>
                 </>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
                      <Settings className="text-blue-600 dark:text-blue-500" size={24} /> Account Settings
                   </h2>
                   <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 mb-6 flex items-start gap-3">
                      <div className="p-1 bg-amber-100 dark:bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-500 mt-0.5"><Settings size={14} /></div>
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                        Email address changes require administrator approval. Contact support for assistance.
                      </p>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                      <div className="relative opacity-70">
                         <Mail className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
                         <input 
                           type="email" disabled value="Linked Account" 
                           className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-transparent text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                         />
                      </div>
                   </div>
                </>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
