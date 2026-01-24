import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import { 
  Clock, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, 
  Flag, Trophy, AlertTriangle, Eye, Loader, XCircle
} from "lucide-react";
import { useToast } from "../../components/ToastProvider.jsx";

export default function PlayQuiz() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { showToast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizData, setQuizData] = useState(null);
  
  const [status, setStatus] = useState("start"); // start, active, finish, terminated
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [result, setResult] = useState(null); 
  
  // PROCTORING STATE
  const [warnings, setWarnings] = useState(0);
  const videoRef = useRef(null);
  const [cameraAllowed, setCameraAllowed] = useState(false);

  // Load Quiz
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await get(`/events/${eventId}/quiz`);
        if (!res.questions || res.questions.length === 0) {
            setError("Quiz not yet available.");
            return;
        }
        setQuizData(res);
        setTimeLeft(res.duration * 60);
      } catch (err) {
        setError("Failed to load quiz or not authorized.");
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [eventId]);

  // Request Camera & Fullscreen on Start
  const startQuiz = async () => {
     try {
        // 1. Camera Access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraAllowed(true);

        // 2. Fullscreen
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
        
        setStatus("active");
     } catch (err) {
        showToast("Camera access & Fullscreen required!", "error");
        console.error(err);
     }
  };

  // Proctoring Listeners
  useEffect(() => {
     if (status !== "active") return;

     // 1. Tab Switch / Blur
     const handleBlur = () => {
        handleViolation("Tab Switch / Focus Lost");
     };

     // 2. Fullscreen Exit
     const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
           handleViolation("Exited Fullscreen Mode");
        }
     };

     // 3. Disable Context Menu (Right Click)
     const handleContextMenu = (e) => {
        e.preventDefault();
        // handleViolation("Right Click Attempted"); // Optional: strict warning
     };

     // 4. Disable Copy/Paste
     const handleCopyPaste = (e) => {
        e.preventDefault();
        handleViolation("Copy/Paste Attempted");
     };
     
     // 5. Disable DevTool Keys (F12, Ctrl+Shift+I)
     const handleKeyDown = (e) => {
        if (
           e.key === "F12" || 
           (e.ctrlKey && e.shiftKey && e.key === "I") || 
           (e.ctrlKey && e.shiftKey && e.key === "J") || 
           (e.ctrlKey && e.key === "u")
        ) {
           e.preventDefault();
           handleViolation("Inspector Key Attempted");
        }
     };

     window.addEventListener("blur", handleBlur);
     document.addEventListener("visibilitychange", () => {
        if (document.hidden) handleViolation("Tab Hidden");
     });
     document.addEventListener("fullscreenchange", handleFullscreenChange);
     document.addEventListener("contextmenu", handleContextMenu);
     document.addEventListener("copy", handleCopyPaste);
     document.addEventListener("paste", handleCopyPaste);
     document.addEventListener("cut", handleCopyPaste);
     document.addEventListener("keydown", handleKeyDown);

     return () => {
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("copy", handleCopyPaste);
        document.removeEventListener("paste", handleCopyPaste);
        document.removeEventListener("cut", handleCopyPaste);
        document.removeEventListener("keydown", handleKeyDown);
     };
  }, [status, warnings]);

  // Violation Handler
  const handleViolation = (reason) => {
     if (status !== "active") return;
     
     setWarnings(prev => {
        const newCount = prev + 1;
        showToast(`⚠️ Warning ${newCount}/3: ${reason}`, "error");
        
        if (newCount >= 3) {
           terminateQuiz("Exceeded Violation Limit (3/3)");
           return 3;
        }
        return newCount;
     });
  };

  const terminateQuiz = (reason) => {
     setStatus("terminated");
     handleSubmit(true, reason); 
  };

  // Timer
  useEffect(() => {
    if (status !== "active" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  // Handle Answer
  const handleSelect = (qId, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  // Submit
  const handleSubmit = async (forced = false, reason = null) => {
    if (status === "submitting" || status === "finish") return;
    setStatus("submitting");
    try {
      const payload = {
         answers,
         violationCount: warnings,
         terminationReason: reason
      };
      
      const res = await post(`/events/${eventId}/quiz/submit`, payload);
      setResult(res);
      setStatus(reason ? "terminated" : "finish"); // Keep "terminated" state if reason exists
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch (err) {
      setError("Submission failed. Please try again.");
      setStatus("active");
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return <div className="h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center"><Loader className="animate-spin text-blue-600" size={40}/></div>;
  
  if (error) return (
    <div className="h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-slate-900 dark:text-white gap-6 transition-colors duration-300">
       <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full text-red-500"><XCircle size={48}/></div>
       <h1 className="text-3xl font-black">{error}</h1>
       <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans overflow-hidden relative selection:bg-blue-500/30 transition-colors duration-300">
       
       <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200 dark:bg-slate-800/20 rounded-full blur-[120px] transition-colors" />
       </div>

       {/* START SCREEN */}
       {status === "start" && (
          <div className="h-screen flex flex-col items-center justify-center p-6 text-center relative z-10">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl w-full">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-lg shadow-blue-500/10">
                   <Flag size={48} className="text-blue-600 dark:text-blue-500"/>
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">
                   Strict Mode On
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 font-medium">
                   This quiz requires <span className="text-red-500 dark:text-red-400 font-bold">Camera Access</span> and <span className="text-red-500 dark:text-red-400 font-bold">Fullscreen</span>.
                </p>
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 p-6 rounded-2xl mb-12 text-sm text-red-600 dark:text-red-300 font-bold flex items-start justify-center gap-3">
                   <AlertTriangle className="shrink-0" size={20}/>
                   <span className="text-left">Switching tabs or exiting fullscreen will result in a warning. 3 warnings = Auto Submit.</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12 max-w-lg mx-auto">
                   <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                      <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{quizData.questions.length}</div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Questions</div>
                   </div>
                   <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                      <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{quizData.duration}m</div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Duration</div>
                   </div>
                   <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                      <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">PROCTOR</div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Mode</div>
                   </div>
                </div>
                <button 
                  onClick={startQuiz}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-xl font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all w-full md:w-auto flex items-center justify-center gap-3"
                >
                   <Eye size={24}/> Grant Access & Start
                </button>
             </motion.div>
          </div>
       )}

       {/* ACTIVE QUIZ */}
       {status === "active" && (
          <div className="h-screen flex flex-col relative z-20">
             
             {/* PROCTOR OVERLAY (WEBCAM) */}
             <div className="absolute top-24 right-6 w-48 h-36 bg-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xl z-50">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90" />
                <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                   <span className="text-[10px] font-bold text-white uppercase tracking-wider">Rec</span>
                </div>
             </div>

             {/* WARNINGS */}
             {warnings > 0 && (
                <div className="absolute top-24 left-6 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold border-4 border-red-600 animate-bounce z-50 shadow-xl">
                   Warnings: {warnings}/3
                </div>
             )}

             {/* Header */}
             <div className="h-24 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 md:px-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 text-lg border border-slate-200 dark:border-white/5 shadow-sm">
                      Q{currentQ + 1}
                   </div>
                   <div className="h-3 w-32 md:w-80 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQ + 1) / quizData.questions.length) * 100}%` }}
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                      />
                   </div>
                </div>
                <div className={`flex items-center gap-3 px-5 py-3 rounded-xl font-mono text-xl font-bold border transition-colors ${timeLeft < 60 ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5'}`}>
                   <Clock size={20}/> {formatTime(timeLeft)}
                </div>
             </div>

             {/* Main Question Area */}
             <div className="flex-1 container mx-auto px-6 py-12 flex flex-col items-center justify-center max-w-5xl">
                 <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentQ}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full"
                    >
                       <h2 className="text-3xl md:text-4xl font-black leading-tight mb-16 text-center text-slate-900 dark:text-white">
                          {quizData.questions[currentQ].question}
                       </h2>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                          {quizData.questions[currentQ].options.map((opt, idx) => {
                             const isSelected = answers[quizData.questions[currentQ]._id] === idx;
                             return (
                                <button
                                   key={idx}
                                   onClick={() => handleSelect(quizData.questions[currentQ]._id, idx)}
                                   className={`p-6 rounded-3xl text-left border-2 transition-all flex items-center justify-between group relative overflow-hidden
                                      ${isSelected 
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 shadow-xl shadow-blue-600/10 dark:shadow-none' 
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                      }
                                   `}
                                >
                                   <div className="flex items-center gap-5 relative z-10">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 group-hover:border-slate-400'}`}>
                                         {String.fromCharCode(65 + idx)}
                                      </div>
                                      <span className={`text-xl font-bold ${isSelected ? 'text-blue-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{opt}</span>
                                   </div>
                                   {isSelected && <CheckCircle className="text-blue-600 dark:text-blue-500 relative z-10" size={24}/>}
                                </button>
                             );
                          })}
                       </div>
                    </motion.div>
                 </AnimatePresence>
             </div>

             {/* Footer Nav */}
             <div className="h-24 border-t border-slate-200 dark:border-white/10 flex items-center justify-between px-6 md:px-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <button 
                   onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
                   disabled={currentQ === 0}
                   className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 font-bold px-6 py-3 transition-colors text-lg"
                >
                   <ChevronLeft size={24}/> Previous
                </button>
                
                {currentQ === quizData.questions.length - 1 ? (
                   <button 
                      onClick={() => handleSubmit(false)}
                      className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 hover:scale-105 transition-all flex items-center gap-2 text-lg"
                   >
                      Submit Quiz <CheckCircle size={24}/>
                   </button>
                ) : (
                   <button 
                      onClick={() => setCurrentQ(p => Math.min(quizData.questions.length - 1, p + 1))}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2 text-lg"
                   >
                       Next <ChevronRight size={24}/>
                   </button>
                )}
             </div>
          </div>
       )}

       {/* RESULTS */}
       {(status === "finish" || status === "terminated") && result && (
          <div className="h-screen flex flex-col items-center justify-center relative z-20 p-6">
             {status !== "terminated" && <ReactConfetti recycle={false} numberOfPieces={500}/>}
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-12 rounded-[3rem] text-center max-w-lg w-full shadow-2xl"
             >
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl ${status === 'terminated' ? 'bg-red-50 dark:bg-red-500/20 text-red-500' : 'bg-yellow-50 dark:bg-yellow-400/20 text-yellow-500 dark:text-yellow-400'}`}>
                   {status === 'terminated' ? <AlertTriangle size={48}/> : <Trophy size={48}/>}
                </div>
                
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{status === 'terminated' ? 'Quiz Terminated' : 'Quiz Completed!'}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium">{status === 'terminated' ? 'You exceeded the violation limit. Your answers have been auto-submitted.' : 'Your submission has been recorded successfully.'}</p>
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 mb-10 border border-slate-200 dark:border-slate-800">
                   <p className="text-sm text-slate-400 uppercase font-black tracking-widest mb-3">Your Score</p>
                   <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                      {result.score} <span className="text-3xl text-slate-400 dark:text-slate-600 font-bold">/ {result.maxScore}</span>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <button 
                      onClick={() => navigate(`/events/${eventId}`)}
                      className="px-8 py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-2xl transition-colors"
                   >
                      Back to Event
                   </button>
                   <button 
                      onClick={() => navigate(`/leaderboard`)}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105"
                   >
                      View Leaderboard
                   </button>
                </div>
             </motion.div>
          </div>
       )}

    </div>
  );
}
