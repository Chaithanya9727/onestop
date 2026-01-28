/* eslint-disable react/no-unescaped-entities */
import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Trophy, Briefcase, Users, Code2, Shield, Zap,
    Rocket, Terminal, Brain, GraduationCap, Globe,
    CheckCircle2, ArrowRight, Sparkles, Target,
    ChevronRight, Play, Search
} from 'lucide-react';
import { TracingBeam } from '../components/ui/TracingBeam';

// --- SHARED UI COMPONENTS ---

const SectionHeaders = ({ title, subtitle, center = true }) => (
    <div className={`mb-16 ${center ? 'text-center' : 'text-left'}`}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-bold tracking-wide uppercase mb-4"
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

const BentoCard = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -5 }}
        className={`bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden ${className}`}
    >
        {children}
    </motion.div>
);

// --- SECTIONS ---

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background with Video/Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-50/80 to-slate-50 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950 z-10" />
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-30 dark:opacity-20"
                >
                    <source src="./compass.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md mb-8 shadow-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        Development Ecosystem
                    </span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.9]">
                    Dream.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                        Build.
                    </span>{' '}
                    Achieve.
                </h1>

                <p className="text-xl md:text-2xl font-body text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                    The all-in-one ecosystem for developers. Learn, compete, and get hired by world-class companies.
                </p>

                {/* Unstop-style Search Bar */}
                <div className="max-w-2xl mx-auto mb-12 relative z-30">
                    <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 p-2 rounded-full shadow-2xl flex items-center transition-all hover:shadow-indigo-500/20 hover:border-indigo-500/30">
                        <div className="pl-6 text-slate-400">
                            <Search size={24} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search hackathons, jobs, or mentors..."
                            className="w-full bg-transparent border-none outline-none px-4 py-3 text-lg font-bold text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-body"
                        />
                        <button
                            onClick={() => navigate('/events')}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 font-bold text-base transition-all active:scale-95 shadow-lg shadow-blue-600/30"
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                        <span>Trending:</span>
                        <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">#Hackathons</span>
                        <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">#Internships</span>
                        <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">#DataScience</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/events')}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold font-display text-lg flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                    >
                        Start Competing <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>
        </section>
    );
};

