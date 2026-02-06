import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import {
  CheckCircle, XCircle, Briefcase, Mail, Phone, Loader,
  ExternalLink, Linkedin, Globe, Building2, User,
  AlertTriangle, Shield, Eye, X, Calendar, MapPin, Loader2,
  TrendingUp, ShieldCheck, UserCheck, Search, Filter, MailCheck
} from "lucide-react";

export default function AdminRecruiterApprovals() {
  const { get, patch } = useApi();
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRecruiters = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await get("/admin/recruiters");
      const allRecruiters = Array.isArray(list) ? list : list?.data || [];
      setRecruiters(allRecruiters);
    } catch (err) {
      console.error(err);
      setError("Failed to load recruiter data.");
      setRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Confirm security action: ${action}?`)) return;
    setActionLoading(id);
    setError("");
    try {
      await patch(`/admin/recruiters/${id}/${action}`);
      setRecruiters((prev) => prev.map(r =>
        r._id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
      ));
      setSelectedRecruiter(null);
    } catch (err) {
      console.error(err);
      setError("Critical action failure.");
    } finally {
      setActionLoading(null);
    }
  };

  const verifyAadhaar = async (id) => {
    setActionLoading(`aadhaar-${id}`);
    try {
      await patch(`/admin/recruiters/${id}/verify-aadhaar`);
      setRecruiters((prev) => prev.map(r =>
        r._id === id ? { ...r, aadhaarVerification: { ...r.aadhaarVerification, verified: true } } : r
      ));
    } catch (err) {
      setError("Aadhaar verification failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const isEmailCorporate = (email) => {
    const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com'];
    const domain = email?.split('@')[1]?.toLowerCase();
    return !genericDomains.includes(domain);
  };

  const getVerificationScore = (recruiter) => {
    let score = 0;
    const maxScore = 10;
    if (recruiter.email) {
      if (isEmailCorporate(recruiter.email)) score += 3;
      else score += 1;
    }
    if (recruiter.companyWebsite) score += 1;
    if (recruiter.socialLinks?.linkedin) score += 1;
    if (recruiter.designation) score += 1;
    if (recruiter.mobile) score += 1;
    if (recruiter.aadhaarVerification?.verified) score += 3;
    else if (recruiter.aadhaarVerification?.documentUrl) score += 2;
    return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
  };

  const getVerificationBadge = (percentage) => {
    if (percentage >= 75) return { label: "High Trust", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: ShieldCheck };
    if (percentage >= 40) return { label: "Medium Trust", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle };
    return { label: "Low Trust", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: ShieldAlert };
  };

  const stats = useMemo(() => ({
    total: recruiters.length,
    pending: recruiters.filter(r => r.status === 'pending').length,
    highTrust: recruiters.filter(r => getVerificationScore(r).percentage >= 75).length,
  }), [recruiters]);

  const filteredRecruiters = useMemo(() => {
    return recruiters.filter(r =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.orgName?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [recruiters, search]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] transition-colors">
      <Loader2 className="animate-spin text-pink-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Scanning Identity Signatures...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-100 dark:bg-pink-600/5 rounded-full blur-[120px] transition-colors" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100 dark:bg-sky-600/5 rounded-full blur-[120px] transition-colors" />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 w-fit rounded-full">
            <Shield size={14} className="text-pink-600 dark:text-pink-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-400">Security Gate</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Recruiter <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 text-glow-pink">Center</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg font-serif italic max-w-2xl">Legitimacy verification and quality control for corporate partners.</p>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-sm">
          <TrendingUp size={16} className="text-pink-500" />
          <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Global Partners: {stats.total}</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Active Submissions", val: stats.pending, icon: Briefcase, color: "text-blue-500" },
          { label: "High Trust Partners", val: stats.highTrust, icon: ShieldCheck, color: "text-emerald-500" },
          { label: "Risk Assessments", val: stats.total, icon: AlertTriangle, color: "text-amber-500" },
        ].map((s, i) => (
          <div key={i} className="p-8 bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between group cursor-default shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{s.label}</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.val}</span>
            </div>
            <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 ${s.color}`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-10 flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={20} />
          <input type="text" placeholder="Probe corporate identity by name, org, or address..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl font-bold text-sm focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 shadow-sm transition-all dark:text-white" />
        </div>
        <button onClick={fetchRecruiters} className="h-[60px] px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl">
          Update Feed
        </button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-5 mb-8 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl font-black border border-rose-100 dark:border-rose-500/20 flex items-center gap-3 uppercase tracking-widest text-xs">
          <AlertTriangle size={20} /> {error}
        </motion.div>
      )}

      {filteredRecruiters.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-[#0f1014] rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5 transition-colors">
          <Briefcase size={64} className="mx-auto text-slate-200 dark:text-white/5 mb-6" />
          <p className="text-slate-400 dark:text-slate-500 font-black text-xl uppercase tracking-widest">Secure Area: No Entities Found</p>
          <p className="text-slate-500 dark:text-slate-600 font-medium mt-2">All identities have been processed or no matches found.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          <AnimatePresence>
            {filteredRecruiters.map((rec) => {
              const verification = getVerificationScore(rec);
              const badge = getVerificationBadge(verification.percentage);

              return (
                <motion.div
                  key={rec._id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-[#0f1014] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden hover:border-pink-500/30 transition-all group relative"
                >
                  <div className="p-10 flex flex-col lg:flex-row gap-12">
                    {/* Left: Identity Circle */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-6">
                      <div className="relative group/avatar cursor-pointer" onClick={() => setSelectedRecruiter(rec)}>
                        <div className="w-32 h-32 bg-gradient-to-br from-pink-500 via-rose-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-rose-500/30 group-hover/avatar:scale-105 transition-transform overflow-hidden">
                          {rec.name?.charAt(0) || <User size={48} />}
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-black rounded-2xl shadow-xl border-4 border-slate-50 dark:border-[#0f1014]">
                          <ShieldCheck size={20} className="text-pink-500" />
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest shadow-sm ${badge.color}`}>
                        {badge.label}
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${verification.percentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full bg-gradient-to-r ${verification.percentage > 70 ? 'from-emerald-400 to-emerald-600' : verification.percentage > 40 ? 'from-amber-400 to-amber-600' : 'from-rose-400 to-rose-600'}`} />
                      </div>
                    </div>

                    {/* Middle: Data Core */}
                    <div className="flex-grow space-y-8">
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">{rec.name}</h3>
                          <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 mt-2 hidden md:block"></div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                          <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 font-black text-xs uppercase tracking-widest"><Building2 size={16} /> {rec.orgName}</span>
                          <span className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest"><MapPin size={16} className="text-pink-500" /> Node Location: Regional</span>
                          <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500">{rec.designation || "Executive"}</span>
                        </div>
                      </div>

                      {/* Grid of Verified Evidence */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: "Corporate Email", ok: isEmailCorporate(rec.email), val: rec.email, icon: MailCheck },
                          { label: "Network Domain", ok: !!rec.companyWebsite, val: rec.companyWebsite || "Not provided", icon: Globe },
                          { label: "Professional Intel", ok: !!rec.socialLinks?.linkedin, val: "LinkedIn Bio Attached", icon: Linkedin },
                          { label: "Gov Verification", ok: rec.aadhaarVerification?.verified, val: rec.aadhaarVerification?.verified ? "Identity confirmed" : rec.aadhaarVerification?.documentUrl ? "Scanning Doc..." : "Identity Gap", icon: Shield }
                        ].map((item, i) => (
                          <div key={i} className={`p-5 rounded-[1.5rem] border-2 transition-all ${item.ok ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <item.icon size={16} className={item.ok ? 'text-emerald-500' : 'text-slate-300'} />
                              <span className={`text-[8px] font-black uppercase tracking-widest ${item.ok ? 'text-emerald-600' : 'text-slate-400'}`}>{item.label}</span>
                            </div>
                            <p className={`text-[10px] font-bold truncate ${item.ok ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{item.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Contact Intelligence */}
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <a href={`mailto:${rec.email}`} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black text-slate-700 dark:text-slate-300 hover:border-pink-500 transition-all uppercase tracking-[0.15em] hover:bg-pink-50 dark:hover:bg-pink-500/5"><Mail size={16} /> Transmission</a>
                        {rec.mobile && <a href={`tel:${rec.mobile}`} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-all uppercase tracking-[0.15em] hover:bg-emerald-50 dark:hover:bg-emerald-500/5"><Phone size={16} /> Secure Call</a>}
                        {rec.aadhaarVerification?.documentUrl && (
                          <a href={rec.aadhaarVerification.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-[10px] font-black hover:bg-amber-100 transition-all uppercase tracking-[0.15em]"><Shield size={16} /> Probe Documents</a>
                        )}
                      </div>
                    </div>

                    {/* Right: Command Actions */}
                    <div className="flex flex-col justify-center gap-4 min-w-[220px]">
                      <button onClick={() => setSelectedRecruiter(rec)} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl">Full Dossier</button>
                      {rec.status === 'pending' && (
                        <>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction(rec._id, "approve")} disabled={actionLoading === rec._id}
                            className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all disabled:opacity-50">
                            {actionLoading === rec._id ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />} Grant Access
                          </motion.button>
                          <button onClick={() => handleAction(rec._id, "reject")} disabled={actionLoading === rec._id}
                            className="w-full py-5 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-black hover:bg-rose-100 transition-all uppercase tracking-[0.2em] active:scale-95">
                            {actionLoading === rec._id ? <Loader className="animate-spin" size={18} /> : <XCircle size={18} />} Blacklist
                          </button>
                        </>
                      )}
                      {rec.status !== 'pending' && (
                        <div className={`py-5 rounded-2xl text-center font-black text-xs uppercase tracking-[0.2em] border-2 shadow-xl ${rec.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'}`}>
                          {rec.status} Sector Entry
                        </div>
                      )}
                      {rec.aadhaarVerification?.documentUrl && !rec.aadhaarVerification.verified && (
                        <button onClick={() => verifyAadhaar(rec._id)} disabled={actionLoading === `aadhaar-${rec._id}`} className="w-full py-4 bg-white dark:bg-transparent border border-pink-500 text-pink-500 rounded-2xl text-[9px] font-black hover:bg-pink-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-pink-500/10">
                          {actionLoading === `aadhaar-${rec._id}` ? <Loader size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Authorize ID Legality
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Enhanced Detail Modal */}
      <AnimatePresence>
        {selectedRecruiter && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-6" onClick={() => setSelectedRecruiter(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f1014] rounded-[3.5rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-12 shadow-2xl relative border border-slate-200 dark:border-white/10"
            >
              <button onClick={() => setSelectedRecruiter(null)} className="absolute top-10 right-10 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>

              <div className="flex flex-col md:flex-row items-center gap-10 mb-12 text-center md:text-left">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-rose-500/30">
                  {selectedRecruiter.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">{selectedRecruiter.name}</h2>
                  <p className="text-pink-600 dark:text-pink-400 font-black mt-4 uppercase tracking-[0.2em] text-xs border-l-4 border-pink-600 pl-4 py-1">{selectedRecruiter.designation || "Recruiter Node"} @ {selectedRecruiter.orgName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {[
                  { label: "Voice Frequency", val: selectedRecruiter.mobile, icon: Phone, color: "text-emerald-500" },
                  { label: "Terminal Address", val: selectedRecruiter.email, icon: Mail, color: "text-blue-500" },
                  { label: "Entity Matrix", val: selectedRecruiter.orgName, icon: Building2, color: "text-indigo-500" },
                  { label: "Temporal Entry", val: new Date(selectedRecruiter.createdAt).toLocaleDateString(), icon: Calendar, color: "text-amber-500" }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 group hover:border-pink-500/20 transition-all shadow-inner">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 mb-3"><item.icon size={16} className={item.color} /> {item.label}</label>
                    <p className="text-xl font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{item.val || "Not established"}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {selectedRecruiter.companyWebsite && (
                  <a href={`https://${selectedRecruiter.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all group">
                    <span className="font-black text-sm uppercase tracking-[0.2em]">Explore Corporate Core</span>
                    <ExternalLink size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                )}
                {selectedRecruiter.socialLinks?.linkedin && (
                  <a href={selectedRecruiter.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-95 transition-all group">
                    <span className="font-black text-sm uppercase tracking-[0.2em]">LinkedIn Intelligence</span>
                    <Linkedin size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

