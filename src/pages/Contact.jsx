import { useState } from "react";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mail, User, MessageSquare, Loader, CheckCircle, AlertCircle, FileText, ArrowRight, X } from "lucide-react";
import AuthModal from "../components/AuthModal";

export default function Contact() {
  const { user, isAuthenticated } = useAuth();
  const { post } = useApi();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Auth Modal
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await post("/contact", form);
      setSuccess("Message sent successfully! Our team will contact you soon.");
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact send failed:", err);
      setError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] relative overflow-hidden font-sans text-slate-900 dark:text-white transition-colors duration-300">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none transition-colors"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none transition-colors"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 relative z-10 grid lg:grid-cols-2 gap-16 items-center">

        {/* Text Side */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-6">
            <MessageSquare size={14} className="fill-blue-500/50" /> We are here to help
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            Get in touch with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">OneStop Support</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg font-light">
            Have a question about a hackathon, job application, or just want to say hi? We'd love to hear from you.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group shadow-lg shadow-slate-200/50 dark:shadow-none">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Support for Candidates</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Need help with your profile or applications?</p>
                <a href="#" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-xs mt-3 hover:gap-2 transition-all">Visit Help Center <ArrowRight size={12} /></a>
              </div>
            </div>
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all group shadow-lg shadow-slate-200/50 dark:shadow-none">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-500/20 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">General Inquiries</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Reach out at chaithanya9727@gmail.com</p>
                <a href="mailto:chaithanya9727@gmail.com" className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold text-xs mt-3 hover:gap-2 transition-all">Send Email <ArrowRight size={12} /></a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-[#0f1014]/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-200 dark:border-white/10"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Send us a message</h2>
            <p className="text-slate-600 dark:text-slate-500">We usually reply within 24 hours.</p>
          </div>

          <AnimatePresence mode="wait">
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-2xl flex items-center gap-3 font-bold border border-green-200 dark:border-green-500/20">
                <CheckCircle size={20} /> {success}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 font-bold border border-red-200 dark:border-red-500/20">
                <AlertCircle size={20} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your Name"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl font-medium outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-[#1f1f1f] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl font-medium outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-[#1f1f1f] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Subject</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} required placeholder="How can we help?"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl font-medium outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-[#1f1f1f] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} required placeholder="Write your message..." rows={4}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl font-medium outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-[#1f1f1f] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all resize-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]">
              {loading ? <Loader className="animate-spin" size={20} /> : <><Send size={20} /> Send Message</>}
            </button>
          </form>

        </motion.div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
