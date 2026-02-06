import React, { useState } from "react";
import { ExternalLink, FileText, Check, Save, Globe, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubmissionTable({ submissions, onScore }) {
  const [drafts, setDrafts] = useState({}); // {submissionId: {score, feedback}}

  const set = (id, k, v) =>
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] || {}), [k]: v } }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
            <th className="p-6 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Participant</th>
            <th className="p-6 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Round</th>
            <th className="p-6 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Digital Asset</th>
            <th className="p-6 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-right">Merit Score</th>
            <th className="p-6 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Critical Feedback</th>
            <th className="p-6 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-center">Protocol</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {submissions.map((s) => (
            <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
              <td className="p-6">
                <div className="font-black text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{s.user?.name || "Anonymous"}</div>
                <div className="text-xs text-slate-500 font-medium lowercase tracking-wide mt-1">{s.user?.email || "no-email@id.com"}</div>
              </td>
              <td className="p-6">
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 uppercase tracking-widest">
                  Round {s.round}
                </span>
              </td>
              <td className="p-6">
                <div className="flex gap-3">
                  {s.submissionLink && (
                    <a href={s.submissionLink} target="_blank" rel="noreferrer" className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:scale-110 transition-transform border border-indigo-100 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/5" title="View Link">
                      {s.submissionLink.includes('github.com') ? <Github size={18} /> : <Globe size={18} />}
                    </a>
                  )}
                  {s.submissionFile?.url && (
                    <a href={s.submissionFile.url} target="_blank" rel="noreferrer" className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:scale-110 transition-transform border border-emerald-100 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/5" title="View File">
                      <FileText size={18} />
                    </a>
                  )}
                  {!s.submissionLink && !s.submissionFile?.url && <span className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">Abstain</span>}
                </div>
              </td>
              <td className="p-6 text-right">
                <input
                  type="number"
                  className="w-24 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black text-right outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white transition-all hover:border-slate-300 dark:hover:border-white/20"
                  placeholder="0"
                  value={drafts[s._id]?.score ?? (s.score ?? "")}
                  onChange={(e) => set(s._id, "score", e.target.value)}
                />
              </td>
              <td className="p-6">
                <input
                  type="text"
                  className="w-full p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white transition-all hover:border-slate-300 dark:hover:border-white/20"
                  placeholder="Professional commentary..."
                  value={drafts[s._id]?.feedback ?? (s.feedback ?? "")}
                  onChange={(e) => set(s._id, "feedback", e.target.value)}
                />
              </td>
              <td className="p-6 text-center">
                <button
                  onClick={() =>
                    onScore(s, {
                      score: Number(drafts[s._id]?.score ?? s.score ?? 0),
                      feedback: drafts[s._id]?.feedback ?? s.feedback ?? "",
                      round: s.round,
                      userId: s.user?._id,
                    })
                  }
                  className="p-3.5 bg-indigo-600 text-white rounded-[1.2rem] hover:bg-indigo-500 transition-all hover:rotate-12 active:scale-90 shadow-xl shadow-indigo-600/20 flex items-center justify-center mx-auto"
                  title="Finalize Evaluation"
                >
                  <Save size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
