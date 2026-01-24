import React, { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../components/ToastProvider.jsx";
import useApi from "../hooks/useApi.js";
import { useNavigate } from "react-router-dom";
import { Rocket, MapPin, DollarSign, Briefcase, Plus, X, ChevronRight, Loader } from "lucide-react";

export default function PostJob() {
  const { post } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    location: "",
    salary: "",
    type: "Full-time",
    description: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillAdd = (e) => {
    e.preventDefault();
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills((prev) => [...prev, val]);
      setSkillInput("");
    }
  };

  const handleSkillDelete = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...form, skills };
      await post("/recruiter/jobs", payload);
      showToast("Opportunity published successfully! 🚀", "success");
      navigate("/rpanel/jobs");
    } catch (err) {
      console.error("Job Post Error:", err);
      showToast("Failed to post job. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <span className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400">
            <Rocket size={24} />
          </span>
          Post a New Opportunity
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-[4.5rem] font-medium text-lg">
          Create a job listing to attract the best talent on the platform.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
            Basic Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Job Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                placeholder="e.g. Senior React Developer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                  placeholder="e.g. Bangalore, Remote"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Salary Range</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                  placeholder="e.g. ₹12 - 18 LPA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employment Type <span className="text-red-500">*</span></label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none text-slate-900 dark:text-white font-medium"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills Section */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
            Required Skills
          </h2>
          
          <div className="flex gap-2 mb-6 flex-wrap min-h-[40px]">
            {skills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm font-bold border border-blue-100 dark:border-blue-500/20">
                {skill}
                <button type="button" onClick={() => handleSkillDelete(skill)} className="hover:text-blue-900 dark:hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
            {skills.length === 0 && <span className="text-slate-400 italic text-sm py-1.5">No skills added yet.</span>}
          </div>

          <div className="flex gap-3 max-w-lg">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSkillAdd(e)}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400"
              placeholder="Add a skill (e.g. Java)"
            />
            <button
              type="button"
              onClick={handleSkillAdd}
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Add
            </button>
          </div>
        </motion.div>


        {/* Description Section */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Job Description <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={async () => {
                if(!form.title) return showToast("Please enter a Job Title and Skills first!", "error");
                setLoading(true);
                try {
                  const res = await post("/ai/job-description", { ...form, skills });
                  handleChange({ target: { name: "description", value: res.description }});
                  showToast("AI Generated Description! ✨", "success");
                } catch(e) {
                   console.error(e);
                   showToast("AI Failed to generate", "error");
                } finally {
                   setLoading(false);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-xl font-bold text-sm hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors"
            >
              <Rocket size={16} /> Auto-Generate with AI
            </button>
          </div>
          
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={12}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-y text-slate-900 dark:text-white font-medium placeholder-slate-400 leading-relaxed font-mono text-sm"
            placeholder="Detailed description of the role (Click 'Auto-Generate' to let AI write this for you!)"
          ></textarea>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 gap-4">
           <button
             type="button"
             onClick={() => navigate('/rpanel/jobs')}
             className="px-8 py-4 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
           >
             Cancel
           </button>
           <button
             type="submit"
             disabled={loading}
             className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
           >
             {loading ? <Loader className="animate-spin" size={20}/> : (
               <>Publish Opportunity <ChevronRight size={20} /></>
             )}
           </button>
        </div>

      </form>
    </div>
  );
}
