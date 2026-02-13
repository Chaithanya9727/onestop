import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, StopCircle, Sparkles, Loader, Play, User, BrainCircuit, Building2, Briefcase, GraduationCap, ArrowRight, CheckCircle, Info, ChevronRight, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import useApi from '../hooks/useApi';
import { useToast } from '../components/ToastProvider';
import Confetti from 'react-confetti';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

export default function MockInterviewBot() {
   const { post } = useApi();
   const { showToast } = useToast();

   // Refs
   const videoRef = useRef(null);
   const synthesisRef = useRef(window.speechSynthesis);

   const { user } = useAuth();
   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

   // Application State
   const [step, setStep] = useState('config'); // 'config' | 'interview'
   const [config, setConfig] = useState({
      role: "Software Engineer",
      company: "Google",
      yearsOfExperience: "0-2 Years",
      topic: "Data Structures & Algorithms"
   });

   // Interview Content
   const [questions, setQuestions] = useState([]);
   const [activeQuestion, setActiveQuestion] = useState(0);
   const [loadingQuestions, setLoadingQuestions] = useState(false);

   // Interaction State
   const [isRecording, setIsRecording] = useState(false);
   const [mediaRecorder, setMediaRecorder] = useState(null);
   const [audioChunks, setAudioChunks] = useState([]);
   const [audioBlob, setAudioBlob] = useState(null);

   // Keep minimal state for UI feedback
   const [transcript, setTranscript] = useState("");
   // Note: Real-time transcript is harder with just MediaRecorder without streaming to a service. 
   // We will rely on the backend final transcript, but show "Recording..." state.

   const [feedback, setFeedback] = useState(null);
   const [analyzing, setAnalyzing] = useState(false);
   const [cameraActive, setCameraActive] = useState(false);
   const [audioEnabled, setAudioEnabled] = useState(true);
   const [timer, setTimer] = useState(0);
   const [showConfetti, setShowConfetti] = useState(false);
   const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

   // MCQ State
   const [selectedOption, setSelectedOption] = useState(null);
   const [mcqResult, setMcqResult] = useState(null);

   // Avatar State
   const [aiSpeaking, setAiSpeaking] = useState(false);

   useEffect(() => {
      const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener('resize', handleResize);

      // Initialize Media Recorder permission early (optional)
      navigator.mediaDevices.getUserMedia({ audio: true })
         .then(stream => {
            // Permission granted
         })
         .catch(err => console.error("Mic permission denied", err));

      return () => {
         window.removeEventListener('resize', handleResize);
         stopCamera();
         if (synthesisRef.current) synthesisRef.current.cancel();
      };
   }, []);

   useEffect(() => {
      let interval;
      if (isRecording) interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
   }, [isRecording]);

   // Auto-Speak Question
   useEffect(() => {
      if (step === 'interview' && !loadingQuestions && questions.length > 0 && audioEnabled) {
         const q = questions[activeQuestion];
         const text = typeof q === 'string' ? q : q.question;
         speak(text);
      }
   }, [activeQuestion, questions, step, loadingQuestions, audioEnabled]);

   // ----------------------------------------------------------------------------------
   // Logic
   // ----------------------------------------------------------------------------------

   const speak = (text) => {
      if (!synthesisRef.current) return;
      synthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthesisRef.current.getVoices();
      const voice = voices.find(v => v.name.includes("Google US English")) || voices.find(v => v.lang === 'en-US');
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => setAiSpeaking(false);
      utterance.onerror = () => setAiSpeaking(false);
      synthesisRef.current.speak(utterance);
   };

   const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
   };

   const startInterview = async () => {
      if (!user) {
         setIsAuthModalOpen(true);
         return;
      }
      if (!config.role || !config.company) return showToast("Please fill in role and company", "error");
      setLoadingQuestions(true);
      setStep('interview');
      try {
         // Pass the user's scenario to AI
         const res = await post('/ai/interview/questions', {
            role: config.role,
            company: config.company,
            experience: config.yearsOfExperience,
            topic: config.topic,
            difficulty: "Hard" // Default to hard for "Company mode"
         });
         if (res?.questions) setQuestions(res.questions);
      } catch (e) {
         console.error(e);
         setQuestions([
            { type: "text", question: `Tell me about yourself and why you want to join ${config.company}.` },
            { type: "text", question: `Describe a challenging technical problem you solved as a ${config.role}.` }
         ]);
      } finally {
         setLoadingQuestions(false);
      }
   };

   const startCamera = async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
         if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
         }
      } catch (err) { showToast("Camera access failed", "error"); }
   };

   const stopCamera = () => {
      if (videoRef.current?.srcObject) {
         videoRef.current.srcObject.getTracks().forEach(t => t.stop());
         setCameraActive(false);
      }
   };

   const toggleRecording = async () => {
      if (isRecording) {
         // Stop Recording
         if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
         }
      } else {
         // Start Recording
         setTranscript("");
         setFeedback(null);
         setTimer(0);
         setAudioChunks([]);
         setAudioBlob(null);

         try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
               if (e.data.size > 0) {
                  setAudioChunks(prev => [...prev, e.data]);
               }
            };

            recorder.onstop = () => {
               // Create blob when stopped
               // We need to wait a tick for the last chunk
               // But setting state here relies on chunks being updated. 
               // Better handled in a useEffect or by accessing chunks ref if needed.
               // For simplicity, we'll assume chunks update fast or handling in analyze.
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
         } catch (err) {
            console.error("Mic Error:", err);
            showToast("Could not access microphone", "error");
         }
      }
   };

   // Effect to build blob when chunks change and recording stops
   useEffect(() => {
      if (!isRecording && audioChunks.length > 0) {
         const blob = new Blob(audioChunks, { type: 'audio/webm' });
         setAudioBlob(blob);
         setTranscript("(Audio recorded. Click Submit to analyze.)");
      }
   }, [isRecording, audioChunks]);


   const analyzeAnswer = async () => {
      if (!audioBlob && !transcript) return showToast("Please record an answer first", "warning");

      setAnalyzing(true);

      const q = questions[activeQuestion];
      const qText = typeof q === 'string' ? q : q.question;

      try {
         let res;

         if (audioBlob) {
            // Send Audio
            const formData = new FormData();
            formData.append("audio", audioBlob, "answer.webm");
            formData.append("question", qText);
            formData.append("company", config.company);
            formData.append("role", config.role);

            res = await post('/ai/interview/analyze-audio', formData, true); // true for isFormData

            // Update transcript with what AI heard
            if (res.transcription) setTranscript(res.transcription);

         } else {
            // Fallback text analysis (if they used text input or old method)
            res = await post('/ai/interview/analyze', {
               question: qText,
               answer: transcript,
               company: config.company,
               role: config.role
            });
         }

         setFeedback(res);
         if (res.score >= 80) setShowConfetti(true);
      } catch (e) {
         console.error(e);
         showToast("Analysis failed", "error");
      } finally {
         setAnalyzing(false);
      }
   };

   const handleMCQ = (opt) => {
      if (selectedOption) return;
      setSelectedOption(opt);
      const q = questions[activeQuestion];
      if (opt === q.answer) { setMcqResult('correct'); setShowConfetti(true); }
      else setMcqResult('wrong');
   };

   const handleNext = () => {
      if (activeQuestion < questions.length - 1) {
         setActiveQuestion(prev => prev + 1);
         setFeedback(null); setTranscript(""); setSelectedOption(null); setMcqResult(null);
      } else {
         setStep('config'); // Go back to start
         setQuestions([]); setActiveQuestion(0);
      }
   };

   const currentQ = questions[activeQuestion];
   const isMCQ = currentQ?.type === 'mcq';

   // ----------------------------------------------------------------------------------
   // Render
   // ----------------------------------------------------------------------------------

   return (
      <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden relative selection:bg-indigo-500/30">
         <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
         {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />}

         {/* Ambient Background */}
         <div className="fixed inset-0 pointer-events-none">
            <div className={`absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] transition-all duration-1000 ${step === 'interview' ? 'opacity-50' : 'opacity-100'}`} />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
         </div>

         <div className="max-w-[1600px] mx-auto px-6 py-8 relative z-10 h-[calc(100vh-100px)] min-h-[600px] flex flex-col">

            {/* Header */}
            <header className="flex items-center justify-between mb-8 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                     <BrainCircuit className="text-white" size={24} />
                  </div>
                  <div>
                     <h1 className="text-xl font-bold tracking-tight">AI Interviewer <span className="text-indigo-500">Pro</span></h1>
                     <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                        {step === 'config' ? 'Setup Configuration' : `Interviewing for ${config.company}`}
                     </p>
                  </div>
               </div>

               {step === 'interview' && (
                  <div className="flex items-center gap-3">
                     <button onClick={() => setAudioEnabled(!audioEnabled)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
                        {audioEnabled ? <Volume2 size={20} className="text-slate-300" /> : <VolumeX size={20} className="text-red-400" />}
                     </button>
                     <button onClick={cameraActive ? stopCamera : startCamera} className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${cameraActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'}`}>
                        <Video size={18} /> {cameraActive ? "Stop Camera" : "Enable Camera"}
                     </button>
                  </div>
               )}
            </header>

            {/* CONFIG MODE */}
            <AnimatePresence mode="wait">
               {step === 'config' && (
                  <motion.div
                     key="config"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="flex-1 flex items-center justify-center"
                  >
                     <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5">
                           <h1 className="text-5xl font-black mb-6 leading-tight">
                              Ace your dream job at <br />
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{config.company || "Your Target Company"}</span>
                           </h1>
                           <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                              Customize your interview simulation. Our AI will adopt the persona of a hiring manager from your target company and test you on relevant skills.
                           </p>
                           {/* Journey Map */}
                           <div className="space-y-6">
                              {[
                                 { icon: BrainCircuit, title: "1. Configure AI Persona", desc: "Select role, company, and focus area" },
                                 { icon: Video, title: "2. Real-time Simulation", desc: "Answer questions with STAR method guidance" },
                                 { icon: CheckCircle, title: "3. Instant Analysis", desc: "Get Hiring Decision & Culture Fit score" }
                              ].map((step, i) => (
                                 <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                       <step.icon size={20} />
                                    </div>
                                    <div>
                                       <h3 className="font-bold text-white text-sm mb-1">{step.title}</h3>
                                       <p className="text-xs text-slate-400">{step.desc}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">

                           <div className="space-y-6">
                              <div>
                                 <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Target Role</label>
                                 <input
                                    type="text"
                                    value={config.role}
                                    onChange={e => setConfig({ ...config, role: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="e.g. Frontend Developer"
                                 />
                              </div>
                              <div>
                                 <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Target Company</label>
                                 <input
                                    type="text"
                                    value={config.company}
                                    onChange={e => setConfig({ ...config, company: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="e.g. Google, Amazon, Startup..."
                                 />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Experience</label>
                                    <select
                                       value={config.yearsOfExperience}
                                       onChange={e => setConfig({ ...config, yearsOfExperience: e.target.value })}
                                       className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500 transition-colors appearance-none"
                                    >
                                       <option>0-2 Years</option>
                                       <option>2-5 Years</option>
                                       <option>5-10 Years</option>
                                       <option>10+ Years</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Topic Focus</label>
                                    <input
                                       list="topics"
                                       type="text"
                                       value={config.topic}
                                       onChange={e => setConfig({ ...config, topic: e.target.value })}
                                       className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                                       placeholder="e.g. System Design, React, Leadership..."
                                    />
                                    <datalist id="topics">
                                       {/* Software & Technical */}
                                       <option value="Data Structures & Algorithms" />
                                       <option value="System Design (LLD & HLD)" />
                                       <option value="Full Stack Development" />
                                       <option value="Frontend (React, Vue, Angular)" />
                                       <option value="Backend (Node, Java, Go, Python)" />
                                       <option value="DevOps & CI/CD" />
                                       <option value="Cloud Computing (AWS, Azure, GCP)" />
                                       <option value="Cyber Security & Network Security" />
                                       <option value="Artificial Intelligence & ML" />
                                       <option value="Data Science & Analytics" />
                                       <option value="Mobile App Development (iOS/Android)" />
                                       <option value="Blockchain & Web3" />
                                       <option value="Game Development" />
                                       <option value="Embedded Systems & IoT" />

                                       {/* Core Engineering */}
                                       <option value="Mechanical Engineering Design" />
                                       <option value="Civil Engineering & Structures" />
                                       <option value="Electrical & Electronics" />
                                       <option value="Automotive Engineering" />
                                       <option value="Chemical Engineering" />
                                       <option value="Robotics & Automation" />

                                       {/* Leadership & Management */}
                                       <option value="Behavioral & Leadership Principles" />
                                       <option value="Product Management" />
                                       <option value="Project Management (Agile/Scrum)" />
                                       <option value="Engineering Management" />
                                       <option value="Sales & Business Development" />
                                       <option value="Marketing & Growth Strategy" />
                                       <option value="HR & Talent Acquisition" />
                                       <option value="Finance & Investment Banking" />
                                       <option value="Consulting & Strategy" />
                                    </datalist>
                                 </div>
                              </div>

                              <button
                                 onClick={startInterview}
                                 disabled={loadingQuestions}
                                 className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                              >
                                 {loadingQuestions ? <Loader className="animate-spin" /> : <Sparkles className="fill-white" />}
                                 {loadingQuestions ? "Acting as Hiring Manager..." : "Start Interview Simulation"}
                              </button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {step === 'interview' && (
                  <motion.div
                     key="interview"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-4"
                  >
                     {/* LEFT: AI */}
                     <div className="lg:col-span-5 flex flex-col gap-6 h-full">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 relative overflow-hidden shrink-0 group">
                           {loadingQuestions ? (
                              <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>
                           ) : (
                              <div className="relative z-10">
                                 <div className="flex justify-between items-start mb-4 opacity-50 text-xs font-bold uppercase tracking-widest">
                                    <span>Q {activeQuestion + 1} / {questions.length}</span>
                                    <span className={isMCQ ? "text-amber-400" : "text-blue-400"}>{currentQ?.type === 'mcq' ? "Technical Quiz" : "Core Interview"}</span>
                                 </div>
                                 <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2 text-white/90">
                                    {typeof currentQ === 'string' ? currentQ : currentQ?.question}
                                 </h2>
                              </div>
                           )}
                        </div>

                        {/* Avatar */}
                        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-[2rem] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                           <div className="relative">
                              <div className={`w-32 h-32 rounded-full blur-[40px] transition-all duration-300 ${aiSpeaking ? "bg-indigo-500 animate-pulse scale-125 opacity-60" : "bg-slate-700 opacity-20 scale-100"}`} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className={`w-24 h-24 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-black/50 backdrop-blur-sm ${aiSpeaking ? "border-indigo-400 shadow-[0_0_30px_indigo]" : "border-white/10"}`}>
                                    {config.company === "Google" ? <span className="text-3xl font-bold text-white">G</span> : <BrainCircuit size={40} className={`transition-colors duration-300 ${aiSpeaking ? "text-indigo-400" : "text-slate-600"}`} />}
                                 </div>
                              </div>
                           </div>
                           <div className="mt-8 text-center px-6 mb-6">
                              <p className={`font-bold tracking-widest uppercase text-xs ${aiSpeaking ? "text-indigo-400 animate-pulse" : isRecording ? "text-red-400 animate-pulse" : "text-slate-500"}`}>
                                 {aiSpeaking ? `${config.company} Interviewer Speaking...` : isRecording ? "Listening..." : "Waiting..."}
                              </p>
                           </div>

                           {/* Logical Steps Guide */}
                           {!isMCQ && !feedback && (
                              <div className="w-[90%] bg-white/5 border border-white/5 rounded-xl p-4 mb-6">
                                 <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                    <Sparkles size={14} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Suggested Response Structure</span>
                                 </div>
                                 <div className="grid grid-cols-4 gap-2 text-center">
                                    {['Situation', 'Task', 'Action', 'Result'].map((step, i) => (
                                       <div key={i} className="bg-black/40 rounded-lg p-2">
                                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Step {i + 1}</div>
                                          <div className="text-xs font-bold text-slate-200">{step}</div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* RIGHT: User */}
                     <div className="lg:col-span-7 flex flex-col h-full gap-6">
                        <div className="bg-black rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl h-[45%] shrink-0">
                           <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform scale-x-[-1] ${cameraActive ? 'opacity-100' : 'opacity-0'}`} />
                           {!cameraActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d12]">
                                 <div className="text-center text-slate-600"><User size={64} className="mx-auto mb-4 opacity-50" /> <p className="font-bold">Camera Off</p></div>
                              </div>
                           )}
                           {isRecording && (
                              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full text-red-500 text-xs font-bold uppercase animate-pulse z-20">
                                 <div className="w-2 h-2 bg-red-500 rounded-full" /> REC {formatTime(timer)}
                              </div>
                           )}
                           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                              {!isMCQ && (
                                 <button onClick={toggleRecording} className={`p-6 rounded-full transition-all shadow-2xl ${isRecording ? "bg-red-500 text-white" : "bg-white text-black hover:bg-indigo-50"}`}>
                                    {isRecording ? <div className="w-8 h-8 bg-white rounded-md" /> : <Mic size={32} className="text-indigo-600" />}
                                 </button>
                              )}
                           </div>
                        </div>

                        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 overflow-hidden flex flex-col shadow-inner min-h-0">
                           {isMCQ ? (
                              <div className="flex-1 flex flex-col justify-center gap-4 max-w-2xl mx-auto w-full">
                                 <div className="grid grid-cols-1 gap-3">
                                    {currentQ?.options?.map((opt, i) => (
                                       <button key={i} onClick={() => handleMCQ(opt)} disabled={!!selectedOption}
                                          className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${selectedOption ? (opt === currentQ.answer ? "bg-green-500/20 border-green-500 text-green-300" : selectedOption === opt ? "bg-red-500/20 border-red-500 text-red-300" : "opacity-30 border-white/5") : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                                          {opt}
                                       </button>
                                    ))}
                                 </div>
                                 {selectedOption && <div className="flex justify-end"><button onClick={handleNext} className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2">Next <ChevronRight size={18} /></button></div>}
                              </div>
                           ) : (
                              <div className="flex flex-col h-full">
                                 {!feedback ? (
                                    <>
                                       <div className="flex-1 overflow-y-auto noscrollbar mb-4 space-y-2">
                                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest sticky top-0 bg-[#0c0c0f] py-2">Transcript</h3>
                                          <div className="text-lg font-medium text-slate-200">{transcript || <span className="opacity-20 italic">Listening...</span>}</div>
                                       </div>
                                       {transcript && !isRecording && (
                                          <button onClick={analyzeAnswer} disabled={analyzing} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                             {analyzing ? <Loader className="animate-spin" /> : <Sparkles className="fill-white" />} {analyzing ? "Evaluting Fit..." : "Submit Answer"}
                                          </button>
                                       )}
                                    </>
                                 ) : (
                                    <div className="flex-1 overflow-y-auto noscrollbar pr-2">
                                       <div className="flex items-center justify-between mb-6">
                                          <div className="text-3xl font-black text-white">{feedback.score}<span className="text-lg text-slate-500">/100</span></div>
                                          <button onClick={handleNext} className="px-6 py-2 bg-white/10 border border-white/10 rounded-lg text-sm font-bold">Next Question</button>
                                       </div>

                                       {/* Hiring Decision Badge */}
                                       {feedback.hiringDecision && (
                                          <div className={`mb-4 p-3 rounded-xl border text-center font-bold uppercase tracking-widest ${feedback.hiringDecision.includes("Strong Hire") ? "bg-green-500/20 border-green-500 text-green-400" :
                                             feedback.hiringDecision.includes("No Hire") ? "bg-red-500/20 border-red-500 text-red-400" : "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                                             }`}>
                                             Decision: {feedback.hiringDecision}
                                          </div>
                                       )}

                                       <div className="space-y-4 text-sm">
                                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                             <h4 className="text-indigo-400 font-bold mb-2">Recruiter Feedback</h4>
                                             <p className="text-slate-300 leading-relaxed">{feedback.feedback}</p>
                                          </div>
                                          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                             <h4 className="text-purple-300 font-bold mb-2">Culture Fit Analysis</h4>
                                             <p className="text-purple-200/70">{feedback.cultureFit || "Medium"} match for {config.company}.</p>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
}
