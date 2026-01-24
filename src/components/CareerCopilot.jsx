import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Minimize2, RefreshCcw } from 'lucide-react';
import useApi from '../hooks/useApi';

export default function CareerCopilot() {
  const { post } = useApi();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm OneStop Copilot 🤖. Ask me anything about your job search, resume, or interview prep!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', text: res.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble thinking right now. 🤯 Try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* 🟢 Launcher Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center relative group"
        >
          <Sparkles size={28} className="absolute animate-spin-slow opacity-20" />
          <MessageSquare size={28} className="relative z-10" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
        </motion.button>
      )}

      {/* 🤖 Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 'auto' : '500px' }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`pointer-events-auto w-[350px] md:w-[400px] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden transition-all duration-300 font-sans`}
          >
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 text-white">
                     <Sparkles size={20} />
                  </div>
                  <div>
                     <h3 className="font-bold text-white text-sm">OneStop Copilot</h3>
                     <p className="text-white/70 text-xs flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                  </div>
               </div>
               <div className="flex gap-1 text-white/70">
                  <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                     <Minimize2 size={16} />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-500/80 hover:text-white rounded-lg transition-colors">
                     <X size={16} />
                  </button>
               </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
               <>
                  <div className="flex-1 bg-slate-50 dark:bg-[#0f1014] p-4 overflow-y-auto custom-scrollbar" ref={scrollRef}>
                     <div className="space-y-4">
                        {messages.map((msg, i) => (
                           <motion.div 
                              key={i} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                           >
                              <div className={`
                                 max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                 ${msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-[#252525] text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-tl-none'}
                              `}>
                                 {msg.text}
                              </div>
                           </motion.div>
                        ))}
                        {isTyping && (
                           <div className="flex justify-start">
                              <div className="bg-white dark:bg-[#252525] p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-white/5 flex gap-1">
                                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-white/10 flex gap-2">
                     <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for career advice..."
                        className="flex-1 bg-slate-100 dark:bg-[#252525] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                     />
                     <button 
                        type="submit" 
                        disabled={!input.trim() || isTyping}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                     >
                        <Send size={18} />
                     </button>
                  </form>
               </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
