/* eslint-disable react/no-unescaped-entities */
import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Trophy, Briefcase, Users, Code2, Shield, Zap,
    Rocket, Terminal, Brain, GraduationCap, Globe,
    CheckCircle2, ArrowRight, Sparkles, Target,
    ChevronRight, Play, Search, UserPlus, Award,
    MessageSquare, LayoutGrid, Cpu, BookOpen, Bell, PhoneCall
} from 'lucide-react';
import { TracingBeam } from '../components/ui/TracingBeam';

// --- SHARED UI COMPONENTS ---

const SectionHeaders = ({ title, subtitle, center = true }) => (
    <div className={`mb-16 ${center ? 'text-center' : 'text-left'}`}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-bold tracking-wide uppercase mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)] dark:shadow-[0_0_20px_rgba(99,102,241,0.1)] border border-indigo-500/20"
        >
            <Sparkles size={14} />
            {subtitle}
        </motion.div>
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight"
        >
            {title}
        </motion.h2>
    </div>
);

const BentoCard = ({ children, className, delay = 0, onClick }) => {
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);

    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set((clientX - left) / width);
        y.set((clientY - top) / height);
    }

    function handleMouseLeave() {
        x.set(0.5);
        y.set(0.5);
    }

    const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
    const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.01, y: -4 }}
            onClick={onClick}
            style={{
                perspective: 2000,
                rotateX,
                rotateY,
            }}
            className={`group relative bg-white dark:bg-[#0D0D12] border border-slate-200 dark:border-white/[0.03] rounded-[3rem] overflow-hidden ${className} transition-all duration-500 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_50px_100px_-20px_rgba(99,102,241,0.1)]`}
        >
            {/* Studio Background Mesh */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

            {/* Dynamic Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-[3rem] opacity-0 transition duration-300 group-hover:opacity-100 mix-blend-soft-light"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([mx, my]) => `radial-gradient(800px circle at ${mx * 100}% ${my * 100}%, rgba(99, 102, 241, 0.5), transparent 80%)`
                    ),
                }}
            />
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
};

const FeatureCard = ({ feat, navigate, getColor }) => {
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set((clientX - left) / width);
        y.set((clientY - top) / height);
    }

    function handleMouseLeave() {
        x.set(0.5);
        y.set(0.5);
    }

    const rotateX = useTransform(mouseY, [0, 1], [5, -5]);
    const rotateY = useTransform(mouseX, [0, 1], [-5, 5]);

    return (
        <motion.div
            style={{
                perspective: 1000,
                rotateX,
                rotateY,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => navigate(feat.link)}
            className={`group relative flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm hover:shadow-xl ${getColor(feat.color).split(' ').slice(2).join(' ')}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${getColor(feat.color).split(' ').slice(0, 2).join(' ')} group-hover:scale-110 shadow-inner group-hover:bg-white/20 group-hover:text-white`}>
                {React.cloneElement(feat.icon, { size: 24 })}
            </div>
            <div className="flex-1">
                <h4 className="font-black text-slate-900 dark:text-white transition-colors text-base tracking-tight">{feat.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 opacity-70 uppercase font-black tracking-widest leading-none mt-1">{feat.desc}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                <ChevronRight size={16} className="text-indigo-500" />
            </div>

            {/* Inner Spotlight */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([mx, my]) => `radial-gradient(150px circle at ${mx * 100}% ${my * 100}%, rgba(255, 255, 255, 0.1), transparent 100%)`
                    )
                }}
            />
        </motion.div>
    );
};

// --- SECTIONS ---

