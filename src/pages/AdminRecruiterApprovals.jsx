import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import {
  CheckCircle, XCircle, Briefcase, Mail, Phone, Loader,
  ExternalLink, Linkedin, Globe, Building2, User,
  AlertTriangle, Shield, Eye, X, Calendar, MapPin
} from "lucide-react";

export default function AdminRecruiterApprovals() {
  const { get, patch } = useApi();
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

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
      setError("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Verification helpers
  const isEmailCorporate = (email) => {
    const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com'];
    const domain = email?.split('@')[1]?.toLowerCase();
    return !genericDomains.includes(domain);
  };

  const getVerificationScore = (recruiter) => {
    let score = 0;
    let maxScore = 10; // ⭐ Updated to 10 points

    if (isEmailCorporate(recruiter.email)) score += 2; // Corporate email = 2 points
    if (recruiter.companyWebsite) score += 1;
    if (recruiter.socialLinks?.linkedin) score += 1;
    if (recruiter.designation) score += 1;
    if (recruiter.mobile) score += 1;

    // ⭐ NEW: Aadhaar Verification
    if (recruiter.aadhaarVerification?.verified) score += 2; // Verified Aadhaar = 2 points
    else if (recruiter.aadhaarVerification?.documentUrl) score += 1; // Uploaded but pending = 1 point

    // ⭐ NEW: UPI Verification (future)
    if (recruiter.upiVerification?.verified) score += 2; // Verified UPI = 2 points

    return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
  };

  const getVerificationBadge = (percentage) => {
    if (percentage >= 80) return { label: "High Trust", color: "green", icon: Shield };
    if (percentage >= 50) return { label: "Medium Trust", color: "amber", icon: AlertTriangle };
    return { label: "Low Trust", color: "red", icon: AlertTriangle };
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 pb-20"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <span className="p-2.5 bg-pink-50 text-pink-600 rounded-xl"><Briefcase size={28} /></span>
          Recruiter Verification Center
        </h1>
        <p className="text-slate-500 font-medium mt-2 ml-1">Verify recruiter legitimacy before granting access.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100">
          {error}
        </div>
      )}

      {recruiters.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-400 font-bold text-lg">No recruiter applications pending.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {recruiters.map((rec) => {
            const verification = getVerificationScore(rec);
            const badge = getVerificationBadge(verification.percentage);
            const BadgeIcon = badge.icon;

            return (
              <motion.div
                key={rec._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                        {rec.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{rec.name || "Unknown"}</h3>
                        <p className="text-slate-600 font-bold flex items-center gap-2 mt-1">
                          <Building2 size={16} /> {rec.orgName || "No Organization"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">{rec.designation || "Recruiter"}</p>
                      </div>
                    </div>

                    {/* Verification Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm ${badge.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                      badge.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      <BadgeIcon size={18} />
                      {badge.label} ({verification.score}/{verification.maxScore})
                    </div>
                  </div>

                  {/* Verification Checklist */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        {isEmailCorporate(rec.email) ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                        <span className={isEmailCorporate(rec.email) ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                          {isEmailCorporate(rec.email) ? "Corporate Email ✓" : "Generic Email (Gmail/Yahoo)"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {rec.companyWebsite ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-slate-400" />
                        )}
                        <span className={rec.companyWebsite ? "text-green-700 font-bold" : "text-slate-500"}>
                          Company Website {rec.companyWebsite ? "✓" : "Missing"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {rec.socialLinks?.linkedin ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-slate-400" />
                        )}
                        <span className={rec.socialLinks?.linkedin ? "text-green-700 font-bold" : "text-slate-500"}>
                          LinkedIn Profile {rec.socialLinks?.linkedin ? "✓" : "Missing"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        {rec.designation ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-slate-400" />
                        )}
                        <span className={rec.designation ? "text-green-700 font-bold" : "text-slate-500"}>
                          Job Title {rec.designation ? "✓" : "Missing"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {rec.mobile ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-slate-400" />
                        )}
                        <span className={rec.mobile ? "text-green-700 font-bold" : "text-slate-500"}>
                          Phone Number {rec.mobile ? "✓" : "Missing"}
                        </span>
                      </div>

                      {/* ⭐ NEW: Aadhaar Verification Status */}
                      <div className="flex items-center gap-2 text-sm">
                        {rec.aadhaarVerification?.verified ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : rec.aadhaarVerification?.documentUrl ? (
                          <AlertTriangle size={16} className="text-amber-600" />
                        ) : (
                          <XCircle size={16} className="text-slate-400" />
                        )}
                        <span className={
                          rec.aadhaarVerification?.verified ? "text-green-700 font-bold" :
                            rec.aadhaarVerification?.documentUrl ? "text-amber-700 font-bold" :
                              "text-slate-500"
                        }>
                          Aadhaar {
                            rec.aadhaarVerification?.verified ? "Verified ✓" :
                              rec.aadhaarVerification?.documentUrl ? "Pending Review ⏳" :
                                "Not Provided"
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-slate-600">
                          Registered {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info & Links */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <a href={`mailto:${rec.email}`} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                      <Mail size={14} /> {rec.email}
                    </a>

                    {rec.mobile && (
                      <a href={`tel:${rec.mobile}`} className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                        <Phone size={14} /> {rec.mobile}
                      </a>
                    )}

                    {rec.companyWebsite && (
                      <a href={`https://${rec.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors">
                        <Globe size={14} /> Visit Website <ExternalLink size={12} />
                      </a>
                    )}

                    {rec.socialLinks?.linkedin && (
                      <a href={rec.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                        <Linkedin size={14} /> LinkedIn <ExternalLink size={12} />
                      </a>
                    )}

                    {/* ⭐ NEW: View Aadhaar Document */}
                    {rec.aadhaarVerification?.documentUrl && (
                      <a
                        href={rec.aadhaarVerification.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors border border-amber-200"
                      >
                        <Shield size={14} /> View Aadhaar <ExternalLink size={12} />
                      </a>
                    )}

                    <button
                      onClick={() => setSelectedRecruiter(rec)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors ml-auto"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${rec.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      rec.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {rec.status}
                    </span>

                    {rec.status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(rec._id, "approve")}
                          disabled={actionLoading === rec._id}
                          className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === rec._id ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(rec._id, "reject")}
                          disabled={actionLoading === rec._id}
                          className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === rec._id ? <Loader className="animate-spin" size={16} /> : <XCircle size={16} />}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRecruiter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedRecruiter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Recruiter Details</h2>
                <button onClick={() => setSelectedRecruiter(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <p className="text-lg font-bold text-slate-900">{selectedRecruiter.name}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</label>
                  <p className="text-lg font-bold text-slate-900">{selectedRecruiter.orgName}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</label>
                  <p className="text-lg font-bold text-slate-900">{selectedRecruiter.designation || "Not provided"}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <p className="text-lg font-bold text-slate-900">{selectedRecruiter.email}</p>
                  {!isEmailCorporate(selectedRecruiter.email) && (
                    <p className="text-sm text-red-600 font-bold mt-1">⚠️ Generic email domain - verify carefully</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                  <p className="text-lg font-bold text-slate-900">{selectedRecruiter.mobile || "Not provided"}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Website</label>
                  {selectedRecruiter.companyWebsite ? (
                    <a href={`https://${selectedRecruiter.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 hover:underline flex items-center gap-2">
                      {selectedRecruiter.companyWebsite} <ExternalLink size={16} />
                    </a>
                  ) : (
                    <p className="text-lg text-slate-400">Not provided</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">LinkedIn Profile</label>
                  {selectedRecruiter.socialLinks?.linkedin ? (
                    <a href={selectedRecruiter.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 hover:underline flex items-center gap-2">
                      View Profile <ExternalLink size={16} />
                    </a>
                  ) : (
                    <p className="text-lg text-slate-400">Not provided</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Date</label>
                  <p className="text-lg font-bold text-slate-900">{new Date(selectedRecruiter.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
