import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import useApi from '../hooks/useApi';
import { motion } from 'framer-motion';
import {
  FileText, UploadCloud, CheckCircle, AlertTriangle,
  XCircle, Award, Shield, Briefcase, ChevronRight, Loader,
  Sparkles, Zap, TrendingUp, BookOpen, Target, Lightbulb, Download
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function ResumeAnalyzer() {
  const { post } = useApi();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [enhancement, setEnhancement] = useState(null);
  const [showEnhancement, setShowEnhancement] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
      setResult(null);
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const analyzeResume = async () => {
    if (!file) return;

    setAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await post('/ats/analyze', formData, true);
      setResult(res.data || res);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const enhanceResume = async () => {
    if (!result) return;

    setEnhancing(true);
    setEnhancement(null);

    try {
      // Extract text from result for enhancement
      const resumeText = `
        Skills: ${result.details?.skillsDetected?.join(", ") || ""}
        Feedback: ${JSON.stringify(result.feedback || {})}
      `;

      const res = await post('/ai/enhance-cv', {
        resumeText,
        targetRole: "General",
        experience: "Mid-level"
      });

      setEnhancement(res);
      setShowEnhancement(true);
    } catch (err) {
      console.error(err);
      setError("Enhancement failed. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };

  const downloadReport = () => {
    if (!enhancement) return;

    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Resume Enhancement Report", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Powered by OneStop AI Resume Shield", 20, 30);

    let y = 55;

    // --- SCORES ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Impact Metrics", 20, y);
    y += 8;

    const scores = [
      ["Current Quality Score", `${enhancement.impactMetrics?.beforeScore || enhancement.overallScore}/100`],
      ["Potential Quality Score", `${enhancement.impactMetrics?.afterScore}/100`],
      ["ATS Compatibility", `${enhancement.impactMetrics?.atsCompatibility}/100`],
      ["Readability Score", `${enhancement.impactMetrics?.readability}/100`]
    ];

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Score']],
      body: scores,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold' } },
      margin: { left: 20, right: 20 }
    });

    y = doc.lastAutoTable.finalY + 15;

    // --- ENHANCED SUMMARY ---
    if (enhancement.enhancedSummary) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Suggested Professional Summary", 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(70, 70, 70);
      const splitSummary = doc.splitTextToSize(enhancement.enhancedSummary, pageWidth - 40);
      doc.text(splitSummary, 20, y);

      y += (splitSummary.length * 5) + 15;
      doc.setTextColor(0, 0, 0); // Reset color
    }

    // --- GRAMMAR ISSUES ---
    if (enhancement.grammarIssues?.length > 0) {
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Grammar & Language Fixes", 20, y);
      y += 6;

      const grammarData = enhancement.grammarIssues.map(g => [g.original, g.corrected, g.reason]);

      autoTable(doc, {
        startY: y,
        head: [['Original', 'Correction', 'Reason']],
        body: grammarData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38], textColor: 255 }, // Red for errors
        styles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 } }, // Wrap text
        margin: { left: 20, right: 20 }
      });

      y = doc.lastAutoTable.finalY + 15;
    }

    // --- CONTENT IMPROVEMENTS ---
    if (enhancement.contentImprovements?.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Content Improvements", 20, y);
      y += 10;

      enhancement.contentImprovements.forEach(imp => {
        if (y > 260) { doc.addPage(); y = 20; }

        // Section Header
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(217, 119, 6); // Amber
        doc.text(`• Section: ${imp.section}`, 20, y);
        y += 6;

        // Details
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);

        const issue = `Issue: ${imp.issue}`;
        const suggestion = `Suggestion: ${imp.suggestion}`;

        const splitIssue = doc.splitTextToSize(issue, pageWidth - 30);
        doc.text(splitIssue, 25, y);
        y += splitIssue.length * 5;

        const splitSuggestion = doc.splitTextToSize(suggestion, pageWidth - 30);
        doc.text(splitSuggestion, 25, y);
        y += splitSuggestion.length * 5 + 4;

        if (imp.example) {
          doc.setFont("helvetica", "italic");
          const example = `Example: ${imp.example}`;
          const splitExample = doc.splitTextToSize(example, pageWidth - 30);
          doc.text(splitExample, 25, y);
          y += splitExample.length * 5;
        }

        y += 6; // Spacing between items
      });

      doc.setTextColor(0, 0, 0); // Reset
      y += 10;
    }

    // --- ACTION STEPS ---
    if (enhancement.actionableSteps?.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Your Action Plan", 20, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      enhancement.actionableSteps.forEach((step, i) => {
        const stepText = `${i + 1}. ${step}`;
        const splitStep = doc.splitTextToSize(stepText, pageWidth - 30);
        doc.text(splitStep, 20, y);
        y += splitStep.length * 6;
      });
    }

    // Save
    doc.save(`OneStop_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#22c55e"; // green-500
    if (score >= 70) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-6 md:p-12 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-6"
          >
            <Shield size={14} /> Beta Feature
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900 dark:text-white"
          >
            AI Resume Shield
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Beat the ATS bots. Get an instant score, actionable feedback, and increase your interview chances by <span className="text-blue-600 dark:text-white font-bold">3x</span>.
          </motion.p>
        </div>

        {/* Upload Section */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className={`
              border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all group relative overflow-hidden
              ${file
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : 'border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f1014] hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-white/5'}
            `}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />

              <div className="relative z-10 pointer-events-none">
                <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-8 transition-colors shadow-lg ${file ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform'}`}>
                  {file ? <FileText size={48} /> : <UploadCloud size={48} />}
                </div>

                {file ? (
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{file.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Ready to analyze</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Drop your resume here</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">PDF files only. Max 5MB.</p>
                  </div>
                )}
              </div>

              {analyzing && (
                <div className="absolute inset-0 z-30 bg-white/90 dark:bg-[#0f1014]/90 backdrop-blur-sm flex items-center justify-center flex-col">
                  <Loader className="animate-spin text-blue-600 mb-4" size={48} />
                  <p className="text-blue-600 dark:text-blue-400 font-bold animate-pulse text-lg">Scanning keywords...</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 font-bold">
                <AlertTriangle size={20} /> {error}
              </div>
            )}

            <button
              onClick={analyzeResume}
              disabled={!file || analyzing}
              className={`
                mt-8 w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]
                ${!file || analyzing
                  ? 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500'}
              `}
            >
              Analyze Now
            </button>
          </motion.div>
        )}

        {/* Results Dashboard */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Score Card */}
              <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="w-56 h-56 relative mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: result.score }, { value: 100 - result.score }]}
                        innerRadius={70}
                        outerRadius={90}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                        paddingAngle={5}
                      >
                        <Cell fill={getScoreColor(result.score)} />
                        <Cell fill="currentColor" className="text-slate-100 dark:text-white/5" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-slate-900 dark:text-white">{result.score}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">ATS Score</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold" style={{ color: getScoreColor(result.score) }}>{result.verdict}</h3>
              </div>

              {/* Stats Card */}
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-500/30 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none group">
                  <div>
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm"><Briefcase size={24} /></div>
                    <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Tech Keywords</h4>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-4">{result.details?.skillsDetected?.length || 0}</div>
                    <div className="flex flex-wrap gap-2">
                      {result.details?.skillsDetected?.slice(0, 5).map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-100 dark:border-purple-500/20 capitalize font-bold">{s}</span>
                      ))}
                      {(result.details?.skillsDetected?.length > 5) && <span className="text-xs text-slate-400 font-bold self-center">+{result.details.skillsDetected.length - 5} more</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-500/30 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none group">
                  <div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm"><FileText size={24} /></div>
                    <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Word Count</h4>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">{result.details?.wordCount || 0}</div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {result.details?.wordCount > 400 ? "Optimal Length ✅" : "Too Short ⚠️"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* ❌ Critical Issues */}
              <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl"><XCircle size={20} /></div> Critical Issues
                </h3>
                {result.feedback?.critical?.length > 0 ? (
                  <ul className="space-y-4">
                    {result.feedback.critical.map((item, i) => (
                      <li key={i} className="flex gap-4 text-slate-700 dark:text-slate-300 bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-500/20">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <span className="text-sm font-bold leading-relaxed">{item.replace("❌ ", "")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={40} />
                    <p className="font-bold">No critical issues found! Great job.</p>
                  </div>
                )}
              </div>

              {/* 💡 Improvements */}
              <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl"><Award size={20} /></div> Improvements
                </h3>
                {result.feedback?.improvements?.length > 0 ? (
                  <ul className="space-y-4">
                    {result.feedback.improvements.map((item, i) => (
                      <li key={i} className="flex gap-4 text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                        <span className="text-sm font-bold leading-relaxed">{item.replace("💡 ", "")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                    <p className="font-bold">Your resume structure is solid!</p>
                  </div>
                )}
              </div>

              {/* ✅ Strengths (Full Width) */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl"><CheckCircle size={20} /></div> What You Did Well
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.feedback?.strengths?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-500/10">
                      <CheckCircle className="text-green-500 shrink-0" size={18} />
                      <span className="text-sm font-bold">{item.replace("✅ ", "")}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Enhance CV Button */}
            <div className="text-center pt-8 border-t border-slate-200 dark:border-white/10 space-y-4">
              <button
                onClick={enhanceResume}
                disabled={enhancing}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enhancing ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Enhance My CV with AI
                  </>
                )}
              </button>
              <button onClick={() => { setFile(null); setResult(null); setEnhancement(null); setShowEnhancement(false); }} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white font-bold transition-colors flex items-center gap-2 mx-auto decoration-2 underline decoration-transparent hover:decoration-current">
                Analyze another resume <ChevronRight size={16} />
              </button>
            </div>

            {/* Enhancement Modal */}
            {showEnhancement && enhancement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowEnhancement(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white dark:bg-[#0f1014] rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative border border-slate-200 dark:border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Sparkles className="text-white" size={28} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">CV Enhancement Report</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">AI-Powered Improvements</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        <Download size={18} /> Download PDF
                      </button>
                      <button
                        onClick={() => setShowEnhancement(false)}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400"
                      >
                        <XCircle size={24} />
                      </button>
                    </div>
                  </div>

                  {/* Overall Score */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-200 dark:border-blue-500/20">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Current</div>
                      <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{enhancement.impactMetrics?.beforeScore || enhancement.overallScore}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-2xl border border-green-200 dark:border-green-500/20">
                      <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Potential</div>
                      <div className="text-3xl font-black text-green-600 dark:text-green-400">{enhancement.impactMetrics?.afterScore}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-2xl border border-purple-200 dark:border-purple-500/20">
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">ATS Score</div>
                      <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{enhancement.impactMetrics?.atsCompatibility}</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-200 dark:border-amber-500/20">
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Readability</div>
                      <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{enhancement.impactMetrics?.readability}</div>
                    </div>
                  </div>

                  {/* Enhanced Summary */}
                  {enhancement.enhancedSummary && (
                    <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-500/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="text-blue-600 dark:text-blue-400" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enhanced Professional Summary</h3>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">{enhancement.enhancedSummary}</p>
                    </div>
                  )}

                  {/* Grammar Issues */}
                  {enhancement.grammarIssues?.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="text-red-600 dark:text-red-400" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grammar & Language Fixes</h3>
                      </div>
                      <div className="space-y-3">
                        {enhancement.grammarIssues.map((issue, i) => (
                          <div key={i} className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="text-red-500 shrink-0 mt-1" size={16} />
                              <div className="flex-1">
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  <span className="line-through text-red-600 dark:text-red-400">{issue.original}</span>
                                  {" → "}
                                  <span className="text-green-600 dark:text-green-400">{issue.corrected}</span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{issue.reason}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Improvements */}
                  {enhancement.contentImprovements?.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="text-amber-600 dark:text-amber-400" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Content Improvements</h3>
                      </div>
                      <div className="space-y-4">
                        {enhancement.contentImprovements.map((imp, i) => (
                          <div key={i} className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-200 dark:border-amber-500/20">
                            <div className="font-bold text-amber-600 dark:text-amber-400 text-sm mb-2">{imp.section}</div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                              <span className="font-bold">Issue:</span> {imp.issue}
                            </div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                              <span className="font-bold">Suggestion:</span> {imp.suggestion}
                            </div>
                            {imp.example && (
                              <div className="mt-3 p-3 bg-white dark:bg-white/5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Example:</div>
                                <div className="text-sm text-slate-700 dark:text-slate-300 italic">{imp.example}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Elements & Keywords */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {enhancement.missingElements?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Zap className="text-purple-600 dark:text-purple-400" size={20} />
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Missing Elements</h3>
                        </div>
                        <div className="space-y-2">
                          {enhancement.missingElements.map((elem, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-500/20">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              {elem}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {enhancement.keywordSuggestions?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="text-blue-600 dark:text-blue-400" size={20} />
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Keyword Suggestions</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {enhancement.keywordSuggestions.map((kw, i) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-500/20 text-sm font-bold">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actionable Steps */}
                  {enhancement.actionableSteps?.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 p-6 rounded-2xl border border-green-200 dark:border-green-500/20">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Action Plan</h3>
                      </div>
                      <div className="space-y-3">
                        {enhancement.actionableSteps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <div className="w-6 h-6 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <span className="font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

          </motion.div>
        )}

      </div>
    </div>
  );
}
