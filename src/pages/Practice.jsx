import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Code, Brain, FileText, Video, Target, Zap, Trophy, ArrowRight, Shield, Terminal
} from "lucide-react";

export default function Practice() {
    const features = [
        {
            title: "Coding Problems",
            desc: "Solve 100+ curated problems across Data Structures, Algorithms, and SQL.",
            icon: Terminal,
            color: "bg-blue-600",
            link: "/challenges", // Assuming Challenges page handles this
            btnText: "Start Coding"
        },
        {
            title: "Mock Interviews",
            desc: "Practice with our advanced AI interviewer. Get real-time feedback on your answers.",
            icon: Video,
            color: "bg-purple-600",
            link: "/mock-interview",
            btnText: "Start Interview"
        },
        {
            title: "Quizzes & Assessments",
            desc: "Test your skills in Aptitude, Core CS subjects, and more with timed quizzes.",
            icon: Brain,
            color: "bg-pink-600",
            link: "/events", // Linking to events where Quizzes are listed
            btnText: "Take a Quiz"
        },
        {
            title: "Resume Shield",
            desc: "Analyze your resume against JD and get an ATS score with actionable improvements.",
            icon: Shield,
            color: "bg-green-600",
            link: "/resume-shield",
            btnText: "Analyze Resume"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pb-20 pt-24 px-6 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200 dark:bg-white/10 dark:text-white text-slate-700 text-xs font-bold uppercase tracking-widest mb-6">
                        <Target size={14} className="text-blue-600 dark:text-blue-400" /> Practice & Prepare
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
                        Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Skills.</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        The ultimate playground for developers. Practice coding, ace interviews, and get interview-ready—all in one place.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500/30 group transition-all hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${feature.color} opacity-5 blur-[50px] rounded-full`}></div>

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                                    <feature.icon size={32} />
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-300 dark:text-slate-600 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
                                    <Zap size={24} className="fill-current" />
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg mb-8 leading-relaxed h-14">
                                {feature.desc}
                            </p>

                            <Link to={feature.link} className={`inline-flex items-center gap-2 px-8 py-4 ${feature.color} text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-wide`}>
                                {feature.btnText} <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Coding Problems", val: "500+" },
                        { label: "Mock Interviews", val: "10K+" },
                        { label: "Active Users", val: "50K+" },
                        { label: "Quizzes Taken", val: "1.2M+" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-8 bg-white/50 dark:bg-[#0f1014]/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/5">
                            <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{stat.val}</div>
                            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
