import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../hooks/useApi";
import { Link } from "react-router-dom";
import {
    Brain, Sparkles, CheckCircle, XCircle, ArrowRight, RefreshCw, Loader, Trophy, AlertCircle, ChevronLeft,
    Code, Database, Globe, Server, Terminal, Cpu, Layout, Clock, Zap, Target
} from "lucide-react";
import confetti from "canvas-confetti";

// Topic Icons Mapping
const TOPICS = [
    { id: "React", icon: Code, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { id: "Node.js", icon: Server, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
    { id: "Python", icon: Terminal, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { id: "JavaScript", icon: Code, color: "text-yellow-300", bg: "bg-yellow-300/10", border: "border-yellow-300/20" },
    { id: "SQL", icon: Database, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    { id: "System Design", icon: Layout, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
];

const DIFFICULTIES = [
    { id: "Beginner", label: "Rookie", color: "from-green-400 to-emerald-600" },
    { id: "Intermediate", label: "Pro", color: "from-yellow-400 to-orange-500" },
    { id: "Advanced", label: "Expert", color: "from-red-500 to-pink-600" },
];

export default function QuizGenerator() {
    const { post } = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Modes: 'config', 'quiz', 'result'
    const [mode, setMode] = useState("config");

    // Config State
    const [config, setConfig] = useState({
        topic: "React",
        difficulty: "Intermediate",
        count: 5
    });
    const [customTopic, setCustomTopic] = useState("");

    // Quiz Gameplay State
    const [quizData, setQuizData] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [timeTaken, setTimeTaken] = useState(0);

    // Timer Effect
    useEffect(() => {
        let interval;
        if (mode === "quiz" && startTime) {
            interval = setInterval(() => {
                setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [mode, startTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStart = async () => {
        const finalTopic = customTopic.trim() || config.topic;
        if (!finalTopic) return;

        setLoading(true);
        setError("");
        try {
            const data = await post("/ai/quiz/generate", { ...config, topic: finalTopic });
            if (data.questions && data.questions.length > 0) {
                setQuizData(data);
                setMode("quiz");
                setCurrentQ(0);
                setAnswers({});
                setScore(0);
                setStartTime(Date.now());
                setTimeTaken(0);
            } else {
                setError("Failed to generate questions. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("AI Service unavailable. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (option) => {
        setAnswers({ ...answers, [currentQ]: option });
    };

    const handleNext = () => {
        if (currentQ < quizData.questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        let s = 0;
        quizData.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) s++;
        });
        setScore(s);
        setMode("result");
        if (s > quizData.questions.length / 2) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#ec4899', '#8b5cf6'] });
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white py-10 px-4 relative overflow-hidden font-sans select-none flex items-center justify-center">

            {/* 🌌 Animated Background Mesh */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-pink-600/10 rounded-full blur-[120px] animate-pulse delay-2000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150"></div>
            </div>

            <div className="max-w-4xl w-full mx-auto relative z-10">

                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <Link to="/practice" className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl backdrop-blur-md transition-all group">
                        <ChevronLeft className="text-slate-400 group-hover:text-white transition-colors" size={24} />
                    </Link>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                            <Brain className="text-indigo-400 fill-indigo-400/20" size={24} />
                            <span className="font-black text-xl tracking-tighter">OneStop<span className="text-indigo-400">Quiz</span></span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">AI Powered Assessment</div>
                    </div>
                    <div className="w-12"></div>
                </header>

                <AnimatePresence mode="wait">
                    {mode === "config" && (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                                    Test your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Technical Mastery</span>
                                </h1>
                                <p className="text-slate-400 text-lg font-medium max-w-lg mx-auto">Generate custom quizzes instantly. Pick a topic, choose your level, and prove your skills.</p>
                            </div>

                            {/* Topic Grid */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 mb-8">
                                <label className="text-xs font-bold uppercase text-slate-500 mb-6 block tracking-widest ml-1">Select Topic</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {TOPICS.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => { setConfig({ ...config, topic: t.id }); setCustomTopic(""); }}
                                            className={`relative p-4 rounded-2xl border transition-all duration-300 group ${config.topic === t.id && !customTopic
                                                ? `bg-white/10 ${t.border} shadow-2xl shadow-indigo-500/10`
                                                : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                <t.icon className={t.color} size={20} />
                                            </div>
                                            <span className={`font-bold text-sm ${config.topic === t.id && !customTopic ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>{t.id}</span>
                                            {config.topic === t.id && !customTopic && (
                                                <motion.div layoutId="selection" className="absolute inset-0 border-2 border-indigo-500 rounded-2xl pointer-events-none" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative group">
                                    <div className="absolute items-center pointer-events-none left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Sparkles size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={customTopic}
                                        onChange={(e) => setCustomTopic(e.target.value)}
                                        placeholder="Or type any topic (e.g. 'Rust', 'Docker', 'GraphQL')..."
                                        className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl font-bold text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Difficulty & Count */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8">
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-4 block tracking-widest">Difficulty</label>
                                    <div className="flex flex-col gap-3">
                                        {DIFFICULTIES.map((d) => (
                                            <button
                                                key={d.id}
                                                onClick={() => setConfig({ ...config, difficulty: d.id })}
                                                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${config.difficulty === d.id
                                                    ? "bg-white/10 border-white/10 shadow-lg"
                                                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                                    }`}
                                            >
                                                <span className="font-bold text-sm">{d.label}</span>
                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${d.color}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-center">
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-6 block tracking-widest">Question Count: <span className="text-white">{config.count}</span></label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="100"
                                        step="5"
                                        value={config.count}
                                        onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                                    />
                                    <div className="flex justify-between mt-2 text-xs font-bold text-slate-600">
                                        <span>5</span>
                                        <span>100</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold text-sm text-center mb-6 flex items-center justify-center gap-2">
                                    <AlertCircle size={18} /> {error}
                                </motion.div>
                            )}

                            <button
                                onClick={handleStart}
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:grayscale"
                            >
                                {loading ? <Loader className="animate-spin" /> : <Zap className="fill-white" />}
                                {loading ? "Generating Quiz..." : "Start Challenge"}
                            </button>
                        </motion.div>
                    )}

                    {mode === "quiz" && quizData && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">

                                {/* Status Bar */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-lg border border-white/10 text-xs font-bold text-slate-300">
                                        <span className="text-slate-500">Q</span>
                                        <span className="text-white">{currentQ + 1}</span>
                                        <span className="text-slate-600">/</span>
                                        <span className="text-slate-500">{quizData.questions.length}</span>
                                    </div>

                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-lg border border-white/10 text-xs font-bold text-indigo-400">
                                        <Clock size={14} />
                                        <span>{formatTime(timeTaken)}</span>
                                    </div>
                                </div>

                                {/* Progress Line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQ + 1) / quizData.questions.length) * 100}%` }}
                                        transition={{ ease: "easeOut", duration: 0.5 }}
                                    />
                                </div>

                                {/* Question */}
                                <div className="min-h-[120px] mb-10 flex items-center">
                                    <motion.h2
                                        key={currentQ}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-2xl md:text-3xl font-bold leading-snug text-white"
                                    >
                                        {quizData.questions[currentQ].question}
                                    </motion.h2>
                                </div>

                                {/* Options */}
                                <div className="grid gap-4 mb-10">
                                    {quizData.questions[currentQ].options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(opt)}
                                            className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden ${answers[currentQ] === opt
                                                ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                                : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                                }`}
                                        >
                                            <div className="flex items-start gap-4 z-10 relative">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border transition-colors ${answers[currentQ] === opt
                                                    ? "bg-indigo-500 border-indigo-500 text-white"
                                                    : "bg-black/20 border-white/10 text-slate-500 group-hover:text-white group-hover:border-white/30"
                                                    }`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className={`font-bold text-lg ${answers[currentQ] === opt ? "text-white" : "text-slate-300 group-hover:text-white"}`}>{opt}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleNext}
                                        disabled={!answers[currentQ]}
                                        className="px-8 py-4 bg-white text-black font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
                                    >
                                        {currentQ === quizData.questions.length - 1 ? "Finish Quiz" : "Next Question"} <ArrowRight size={20} />
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    )}

                    {mode === "result" && quizData && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8"
                        >
                            {/* Score Card */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 text-center flex flex-col items-center">
                                    <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="88" className="stroke-white/5" strokeWidth="12" fill="none" />
                                            <motion.circle
                                                cx="96" cy="96" r="88"
                                                className="stroke-indigo-500"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={2 * Math.PI * 88}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - score / quizData.questions.length) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-6xl font-black text-white">{Math.round((score / quizData.questions.length) * 100)}%</span>
                                            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest mt-2">{score} / {quizData.questions.length} Correct</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="text-xs font-bold uppercase text-slate-500 mb-1">Time</div>
                                            <div className="text-xl font-black text-white">{formatTime(timeTaken)}</div>
                                        </div>
                                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="text-xs font-bold uppercase text-slate-500 mb-1">Accuracy</div>
                                            <div className="text-xl font-black text-emerald-400">{Math.round((score / quizData.questions.length) * 100)}%</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setMode("config"); setAnswers({}); setScore(0); }}
                                        className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/5"
                                    >
                                        <RefreshCw size={18} /> Retry
                                    </button>
                                    <Link
                                        to="/practice"
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                    >
                                        Done
                                    </Link>
                                </div>
                            </div>

                            {/* Review List */}
                            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 max-h-[80vh] overflow-y-auto noscrollbar">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Target className="text-indigo-400" /> Answer Review
                                </h3>
                                <div className="space-y-6">
                                    {quizData.questions.map((q, i) => {
                                        const isCorrect = answers[i] === q.correctAnswer;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`p-6 rounded-3xl border-2 ${isCorrect ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                                                        {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white mb-2 leading-snug">{q.question}</h4>
                                                        <div className="space-y-1.5 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-slate-500 font-bold min-w-[80px]">Your Ans:</span>
                                                                <span className={`font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>{answers[i]}</span>
                                                            </div>
                                                            {!isCorrect && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-slate-500 font-bold min-w-[80px]">Correct:</span>
                                                                    <span className="font-bold text-emerald-400">{q.correctAnswer}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="mt-4 text-sm text-slate-400 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed">
                                                            <span className="text-indigo-400 font-bold mr-2">Explanation:</span>
                                                            {q.explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
