import React, { useState } from "react";
import { ExternalLink, FileText, Check, Save } from "lucide-react";

/**
 * SubmissionTable (Refactored to Tailwind)
 * Props:
 * - submissions: Array<Submission>
 * - onScore: (submission, { score, feedback, round, userId }) => Promise
 */
export default function SubmissionTable({ submissions, onScore }) {
  const [drafts, setDrafts] = useState({}); // {submissionId: {score, feedback}}

  const set = (id, k, v) =>
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] || {}), [k]: v } }));

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Participant</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Round</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Submission</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Score</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Feedback</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">Save</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <td className="p-4">
                <div className="font-bold text-slate-900">{s.user?.name || "—"}</div>
                <div className="text-xs text-slate-500">{s.user?.email || "—"}</div>
              </td>
              <td className="p-4">
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                  R{s.round}
                </span>
              </td>
              <td className="p-4">
                 <div className="flex gap-2">
                    {s.submissionLink && (
                       <a href={s.submissionLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                          Link <ExternalLink size={12}/>
                       </a>
                    )}
                    {s.submissionFile?.url && (
                       <a href={s.submissionFile.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                          File <FileText size={12}/>
                       </a>
                    )}
                    {!s.submissionLink && !s.submissionFile?.url && <span className="text-slate-400 text-xs italic">No Content</span>}
                 </div>
              </td>
              <td className="p-4 text-right">
                <input
                  type="number"
                  className="w-20 p-2 border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:border-blue-500"
                  placeholder="0"
                  value={drafts[s._id]?.score ?? (s.score ?? "")}
                  onChange={(e) => set(s._id, "score", e.target.value)}
                />
              </td>
              <td className="p-4">
                <input
                  type="text"
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  placeholder="Optional feedback..."
                  value={drafts[s._id]?.feedback ?? (s.feedback ?? "")}
                  onChange={(e) => set(s._id, "feedback", e.target.value)}
                />
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() =>
                    onScore(s, {
                      score: Number(drafts[s._id]?.score ?? s.score ?? 0),
                      feedback: drafts[s._id]?.feedback ?? s.feedback ?? "",
                      round: s.round,
                      userId: s.user?._id,
                    })
                  }
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                  title="Save Score"
                >
                  <Save size={18} />
                </button>
              </td>
            </tr>
          ))}

          {submissions.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                No submissions found for this round.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
