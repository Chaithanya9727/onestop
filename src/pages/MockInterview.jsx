import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, StopCircle, Play, Sparkles, Send, Loader, AlertCircle, AlignLeft, Info, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import useApi from '../hooks/useApi';
import { useToast } from '../components/ToastProvider';

export default function MockInterviewBot() {
  const { post } = useApi();
  const { showToast } = useToast();
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Load Questions from AI on Mount
  useEffect(() => {
    fetchQuestions();
    
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const Recognition = window.webkitSpeechRecognition;
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        if(final) setTranscript(prev => prev + " " + final);
      };

      recognitionRef.current = recognition;
    } else {
      showToast("Speech recognition not supported in this browser.", "error");
    }
  }, []);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await post('/ai/interview/questions', { role: "Software Engineer", difficulty: "Medium" });
      if (res && res.questions) {
        setQuestions(res.questions);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to generate AI questions. Using fallback.", "error");
      setQuestions([
        "Tell me about a challenging project you worked on.",
        "What is your greatest strength as a developer?",
        "How do you handle conflict in a team?"
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      showToast("Could not access camera/microphone.", "error");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      setFeedback(null);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const analyzeAnswer = async () => {
    if(!transcript) return showToast("No answer recorded to analyze.", "warning");
    
    setAnalyzing(true);
    try {
      const res = await post('/ai/interview/analyze', {
        question: questions[activeQuestion],
        answer: transcript
      });
      setFeedback(res);
    } catch (err) {
      showToast("AI Analysis failed. Please try again.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const currentQuestionText = questions[activeQuestion] || "Loading questions...";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 transition-colors duration-300 relative overflow-hidden">
       
       {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100 dark:bg-indigo-600/5 rounded-full blur-[120px]" />
       </div>

       <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <Sparkles size={14}/> Powered by Gemini AI
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Mock Interview</h1>
               <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Practice with an intelligent AI that listens and critiques.</p>
             </div>
             
             {cameraActive ? (
                <button onClick={stopCamera} className="px-6 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2">
                   <StopCircle size={18}/> Stop Camera
                </button>
             ) : (
                <button onClick={startCamera} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
                   <Video size={18}/> Enable Camera
                </button>
             )}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 h-[75vh]">
             {/* Left: AI Avatar / Camera */}
             <div className="bg-white dark:bg-[#0f1014] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/5 relative flex flex-col shadow-2xl shadow-slate-200/50 dark:shadow-none group">
                {cameraActive ? (
                   <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-6 p-10 text-center">
                      <div className="relative">
                         <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-75"></div>
                         <div className="w-32 h-32 rounded-full bg-slate-50 dark:bg-[#1a1a1a] flex items-center justify-center border-4 border-slate-100 dark:border-white/5 shadow-inner">
                            <Video size={48} className="text-indigo-500 opacity-50"/>
                         </div>
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Camera is Off</h3>
                         <p className="text-sm max-w-xs mx-auto">Turn on your camera for the most realistic interview experience.</p>
                      </div>
                   </div>
                )}

                {/* Overlay Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                   <button 
                     onClick={toggleRecording}
                     className={`p-5 rounded-full transition-all shadow-2xl transform hover:scale-110 active:scale-95 flex items-center justify-center ${
                        isRecording 
                        ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-500/30 text-white animate-pulse' 
                        : 'bg-white dark:bg-white text-black ring-4 ring-black/5'
                     }`}
                     title={isRecording ? "Stop Recording" : "Start Recording"}
                   >
                      {isRecording ? <StopCircle size={32}/> : <Mic size={32} className="text-indigo-600"/>}
                   </button>
                </div>
                
                {/* Recording Indicator */}
                {isRecording && (
                   <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div> Recording
                   </div>
                )}
             </div>

             {/* Right: Interaction Panel */}
             <div className="flex flex-col gap-6 h-full overflow-hidden">
                {/* Question Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden shrink-0 min-h-[200px] flex flex-col justify-center">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={120}/></div>
                   
                   {loadingQuestions ? (
                      <div className="flex items-center justify-center h-full gap-3">
                        <Loader className="animate-spin" /> Generating Interview...
                      </div>
                   ) : (
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10">
                              Question {activeQuestion + 1} of {questions.length}
                           </h3>
                           <div className="flex gap-2">
                             <button onClick={fetchQuestions} className="p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors" title="Refresh Questions"><RefreshCw size={18}/></button>
                             <div className="w-px h-6 bg-white/20 mx-1"></div>
                             <button onClick={() => { setActiveQuestion(Math.max(0, activeQuestion - 1)); setFeedback(null); setTranscript(""); }} disabled={activeQuestion === 0} className="p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors disabled:opacity-50"><ChevronLeft size={18}/></button>
                             <button onClick={() => { setActiveQuestion(Math.min(questions.length-1, activeQuestion + 1)); setFeedback(null); setTranscript(""); }} disabled={activeQuestion === questions.length - 1} className="p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors disabled:opacity-50"><ChevronRight size={18}/></button>
                           </div>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.p 
                            key={activeQuestion}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-2xl md:text-3xl font-black leading-tight drop-shadow-md"
                          >
                            "{currentQuestionText}"
                          </motion.p>
                        </AnimatePresence>
                     </div>
                   )}
                </div>

                {/* Content Area (Transcript + Feedback) */}
                <div className="flex-1 bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col relative">
                   
                   {!feedback ? (
                      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                         <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlignLeft size={16}/> Live Transcript
                         </h4>
                         <p className="text-xl leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                            {transcript || <span className="text-slate-300 dark:text-slate-600 italic">Tap the microphone to start speaking...</span>}
                         </p>
                      </div>
                   ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0f1014]/50">
                         <div className="flex justify-between items-start mb-8">
                            <div>
                               <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 flex items-end gap-1 leading-none mb-1">
                                  {feedback.score}<span className="text-lg text-slate-400 dark:text-slate-500 font-bold mb-1">/100</span>
                               </div>
                               <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Score</div>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border ${
                               feedback.sentiment === 'Positive' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' :
                               feedback.sentiment === 'Neutral' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' :
                               'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                            }`}>
                               {feedback.sentiment} Tone
                            </div>
                         </div>
                         
                         <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm mb-6">
                            <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Info size={16} className="text-indigo-500"/> AI Feedback</h5>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feedback.feedback}</p>
                         </div>

                         {feedback.improvements && (
                            <div className="bg-amber-50 dark:bg-amber-500/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/20 mb-6">
                              <h5 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2"><Sparkles size={16}/> Suggested Improvement</h5>
                              <p className="text-amber-900/80 dark:text-amber-200/80 leading-relaxed text-sm">{feedback.improvements}</p>
                            </div>
                         )}

                         <div className="flex flex-wrap gap-2">
                            {feedback.keywords?.map(k => (
                               <span key={k} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">#{k}</span>
                            ))}
                         </div>
                         
                         <button onClick={() => { setFeedback(null); setTranscript(""); }} className="mt-8 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-white transition-colors underline decoration-2 decoration-transparent hover:decoration-current">
                            Try Again
                         </button>
                      </motion.div>
                   )}

                   {/* Action Bar */}
                   <div className="p-6 bg-slate-50 dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-white/5">
                      {!isRecording && transcript && !analyzing && !feedback && (
                         <button onClick={analyzeAnswer} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                            <Sparkles size={20}/> Analyze My Answer
                         </button>
                      )}
                      {analyzing && (
                          <button disabled className="w-full py-4 bg-slate-200 dark:bg-white/5 text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-wait">
                             <Loader size={20} className="animate-spin text-indigo-500"/> AI Is Analyzing...
                          </button>
                      )}
                      {!transcript && !isRecording && !feedback && (
                         <p className="text-center text-sm font-medium text-slate-400">Ready to start? Tap the microphone button.</p>
                      )}
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
