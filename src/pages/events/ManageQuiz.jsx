import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { 
  Plus, Save, Trash2, ArrowLeft, CheckCircle, HelpCircle, Clock 
} from "lucide-react";
import { useToast } from "../../components/ToastProvider";
import { motion } from "framer-motion";

export default function ManageQuiz() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { get, put } = useApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [duration, setDuration] = useState(15);
  
  // New Question Form
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [marks, setMarks] = useState(1);

  useEffect(() => {
    loadQuiz();
  }, [eventId]);

  const loadQuiz = async () => {
    try {
      const res = await get(`/events/${eventId}`);
      if (res.quiz) {
         setQuestions(res.quiz.questions || []);
         setDuration(res.quiz.duration || 15);
      }
    } catch {
      showToast("Failed to load event data", "error");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!qText || options.some(o => !o)) {
      showToast("Please fill all fields", "error");
      return;
    }
    const newQ = {
      question: qText,
      options: [...options],
      correctOption: Number(correctOption),
      marks: Number(marks)
    };
    setQuestions([...questions, newQ]);
    
    // Reset
    setQText("");
    setOptions(["", "", "", ""]);
    setCorrectOption(0);
    setMarks(1);
    showToast("Question added locally", "success");
  };

  const removeQuestion = (idx) => {
    const n = [...questions];
    n.splice(idx, 1);
    setQuestions(n);
  };

  const handleSave = async () => {
    try {
      await put(`/events/${eventId}/quiz`, {
        questions,
        duration
      });
      showToast("Quiz saved successfully!", "success");
      navigate(-1);
    } catch (err) {
      showToast("Failed to save quiz", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-8 relative overflow-hidden transition-colors duration-300">
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[120px] transition-colors" />
        </div>

       <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
                 <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-500 dark:text-slate-400">
                    <ArrowLeft size={20}/>
                 </button>
                 <div>
                     <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Manage Quiz</h1>
                     <p className="text-slate-500 dark:text-slate-400 font-medium">{questions.length} Questions configured</p>
                 </div>
             </div>
             <button 
                onClick={handleSave}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
             >
                <Save size={20}/> Save Quiz
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* LEFT: Question Builder */}
             <div className="lg:col-span-2 space-y-8">
                
                {/* Duration Config */}
                <div className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-6">
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Clock size={24}/>
                   </div>
                   <div className="flex-1">
                      <label className="block text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Quiz Duration (Minutes)</label>
                      <input 
                         type="number" 
                         value={duration} 
                         onChange={e => setDuration(e.target.value)} 
                         className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-lg text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                      />
                   </div>
                </div>

                {/* Question List */}
                <div className="space-y-6">
                   {questions.map((q, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative group transition-all"
                      >
                         <button onClick={() => removeQuestion(i)} className="absolute top-6 right-6 p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 size={20}/>
                         </button>
                         <div className="flex gap-6">
                            <span className="font-black text-slate-200 dark:text-slate-800 text-4xl leading-none select-none">Q{i + 1}</span>
                            <div className="flex-1">
                               <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6 pr-12 leading-relaxed">{q.question}</h3>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {q.options.map((opt, oid) => (
                                     <div key={oid} className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-3 font-medium transition-colors ${oid === q.correctOption ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${oid === q.correctOption ? 'bg-green-200 dark:bg-green-500/20 text-green-800 dark:text-green-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>{String.fromCharCode(65 + oid)}</span>
                                        {opt}
                                     </div>
                                  ))}
                               </div>
                               <div className="mt-4 flex justify-end">
                                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">Marks: {q.marks}</span>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                   ))}

                   {questions.length === 0 && (
                      <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2.5rem] text-slate-400 dark:text-slate-600 font-bold bg-slate-50/50 dark:bg-white/5">
                         <HelpCircle size={48} className="mx-auto mb-4 opacity-50"/>
                         No questions added yet. Start adding questions from the panel.
                      </div>
                   )}
                </div>

             </div>

             {/* RIGHT: Add New */}
             <div className="bg-white dark:bg-[#0f1014] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl dark:shadow-none h-fit sticky top-8 transition-colors">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Plus size={20}/></div>
                   Add Question
                </h3>
                
                <div className="space-y-6">
                   <div>
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Question Text</label>
                      <textarea 
                        value={qText} onChange={e => setQText(e.target.value)} 
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 h-32 resize-none transition-all placeholder:text-slate-400"
                        placeholder="e.g. What is the capital of France?"
                      />
                   </div>

                   <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Options</label>
                      {options.map((opt, i) => (
                         <div key={i} className="flex items-center gap-3">
                            <span className="w-8 text-center text-xs font-black text-slate-400 dark:text-slate-500">{String.fromCharCode(65+i)}</span>
                            <div className="flex-1 relative">
                                <input 
                                    value={opt} 
                                    onChange={e => {
                                        const n = [...options];
                                        n[i] = e.target.value;
                                        setOptions(n);
                                    }}
                                    className={`w-full p-3 pr-10 bg-slate-50 dark:bg-white/5 border ${correctOption === i ? 'border-green-500 ring-1 ring-green-500/20' : 'border-slate-200 dark:border-white/10'} rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400`}
                                    placeholder={`Option ${i+1}`}
                                />
                                {correctOption === i && <CheckCircle size={16} className="absolute right-3 top-3.5 text-green-500"/>}
                            </div>
                            <div onClick={() => setCorrectOption(i)} className={`p-2 rounded-full cursor-pointer transition-all ${correctOption === i ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-500' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-300 dark:text-slate-600'}`}>
                               <CheckCircle size={20}/>
                            </div>
                         </div>
                      ))}
                   </div>
                   
                   <div>
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Marks</label>
                      <input type="number" value={marks} onChange={e => setMarks(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"/>
                   </div>

                   <button 
                      onClick={addQuestion}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl mt-4 shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                   >
                      Add to List
                   </button>

                </div>
             </div>

          </div>
       </div>
    </div>
  );
}
