import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket";
import useApi from "../hooks/useApi";
import { 
  Send, MoreVertical, Search, MessageSquare, Loader, Check, CheckCheck, Phone, Video
} from "lucide-react";
import { motion } from "framer-motion";

export default function Chat() {
  const { get, post } = useApi();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [users, setUsers] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null); 

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        const list = await get("/users");
        setUsers(list.filter((u) => u._id !== user?._id));
      } catch {
        setError("Failed to load users");
      }
    })();
  }, [user]);

  const loadConversation = async (targetUser) => {
    try {
      setLoading(true);
      setActive(targetUser);
      const conv = await post(`/chat/start/${targetUser._id}`);
      setActive({ ...targetUser, conversationId: conv._id });

      const res = await get(`/chat/${conv._id}/messages?limit=50`);
      setMessages(res.messages || []);

      res.messages?.forEach((m) => {
        if (m.to === user._id && m.status !== "seen") {
          socket.emit("message:mark", { messageId: m._id, status: "seen" });
        }
      });
    } catch {
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!draft.trim() || !active || !socket) return;

    const payload = {
      conversationId: active.conversationId,
      to: active._id,
      body: draft.trim(),
    };

    socket.emit("message:send", payload, (ack) => {
      if (ack?.ok && ack.message) {
        setMessages((prev) => [...prev, ack.message]);
        scrollToBottom();
      }
    });

    setDraft("");
    socket.emit("typing", { to: active._id, conversationId: active.conversationId, typing: false });
  };

  const handleTyping = (e) => {
    setDraft(e.target.value);
    if (!socket || !active) return;

    socket.emit("typing", { to: active._id, conversationId: active.conversationId, typing: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", { to: active._id, conversationId: active.conversationId, typing: false });
    }, 2000);
  };

  const handleDelete = (msgId, mode) => {
    if (!socket) return;
    socket.emit("message:delete", { messageId: msgId, mode }, (ack) => {
      if (ack?.ok) {
        if (mode === "me") {
           setMessages((msgs) => msgs.filter((m) => m._id !== msgId));
        } else if (mode === "everyone") {
           setMessages((msgs) => msgs.map((m) => m._id === msgId ? { ...m, body: "🚫 Message deleted" } : m));
        }
      }
    });
    setMenuOpen(null);
  };

  useEffect(() => {
    if (!socket) return;

    const handleNew = ({ message }) => {
      if (message.conversation === active?.conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        if (message.to === user._id) {
          socket.emit("message:mark", { messageId: message._id, status: "seen" });
        }
      }
    };

    const handleDeleted = ({ messageId, mode }) => {
       if (mode === "everyone") {
          setMessages((msgs) => msgs.map((m) => m._id === messageId ? { ...m, body: "🚫 Message deleted" } : m));
       }
    };

    const handleTypingEvent = ({ from, typing }) => {
      if (from !== user?._id && typing) {
         setTypingUser("Typing...");
         clearTimeout(typingTimeout.current);
         typingTimeout.current = setTimeout(() => setTypingUser(null), 2000);
      } else {
         setTypingUser(null);
      }
    };

    const handleMessageUpdate = ({ messageId, status }) => {
      setMessages((msgs) => msgs.map((m) => m._id === messageId ? { ...m, status: status } : m));
    };

    socket.on("message:new", handleNew);
    socket.on("message:deleted", handleDeleted);
    socket.on("typing", handleTypingEvent);
    socket.on("message:update", handleMessageUpdate);

    return () => {
      socket.off("message:new", handleNew);
      socket.off("message:deleted", handleDeleted);
      socket.off("typing", handleTypingEvent);
      socket.off("message:update", handleMessageUpdate);
    };
  }, [socket, active?.conversationId, users, user?._id]);

  if (!user) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]"><Loader className="animate-spin text-blue-600" size={32}/></div>;

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0a0a0a] flex overflow-hidden transition-colors duration-300">
       
       {/* Sidebar */}
       <div className="w-full md:w-80 bg-white dark:bg-[#0f1014] border-r border-slate-200 dark:border-white/5 flex flex-col z-20 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
          <div className="p-5 border-b border-slate-100 dark:border-white/5">
             <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                   <MessageSquare className="text-white" size={18} />
                </div>
                Messages
             </h2>
             <div className="mt-5 relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                   type="text" placeholder="Search conversations..." 
                   className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-xl text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-[#222] focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all"
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {users.map(u => (
                <button 
                   key={u._id}
                   onClick={() => loadConversation(u)}
                   className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 
                     ${active?._id === u._id ? 'bg-blue-50 dark:bg-[#1a1a1a] border-r-4 border-r-blue-600 dark:border-r-blue-500' : ''}`}
                >
                   <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#2a2a2a] overflow-hidden border border-slate-100 dark:border-white/10 shrink-0">
                         {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{u.name?.[0]}</div>}
                      </div>
                      {u.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0f1014] rounded-full"></div>}
                   </div>
                   <div className="text-left flex-1 min-w-0">
                      <h3 className={`font-bold truncate text-sm ${active?._id === u._id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{u.name}</h3>
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600 mt-0.5">{u.online ? <span className="text-green-600 dark:text-green-500">Online</span> : 'Offline'}</p>
                   </div>
                </button>
             ))}
          </div>
       </div>

       {/* Chat Area */}
       <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0a0a0a] relative transition-colors duration-300">
          {/* Background Gradients */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[100px] transition-colors" />
             <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[100px] transition-colors" />
          </div>

          {active ? (
             <>
                {/* Header */}
                <div className="h-20 bg-white/80 dark:bg-[#0f1014]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center px-6 justify-between shrink-0 z-10 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2a2a2a] overflow-hidden border border-slate-100 dark:border-white/10">
                         {active.avatar ? <img src={active.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{active.name?.[0]}</div>}
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-900 dark:text-white text-lg">{active.name}</h3>
                         <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">{typingUser || (active.online ? 'Active Now' : 'Last seen recently')}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                         <Phone size={18} />
                      </button>
                      <button className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                         <Video size={18} />
                      </button>
                   </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 z-10 custom-scrollbar">
                   {loading && <div className="flex justify-center py-10"><Loader className="animate-spin text-blue-600 dark:text-blue-500"/></div>}
                   {!loading && messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                         <div className="w-20 h-20 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="text-slate-500 dark:text-slate-600"/>
                         </div>
                         <p className="font-bold text-lg text-slate-600 dark:text-slate-500">No messages yet</p>
                         <p className="text-sm">Start the conversation by saying Hi!</p>
                      </div>
                   )}
                   {messages.map((m) => {
                      const own = (m.from?._id || m.from) === user._id;
                      return (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           key={m._id} 
                           className={`flex ${own ? 'justify-end' : 'justify-start'} group relative mb-2`}
                         >
                            
                            {/* Option Menu (Only for own messages) */}
                            {own && (
                               <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 -left-8">
                                  <button onClick={() => setMenuOpen(menuOpen === m._id ? null : m._id)} className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors">
                                     <MoreVertical size={14}/>
                                  </button>
                                  {menuOpen === m._id && (
                                     <div className="absolute right-0 top-6 bg-white dark:bg-[#1a1a1a] shadow-xl border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden z-20 w-32 flex flex-col">
                                        <button onClick={() => handleDelete(m._id, "me")} className="text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Delete for me</button>
                                        <button onClick={() => handleDelete(m._id, "everyone")} className="text-left px-4 py-2 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500">Delete everyone</button>
                                     </div>
                                  )}
                               </div>
                            )}

                            <div className={`max-w-[75%] md:max-w-[60%] p-4 rounded-3xl shadow-sm border text-sm leading-relaxed whitespace-pre-wrap 
                                ${own 
                                   ? 'bg-blue-600 text-white border-blue-500 rounded-tr-sm shadow-blue-500/20' 
                                   : 'bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/5 rounded-tl-sm shadow-slate-200/50 dark:shadow-none'
                                }`}>
                               {m.body}
                               <div className={`mt-1.5 flex items-center justify-end gap-1.5 text-[10px] font-bold ${own ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                  {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  {own && (
                                     <span>
                                        {m.status === 'seen' ? <CheckCheck size={14} className="text-white"/> : 
                                         m.status === 'delivered' ? <CheckCheck size={14} className="text-blue-200/70"/> : 
                                         <Check size={14}/>}
                                     </span>
                                  )}
                               </div>
                            </div>
                         </motion.div>
                      );
                   })}
                   <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-5 bg-white dark:bg-[#0f1014] border-t border-slate-200 dark:border-white/5 shrink-0 z-20 transition-colors">
                   <div className="flex gap-4 max-w-4xl mx-auto">
                      <input 
                         type="text" 
                         value={draft}
                         onChange={handleTyping}
                         onKeyDown={e => e.key === 'Enter' && sendMessage()}
                         placeholder="Type a message..."
                         className="flex-1 bg-slate-100 dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-2xl px-6 py-4 font-medium outline-none focus:bg-white dark:focus:bg-[#222] focus:border-blue-500/50 transition-all text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600"
                      />
                      <button onClick={sendMessage} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
                         <Send size={20} />
                      </button>
                   </div>
                </div>

             </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-500 z-10 p-6 text-center">
                <div className="w-24 h-24 bg-white dark:bg-[#1a1a1a] rounded-3xl flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                   <MessageSquare size={48} className="text-blue-600 dark:text-slate-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Welcome to Chat</h2>
                <p className="font-medium text-slate-500 dark:text-slate-400 max-w-sm">Select a conversation from the sidebar to start messaging your network.</p>
             </div>
          )}
       </div>

    </div>
  );
}