const Hero = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const allFeatures = [
        { label: 'Live Arenas', link: '/events', icon: <Trophy size={14} />, keywords: ['event', 'hackathon', 'contest', 'arena', 'compete'], color: 'amber' },
        { label: 'Elite Jobs', link: '/jobs', icon: <Briefcase size={14} />, keywords: ['job', 'hiring', 'career', 'work', 'salary'], color: 'emerald' },
        { label: 'AI Interview Lab', link: '/mock-interview', icon: <Brain size={14} />, keywords: ['interview', 'mock', 'ai', 'prep', 'hr'], color: 'rose' },
        { label: 'Elite Mentorship', link: '/mentors', icon: <Users size={14} />, keywords: ['mentor', 'guide', 'coach', 'talk'], color: 'indigo' },
        { label: 'Resume Shield', link: '/resume-shield', icon: <Shield size={14} />, keywords: ['resume', 'shield', 'ats', 'cv', 'optimize'], color: 'purple' },
        { label: 'Practice Arena', link: '/practice', icon: <Terminal size={14} />, keywords: ['practice', 'code', 'solve', 'dsa'], color: 'slate' },
        { label: 'Global Rank', link: '/leaderboard', icon: <Award size={14} />, keywords: ['rank', 'leaderboard', 'top', 'global'], color: 'sky' },
        { label: 'Team Finder', link: '/team-finder', icon: <UserPlus size={14} />, keywords: ['team', 'partner', 'collab', 'group'], color: 'pink' },
        { label: 'Skill Assessments', link: '/challenges', icon: <Target size={14} />, keywords: ['challenge', 'test', 'exam', 'skill'], color: 'orange' },
        { label: 'Builder Showcase', link: '/projects', icon: <LayoutGrid size={14} />, keywords: ['project', 'build', 'showcase', 'repo'], color: 'violet' }
    ];

    const filteredSuggestions = searchQuery
        ? allFeatures.filter(f => f.label.toLowerCase().includes(searchQuery.toLowerCase()) || f.keywords.some(k => k.includes(searchQuery.toLowerCase())))
        : allFeatures.slice(0, 4);

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20">
            {/* Stunning Studio Mesh Background */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-slate-50 dark:bg-[#030303]">
                {/* 1. Base Gradient Layer */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(99,102,241,0.15)_0%,_transparent_50%)]" />

                {/* 2. Floating Technical Orbs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full"
                />


                {/* 4. Grainy Studio Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />

                {/* 5. Bottom Fade for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-[#030303] z-10" />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md mb-8 shadow-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Innovation Ecosystem
                    </span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.9] drop-shadow-sm">
                    Dream.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                        Build.
                    </span>{' '}
                    Achieve.
                </h1>

                <p className="text-xl md:text-2xl font-body text-slate-800 dark:text-slate-200 max-w-2xl mx-auto mb-10 font-bold leading-relaxed drop-shadow-sm">
                    The all-in-one ecosystem for ambitious minds ready to lead the next era of technology. Learn, compete, and build your legacy.
                </p>

                {/* Professional Smart Search System */}
                <div className="max-w-2xl mx-auto mb-12 relative z-40">
                    <div className="relative group">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const query = searchQuery.toLowerCase().trim();
                                if (!query) return;

                                const routes = {
                                    job: '/jobs', hiring: '/jobs', internship: '/jobs',
                                    mentor: '/mentors', guide: '/mentors', session: '/mentors',
                                    event: '/events', hackathon: '/events', contest: '/events',
                                    practice: '/practice', quiz: '/practice',
                                    resume: '/resume-shield', shield: '/resume-shield',
                                    mock: '/mock-interview', interview: '/mock-interview',
                                    project: '/projects', build: '/projects',
                                    community: '/community', chat: '/community',
                                    rank: '/leaderboard', leaderboard: '/leaderboard'
                                };

                                const foundRoute = Object.entries(routes).find(([kw]) => query.includes(kw));
                                if (foundRoute) {
                                    navigate(foundRoute[1] + `?search=${encodeURIComponent(query)}`);
                                } else {
                                    navigate(`/events?search=${encodeURIComponent(query)}`);
                                }
                                setIsFocused(false);
                            }}
                            className={`bg-white/40 dark:bg-white/5 backdrop-blur-3xl border ${isFocused ? 'border-blue-500/50 shadow-blue-500/10' : 'border-white/20 dark:border-white/10'} p-2 rounded-full shadow-2xl flex items-center transition-all duration-300`}
                        >
                            <div className={`pl-6 ${isFocused ? 'text-blue-500' : 'text-slate-400'} transition-colors`}>
                                <Search size={24} />
                            </div>
                            <input
                                type="text"
                                name="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                autoComplete="off"
                                placeholder="Search for opportunities, mentors, or tech modules..."
                                className="w-full bg-transparent border-none outline-none px-4 py-3 text-lg font-bold text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-body"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 py-3.5 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                            >
                                Explore <ArrowRight size={14} />
                            </button>
                        </form>

                        {/* Ultra-Glass Command Center Search Dropdown */}
                        <AnimatePresence mode="wait">
                            {(isFocused || searchQuery) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(10px)' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    className="absolute top-full left-0 right-0 mt-6 bg-white/[0.08] dark:bg-white/[0.02] backdrop-blur-[40px] border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden text-left z-50 ring-1 ring-white/20"
                                >
                                    {/* Inner Subtle Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-purple-500/[0.05] pointer-events-none" />

                                    <div className="relative p-8 px-10 border-b border-white/10 flex justify-between items-center bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-300">
                                                {searchQuery ? 'Neural Matching' : 'Institutional Access'}
                                            </span>
                                        </div>
                                        {searchQuery && (
                                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                                {filteredSuggestions.length} Modules Found
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto custom-scrollbar">
                                        {filteredSuggestions.length > 0 ? (
                                            filteredSuggestions.map((feat) => {
                                                const colorMap = {
                                                    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
                                                    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                                                    rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
                                                    indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
                                                    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
                                                    slate: 'text-slate-300 bg-white/5 border-white/10',
                                                    sky: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
                                                    pink: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
                                                    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
                                                    violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20'
                                                };
                                                return (
                                                    <button
                                                        key={feat.label}
                                                        onClick={() => {
                                                            navigate(feat.link);
                                                            setIsFocused(false);
                                                        }}
                                                        className="flex items-center gap-5 p-5 rounded-[1.8rem] hover:bg-white/10 dark:hover:bg-white/[0.08] border border-transparent hover:border-white/20 transition-all duration-300 text-left group relative overflow-hidden"
                                                    >
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border ${colorMap[feat.color] || 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'}`}>
                                                            {feat.icon}
                                                        </div>
                                                        <div className="relative z-10">
                                                            <div className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5 group-hover:text-blue-400 transition-colors">
                                                                {feat.label}
                                                            </div>
                                                            <div className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] leading-none opacity-70">
                                                                Core Ecosystem Module
                                                            </div>
                                                        </div>
                                                        <ArrowRight size={16} className="absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-blue-500" />
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-2 p-16 text-center">
                                                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-slate-400">
                                                    <Search size={32} />
                                                </div>
                                                <div className="text-slate-300 text-lg font-black tracking-tight mb-2">No direct module detected</div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 opacity-80 max-w-[200px] mx-auto leading-relaxed">
                                                    Explore our institutional architecture below
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Command Bar Simulation Footer */}
                                    <div className="p-4 px-10 bg-black/20 backdrop-blur-md flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        <div className="flex gap-6">
                                            <span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-white">ESC</kbd> Close</span>
                                            <span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-white">TAB</kbd> Navigate</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-500/80">
                                            OneStop Smart Terminal v2.0
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Quick Access Grid (Static below) */}
                    {!isFocused && !searchQuery && (
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {allFeatures.slice(0, 5).map((chip) => (
                                <button
                                    key={chip.label}
                                    onClick={() => navigate(chip.link)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:text-blue-500 transition-all shadow-sm active:scale-95`}
                                >
                                    {chip.icon} {chip.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};


const FeaturesCatalog = () => {
    const navigate = useNavigate();

    const categories = [
        {
            name: "Opportunities",
            icon: <Trophy className="text-amber-500" />,
            features: [
                { title: "Hackathons", desc: "Build & Win", link: "/hackathons", icon: <Code2 />, color: "blue" },
                { title: "Coding Contests", desc: "Show Skills", link: "/contests", icon: <Trophy />, color: "indigo" },
                { title: "Job Board", desc: "Verified Roles", link: "/jobs", icon: <Briefcase />, color: "green" },
                { title: "Internships", desc: "Early Career", link: "/internships", icon: <Rocket />, color: "cyan" },
                { title: "Challenges", desc: "Assessments", link: "/challenges", icon: <Target />, color: "rose" },
            ]
        },
        {
            name: "Upskilling",
            icon: <Cpu className="text-purple-500" />,
            features: [
                { title: "Practice Arena", desc: "Solve Problems", link: "/practice", icon: <Terminal />, color: "slate" },
                { title: "Mock Interview", desc: "AI Interviews", link: "/mock-interview", icon: <Brain />, color: "rose" },
                { title: "Quiz Gen", desc: "Custom Tests", link: "/practice/quiz", icon: <Zap />, color: "yellow" },
                { title: "Resources", desc: "Learning Paths", link: "/resources", icon: <BookOpen />, color: "blue" },
                { title: "Projects", desc: "Builder Hub", link: "/projects", icon: <LayoutGrid />, color: "violet" },
            ]
        },
        {
            name: "Career Tools",
            icon: <Shield className="text-blue-500" />,
            features: [
                { title: "Resume Shield", desc: "ATS AI Analysis", link: "/resume-shield", icon: <Shield />, color: "purple" },
                { title: "Team Finder", desc: "Find Partners", link: "/team-finder", icon: <UserPlus />, color: "pink" },
                { title: "Applications", desc: "Track Status", link: "/candidate/applications", icon: <CheckCircle2 />, color: "emerald" },
                { title: "Leaderboard", desc: "Global Rank", link: "/leaderboard", icon: <Award />, color: "amber" },
                { title: "Dashboard", desc: "User Control", link: "/dashboard", icon: <LayoutGrid />, color: "indigo" },
            ]
        },
        {
            name: "Network & Info",
            icon: <Users className="text-emerald-500" />,
            features: [
                { title: "Find Mentors", desc: "1:1 Coaching", link: "/mentors", icon: <Users />, color: "orange" },
                { title: "Community", desc: "Forums & Chat", link: "/community", icon: <MessageSquare />, color: "blue" },
                { title: "Notices", desc: "Stay Updated", link: "/notices", icon: <Bell />, color: "rose" },
                { title: "Become Mentor", desc: "Guide Others", link: "/become-mentor", icon: <Users />, color: "emerald" },
                { title: "Contact Us", desc: "24/7 Support", link: "/contact", icon: <PhoneCall />, color: "cyan" },
            ]
        }
    ];

    const getColor = (color) => {
        const colors = {
            blue: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white",
            indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500 hover:text-white",
            rose: "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white",
            yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500 hover:text-white",
            green: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white",
            cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500 hover:text-white",
            amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white",
            emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white",
            purple: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500 hover:text-white",
            slate: "bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500 hover:text-white",
            orange: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white",
            pink: "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500 hover:text-white",
            violet: "bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500 hover:text-white",
        };
        return colors[color] || colors.blue;
    };

    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <SectionHeaders
                subtitle="Feature Catalog"
                title="Everything you need, in one place."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {categories.map((cat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                {React.cloneElement(cat.icon, { size: 20 })}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                        </div>

                        <div className="grid gap-3">
                            {cat.features.map((feat, j) => (
                                <FeatureCard
                                    key={j}
                                    feat={feat}
                                    navigate={navigate}
                                    getColor={getColor}
                                />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const MasterHub = () => {
    const navigate = useNavigate();

    return (
        <section className="py-32 bg-[#F9F9FB] dark:bg-[#060608] border-y border-slate-200 dark:border-white/[0.02] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header Section - Studio Editorial Style */}
                <div className="flex flex-col items-center text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-sm"
                    >
                        <div className="flex items-center gap-1.5 text-emerald-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>OneStop</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-1" />
                        <span className="opacity-60">The Architecture Of Growth</span>
                    </motion.div>
                    <div className="max-w-4xl">
                        <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.85] tracking-tighter mb-10">
                            One Platform. <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient">Infinite Potential.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto italic">
                            "The studio-grade ecosystem providing institutional tools and elite mentorship to accelerate the next generation of tech leaders."
                        </p>
                    </div>
                </div>

                {/* Studio Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[450px]">

                    {/* 1. ARENA (Elite Feature) */}
                    <BentoCard
                        className="md:col-span-12 lg:col-span-8 flex flex-col group overflow-hidden border-indigo-500/10 shadow-xl"
                        onClick={() => navigate('/events')}
                    >
                        <div className="p-12 flex flex-col h-full relative z-10">
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] group-hover:rotate-[10deg] transition-transform duration-700">
                                            <Trophy size={40} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" /> Real-time Feed
                                            </span>
                                            <span className="text-xl font-black text-slate-900 dark:text-white">Active Arena</span>
                                        </div>
                                    </div>

                                </div>

                                <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-none">Global Arena</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed max-w-md font-medium">
                                    Compete in prestige hackathons and elite algorithmic challenges to build a verified track record.
                                </p>
                            </div>

                            <div className="flex items-center justify-end pt-10 border-t border-slate-100 dark:border-white/[0.05]">
                                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-black text-xs tracking-widest uppercase group-hover:gap-6 transition-all duration-500">
                                    Join The Hunt <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                        {/* Architectural Pattern Background */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)] pointer-events-none" />
                        <div className="absolute top-10 right-10 flex gap-1 group-hover:scale-110 transition-transform duration-1000">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-32 bg-indigo-500/5 rounded-full" />)}
                        </div>
                    </BentoCard>

                    {/* 2. CAREERS (Sleek Compact) */}
                    <BentoCard
                        className="md:col-span-12 lg:col-span-4 bg-slate-900 border-0 group shadow-2xl shadow-indigo-500/10"
                        onClick={() => navigate('/jobs')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#0A0A0F] to-[#0D0D12]" />
                        <div className="relative z-10 p-12 flex flex-col h-full">
                            <div className="mb-14">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center justify-center text-white">
                                        <Briefcase size={32} />
                                    </div>

                                </div>
                                <h3 className="text-4xl font-black text-white mb-4 leading-[0.9] tracking-tighter">Elite <br />Opportunities</h3>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-[200px]">
                                    Direct access to exclusive roles from leading enterprises.
                                </p>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" /> Hiring Now
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Google', 'Airbnb', 'Stripe', 'Meta'].map((brand, i) => (
                                        <div key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest">
                                            {brand}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* 3. RESUME SHIELD (Technical Precision) */}
                    <BentoCard
                        className="md:col-span-12 lg:col-span-5 flex flex-col group border-emerald-500/5 shadow-xl"
                        onClick={() => navigate('/resume-shield')}
                    >
                        <div className="p-12 flex flex-col h-full relative z-10">
                            <div className="flex items-center justify-between mb-14">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 text-emerald-500 flex items-center justify-center border border-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                                    <Shield size={32} />
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <div className="p-2 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 mb-1">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" /> AI Scans Live
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">4.2K Analyzed Today</span>
                                </div>
                            </div>

                            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Resume Shield</h3>
                            <p className="text-slate-500 dark:text-slate-500 font-medium text-lg leading-relaxed mb-12">
                                Institutional ATS optimization powered by industry-verified neural benchmarks.
                            </p>

                            <div className="mt-auto space-y-6">
                                <div className="h-[2px] w-full bg-slate-100 dark:bg-white/5 relative overflow-hidden">
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-emerald-500"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '92%' }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Improvement</span>
                                    <span className="text-3xl font-black text-emerald-500">+64%</span>
                                </div>
                            </div>
                        </div>
                        {/* Dot Grid Layer */}
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] z-0" style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </BentoCard>

                    {/* 4. MENTORSHIP (Premium Studio Guidance) */}
                    <BentoCard
                        className="md:col-span-12 lg:col-span-7 bg-indigo-600 border-0 flex flex-col group overflow-hidden shadow-2xl"
                        onClick={() => navigate('/mentors')}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
                        <div className="p-12 flex flex-col h-full relative z-10 text-white">
                            <div className="flex justify-between items-start mb-16">
                                <div className="w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl">
                                    <Users size={40} />
                                </div>
                            </div>

                            <div className="max-w-xl">
                                <h3 className="text-5xl font-black mb-6 tracking-tighter leading-none">Elite Mentorship</h3>
                                <p className="text-indigo-100/70 text-xl font-medium leading-relaxed mb-12 italic">
                                    "Architect your future with direct 1:1 guidance from engineering leaders at FAANG and Fortune 500 startups."
                                </p>
                                <button className="group px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-slate-50 transition-all flex items-center gap-4 shadow-2xl">
                                    Secure Your Slot <div className="w-1 h-1 bg-indigo-600 rounded-full group-hover:w-8 transition-all duration-500" />
                                </button>
                            </div>
                        </div>
                        {/* Decorative Pattern Bubbles */}
                        <MessageSquare size={300} className="absolute -bottom-20 -right-20 text-white/5 rotate-[20deg] group-hover:rotate-0 transition-transform duration-1000" />
                    </BentoCard>

                    {/* 5. AI INTERVIEW PRO (Neural Precision) */}
                    <BentoCard
                        className="md:col-span-12 lg:col-span-5 bg-[#0A0A0F] border-0 group shadow-2xl overflow-hidden"
                        onClick={() => navigate('/mock-interview')}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_50%)]" />
                        <div className="relative z-10 p-12 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-12">
                                <div className="w-16 h-16 rounded-[1.2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Brain size={32} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" /> Neural Analysis Live
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Sim</span>
                                </div>
                            </div>

                            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">AI Interview Lab</h3>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                                High-fidelity behavioral & technical simulations with institutional feedback loops.
                            </p>

                            <div className="mt-auto pt-8 border-t border-white/[0.05]">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance Lift</span>
                                        <div className="text-2xl font-black text-indigo-400">+22% Accuracy</div>
                                    </div>
                                    <ArrowRight className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all duration-500" size={24} />
                                </div>
                            </div>
                        </div>
                        {/* Neural Grid Overlay */}
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    </BentoCard>

                    {/* 6. SKILL ASSESSMENTS (Validation Hub) */}
                    <BentoCard
                        className="md:col-span-12 lg:col-span-7 flex flex-col group border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02]"
                        onClick={() => navigate('/contests')}
                    >
                        <div className="p-12 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-center mb-14">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                        <Target size={40} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Institutional Standard</span>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Skill Assessments</h3>
                                    </div>
                                </div>
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Rate</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">68.4%</span>
                                </div>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed max-w-xl mb-12">
                                Standardized technical evaluations used by fortune 500 recruiters to verify engineering depth.
                            </p>

                            <div className="mt-auto flex items-center">
                                <div className="flex gap-4">
                                    {[
                                        { label: 'Cloud Architecture', icon: <Cpu size={14} /> },
                                        { label: 'Data Science', icon: <Brain size={14} /> },
                                        { label: 'Fullstack', icon: <Terminal size={14} /> }
                                    ].map((tag, i) => (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                                            {tag.icon} {tag.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Decorative Geometry */}
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    </BentoCard>

                    {/* 7. GLOBAL LEADERBOARD (Social Competitive) */}
                    <BentoCard
                        className="md:col-span-12 lg:col-span-8 bg-slate-900 border-0 group overflow-hidden shadow-2xl"
                        onClick={() => navigate('/leaderboard')}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F172A_0%,#020617_100%)]" />
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.1),transparent_50%)]" />

                        <div className="p-12 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                                        <Award size={40} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Rank Pulse</span>
                                        <h3 className="text-4xl font-black text-white tracking-tighter">Global Leaderboard</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Season Progress</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-amber-500"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '74%' }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </div>
                                        <span className="text-xs font-black text-white">74%</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl mb-12">
                                Join the elite 1% of the global community. Your engineering journey, quantified and celebrated across institutional tiers.
                            </p>

                            <div className="mt-auto flex items-center justify-center pt-8 border-t border-white/[0.05]">
                                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                                    View Global Standings
                                </button>
                            </div>
                        </div>
                    </BentoCard>

                    {/* 8. SCHOLARSHIP HUB (Institutional Support) */}
                    {/* 8. BUILDER HUB (Project Showcase) */}
                    <BentoCard
                        className="md:col-span-12 lg:col-span-4 flex flex-col group border-indigo-500/5 shadow-xl bg-[#F9FAFB] dark:bg-white/[0.01]"
                        onClick={() => navigate('/projects')}
                    >
                        <div className="p-12 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl group-hover:rotate-[15deg] transition-transform duration-500">
                                    <Rocket size={32} />
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest italic">Best in Build</span>
                                </div>
                            </div>

                            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-[0.9]">Builder <br />Showcase</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed mb-12">
                                Curate institutional-grade projects and showcase your best technical work to the world.
                            </p>

                            <div className="mt-auto flex items-center justify-end">
                                <ArrowRight className="text-slate-300 dark:text-white/10 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all duration-500" size={24} />
                            </div>
                        </div>
                    </BentoCard>

                </div>

                {/* Studio Ecosystem Footer */}
                <div className="mt-32 border-t border-slate-200 dark:border-white/[0.05] pt-12">
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                        {['Institutional Partners', 'Elite Mentorship', 'Verified Careers', 'Neural Evaluation'].map(item => (
                            <div key={item} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 hover:text-indigo-500 transition-colors duration-500 cursor-default">
                                <div className="w-1 h-1 rounded-full bg-indigo-500/40" /> {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};



// --- JOURNEY SECTION using TracingBeam ---

const Journey = () => {
    const steps = [
        {
            title: "Build Your Foundation",
            desc: "Start with our curated Learning Paths. Whether you want to master React, explore System Design, or dive into AI, we have a roadmap for you.",
            icon: <Brain />,
            img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Prove Your Skills",
            desc: "Theory is not enough. Enter the Arena. Compete in daily challenges and global Hackathons to earn badges and climb the leaderboard.",
            icon: <Code2 />,
            img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Connect with Experts",
            desc: "Stuck on a bug? Need career advice? Book a 1:1 session with mentors from top tech companies who have been in your shoes.",
            icon: <Users />,
            img: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Get Hired",
            desc: "Your profile acts as your dynamic resume. Recruiters can see your code, your wins, and your growth. Apply with one click.",
            icon: <Rocket />,
            img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
        },
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
            <div className="max-w-7xl mx-auto px-6">
                <SectionHeaders
                    subtitle="Your Journey"
                    title="From Hello World to Offer Letter."
                />

                <TracingBeam className="px-6">
                    <div className="flex flex-col gap-24 relative pt-10">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative pl-8 md:pl-12 group">
                                {/* Dot on timeline */}
                                <div className="absolute left-[3px] md:left-[3px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 group-hover:border-indigo-500 group-hover:bg-indigo-500 transition-colors z-20" />

                                <div className="grid md:grid-cols-2 gap-10 items-center">
                                    <div className="order-2 md:order-1">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                                            {step.icon}
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                            <span className="text-indigo-500 mr-2">0{idx + 1}.</span> {step.title}
                                        </h3>
                                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                    <div className="order-1 md:order-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
                                        <img src={step.img} alt={step.title} className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TracingBeam>
            </div>
        </section>
    );
};

const CTA = () => {
    const navigate = useNavigate();

    return (
        <section className="py-32 px-6 relative overflow-hidden bg-white dark:bg-[#040404]">
            {/* Ambient Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="relative rounded-[3.5rem] overflow-hidden bg-slate-900 border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
                >
                    {/* Interior Decorative Mesh */}
                    <div className="absolute inset-0 bg-[#0A0A0E]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-70" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    </div>

                    {/* Glowing Content Container */}
                    <div className="relative z-10 flex flex-col items-center text-center py-20 px-8 md:py-28 md:px-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-md"
                        >
                            <Sparkles size={12} /> The Future Of Learning
                        </motion.div>

                        <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                            Engineering <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">Your Success.</span>
                        </h2>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-14 font-medium leading-relaxed">
                            Join a global community of elite developers. Access institutional-grade tools, expert mentorship, and high-tier career opportunities.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="group relative px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Start Your Journey <ArrowRight size={16} />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>


                        </div>
                    </div>

                    {/* Abstract Decorative Shapes */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px]" />
                    <div className="absolute -left-20 -top-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px]" />
                </motion.div>
            </div>
        </section>
    );
};

// --- MAIN PAGE ---

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] overflow-x-hidden selection:bg-indigo-500/30">
            <Hero />
            <MasterHub />
            <FeaturesCatalog />
            <Journey />
            <CTA />
        </div>
    );
}