const EcosystemGrid = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
            <SectionHeaders
                subtitle="The Platform"
                title="Everything you need to succeed."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-auto gap-6 h-auto">

                {/* 1. COMPETE (Large) */}
                <BentoCard className="md:col-span-2 md:row-span-2 min-h-[400px] relative group cursor-pointer border-0 shadow-xl shadow-blue-900/5 overflow-hidden" onClick={() => navigate('/events')}>
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 z-0"></div>
                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-900/90 z-10 opacity-100 transition-opacity" />
                    <img
                        src="https://images.unsplash.com/photo-1504384308090-c54be3852d33?auto=format&fit=crop&q=80"
                        alt="Hackathon"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:scale-105 transition-transform duration-700 z-0"
                    />
                    <div className="relative z-20 p-8 h-full flex flex-col justify-between text-white">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 border border-white/20 shadow-lg">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-display font-black text-white mb-3 tracking-tight">Compete & Win</h3>
                            <p className="text-blue-100 font-body font-medium text-lg leading-relaxed max-w-md">
                                Join global hackathons, coding contests, and algorithm battles. Win cash prizes and recognition.
                            </p>
                            <div className="mt-8 flex gap-2">
                                <span className="px-4 py-2 bg-white text-blue-900 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                    Explore Contests <ArrowRight size={12} />
                                </span>
                            </div>
                        </div>
                    </div>
                </BentoCard>

                {/* 2. JOBS (Tall) */}
                {/* 2. JOBS (Tall) */}
                <BentoCard className="md:col-span-1 md:row-span-2 min-h-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 relative group cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden" onClick={() => navigate('/jobs')}>
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="-rotate-45 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 border border-blue-100 dark:border-blue-500/20">
                            <Briefcase size={28} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Find a Job</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 flex-grow font-body text-sm leading-relaxed">
                            Apply to 500+ top companies with a single profile. No spam, just interviews.
                        </p>

                        {/* Decorative Resume List */}
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                                    <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="ml-auto text-green-600 text-[10px] font-bold uppercase bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">Matched</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </BentoCard>

                {/* 3. MENTORSHIP (Standard) */}
                {/* 3. MENTORSHIP (Standard) */}
                <BentoCard className="min-h-[220px] cursor-pointer group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none" onClick={() => navigate('/mentors')}>
                    <div className="p-6 h-full flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-500/20">
                                <Users size={24} />
                            </div>
                            <ArrowRight className="text-slate-300 group-hover:text-orange-500 transition-colors -rotate-45 group-hover:rotate-0" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">Mentorship</h3>
                            <p className="text-sm font-medium text-slate-500">1:1 guidance from FAANG engineers.</p>
                        </div>
                    </div>
                </BentoCard>

                {/* 4. LEARNING (Standard) */}
                <BentoCard className="min-h-[220px] cursor-pointer group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none" onClick={() => navigate('/resources')}>
                    <div className="p-6 h-full flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-500/20">
                                <GraduationCap size={24} />
                            </div>
                            <ArrowRight className="text-slate-300 group-hover:text-green-500 transition-colors -rotate-45 group-hover:rotate-0" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">Practice</h3>
                            <p className="text-sm font-medium text-slate-500">Solve problems & learn concepts.</p>
                        </div>
                    </div>
                </BentoCard>

                {/* 5. RESUME SHIELD (Wide) */}
                {/* 5. RESUME SHIELD (Wide) */}
                <BentoCard className="md:col-span-2 cursor-pointer group relative overflow-hidden border-0 bg-slate-900" onClick={() => navigate('/resume-shield')}>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                    <div className="relative z-10 p-8 flex items-center justify-between h-full">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1 px-2 rounded bg-white/10 text-indigo-300 font-bold uppercase tracking-wider text-[10px]">AI Powered</div>
                            </div>
                            <h3 className="text-3xl font-display font-black text-white mb-2">Resume Shield</h3>
                            <p className="text-slate-400 max-w-xs font-medium text-sm">Analyze your resume score before applying.</p>
                        </div>
                        <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-full border-4 border-green-500/30 text-green-400 bg-green-500/10 backdrop-blur-md">
                            <div className="text-3xl font-black">98<span className="text-lg">%</span></div>
                        </div>
                    </div>
                </BentoCard>

                {/* 6. COMMUNITY (Wide) */}
                {/* 6. COMMUNITY (Wide) */}
                <BentoCard className="md:col-span-2 cursor-pointer group bg-gradient-to-r from-pink-600 to-rose-600 border-0" onClick={() => navigate('/community')}>
                    <div className="p-8 flex items-center gap-6 text-white h-full relative overflow-hidden">
                        <Globe className="w-48 h-48 absolute -right-12 -bottom-12 opacity-10 rotate-12" />
                        <div className="relative z-10">
                            <h3 className="text-3xl font-display font-black mb-2">Community</h3>
                            <p className="text-pink-100 font-medium max-w-sm">Connect with 100k+ developers. Discuss, share, and grow together.</p>
                        </div>
                        <div className="ml-auto relative z-10 hidden sm:block">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                <ArrowRight className="text-white" />
                            </div>
                        </div>
                    </div>
                </BentoCard>

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
        <section className="py-32 px-6">
            <div className="max-w-6xl mx-auto relative rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800">

                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>

                <div className="absolute -left-20 -top-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px]"></div>

                <div className="relative z-10 flex flex-col items-center text-center p-12 md:p-24">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
                        Ready to level up?
                    </h2>
                    <p className="text-xl text-slate-300 max-w-2xl mb-12">
                        Join 100,000+ developers building the future. Your career acceleration starts today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                            Get Started Free <Rocket className="text-indigo-600" size={20} />
                        </button>
                        <button onClick={() => navigate('/events')} className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                            Explore Hackathons
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

// --- MAIN PAGE ---

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] overflow-x-hidden selection:bg-indigo-500/30">
            <Hero />
            <EcosystemGrid />
            <Journey />
            <CTA />
        </div>
    );
}