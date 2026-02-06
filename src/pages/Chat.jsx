import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket";
import useApi from "../hooks/useApi";
import {
   Send, MoreVertical, Search, MessageSquare, Loader, Check, CheckCheck, Phone, Video, Edit, X, Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../components/ToastProvider";

export default function Chat() {
   const { get, post, patch } = useApi();
   const { user } = useAuth();
   const { socket } = useSocket();
   const { showToast } = useToast();

   const [threads, setThreads] = useState([]);
   const [active, setActive] = useState(null);
   const [messages, setMessages] = useState([]);
   const [draft, setDraft] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [typingUser, setTypingUser] = useState(null);
   const [menuOpen, setMenuOpen] = useState(null);

   // Link Update State
   const [linkUpdateModal, setLinkUpdateModal] = useState(false);
   const [newLinkInput, setNewLinkInput] = useState("");
   const [updatingSession, setUpdatingSession] = useState(null);

   const [upcomingSession, setUpcomingSession] = useState(null);

   const messagesEndRef = useRef(null);
   const typingTimeout = useRef(null);

   const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

   useEffect(() => {
      scrollToBottom();
   }, [messages]);

   // 🆕 Fetch Session Context for Banner
   useEffect(() => {
      if (active) {
         get('/mentorship/sessions/my')
            .then(sessions => {
               if (!sessions) return;
               // Find closest future session (pending or confirmed)
               const related = sessions.find(s =>
                  (s.mentor?._id === active._id || s.mentee?._id === active._id) &&
                  ['pending', 'confirmed'].includes(s.status)
               );
               setUpcomingSession(related || null);
            })
            .catch(err => console.error("Failed to fetch session context", err));
      } else {
         setUpcomingSession(null);
      }
   }, [active]);

   const [searchParams] = useSearchParams();
   const chatWithId = searchParams.get("chatWith");

   // Helper to get the other user from a conversation
   const getOtherUser = (conv) => conv.participants?.find(p => p._id !== user._id) || {};

   useEffect(() => {
      let isMounted = true;

      (async () => {
         try {
            // 1. Fetch my existing conversations
            const customList = await get("/chat/conversations");
            if (!isMounted) return;

            setThreads(customList);

            // 2. Handle "Chat With" intent (e.g. from Profile or Mentorship page)
            if (chatWithId) {
               // Check if we already have a thread with this user
               const existingThread = customList.find(c => c.participants.some(p => p._id === chatWithId));

               if (existingThread) {
                  loadConversation(existingThread);
               } else {
                  // No existing thread, fetch user info and initialize
                  try {
                     const targetUser = await get(`/users/public/${chatWithId}`);
                     if (targetUser && isMounted) {
                        const newConv = await post(`/chat/start/${chatWithId}`);
                        if (isMounted) {
                           // Deduplicate: only add if not already present
                           setThreads(prev => {
                              const exists = prev.some(t => t._id === newConv._id);
                              return exists ? prev : [newConv, ...prev];
                           });
                           loadConversation(newConv);
                        }
                     }
                  } catch (e) {
                     console.error("Failed to init chat", e);
                  }
               }
            }
         } catch {
            if (isMounted) setError("Failed to load conversations");
         }
      })();

      return () => { isMounted = false; };
   }, [user?._id, chatWithId]);

   const loadConversation = async (threadOrUser) => {
      try {
         setLoading(true);

         // Determine if we passed a full thread object or just a user
         let conversationId = threadOrUser._id;
         let targetUser = null;

         // If it has 'participants', it's a thread
         if (threadOrUser.participants) {
            targetUser = getOtherUser(threadOrUser);
         } else {
            // It's a user object (unlikely flow now, but fallback)
            // If we passed a user, we must ensure conversation exists
            const res = await post(`/chat/start/${threadOrUser._id}`);
            conversationId = res._id;
            targetUser = threadOrUser;
         }

         setActive({ ...targetUser, conversationId });

         const res = await get(`/chat/${conversationId}/messages?limit=50`);
         setMessages(res.messages || []);

         // Mark delivered messages as seen
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

   const handleTyping = (e) => {
      setDraft(e.target.value);
      if (!socket || !active) return;

      socket.emit("typing", { to: active._id, conversationId: active.conversationId, typing: true });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
         socket.emit("typing", { to: active._id, conversationId: active.conversationId, typing: false });
      }, 2000);
   };

   // Video/Call Handler - Opens Google Meet
   const startCall = (video = false) => {
      if (!active?.conversationId) return;
      // Open Google Meet's new meeting page
      window.open('https://meet.google.com/new', '_blank');
      showToast('Create a Google Meet and share the link in chat!', 'info');
   };

   const submitLinkUpdate = async () => {
      if (!upcomingSession || !newLinkInput.trim()) return;

      try {
         await patch(`/mentorship/sessions/${upcomingSession._id}/status`, {
            status: upcomingSession.status,
            meetingLink: newLinkInput.trim()
         });

         setUpcomingSession(prev => ({ ...prev, meetingLink: newLinkInput.trim() }));
         setLinkUpdateModal(false);
         setNewLinkInput("");

         // Open the new link immediately
         window.open(newLinkInput.trim(), '_blank');
         showToast("Meeting link updated! Joining now...", "success");
      } catch (err) {
         console.error(err);
         showToast("Failed to update link", "error");
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

   // 🛰️ Real-time Socket Listeners
   useEffect(() => {
      if (!socket || !active) return;

      const handleNewMessage = (data) => {
         const { message } = data || {};
         if (!message) return;

         // Check if the message belongs to THIS conversation
         if (message.conversation === active.conversationId) {
            setMessages((prev) => {
               // Prevent duplicates (especially if sender also gets a broadcast)
               if (prev.find(m => m._id === message._id)) return prev;
               return [...prev, message];
            });
            scrollToBottom();

            // Auto-mark as seen if we are the recipient
            if (message.to === user._id) {
               socket.emit("message:mark", { messageId: message._id, status: "seen" });
            }
         }

         // Update thread list with last message (optional but good UI)
         setThreads(prev => prev.map(t =>
            t._id === message.conversation
               ? { ...t, lastMessage: message, updatedAt: new Date().toISOString() }
               : t
         ));
      };

      const handleMessageUpdate = (data) => {
         setMessages((prev) => prev.map(m =>
            m._id === data.messageId ? { ...m, status: data.status } : m
         ));
      };

      const handleTyping = (data) => {
         // Show typing only if it's from the person we are chatting with
         if (data.conversationId === active.conversationId && data.from === active._id) {
            setTypingUser(data.typing ? "Typing..." : null);
         }
      };

      const handleMessageDeleted = (data) => {
         if (data.mode === "everyone") {
            setMessages((prev) => prev.map(m => m._id === data.messageId ? { ...m, body: "🚫 Message deleted" } : m));
         } else if (data.mode === "me") {
            setMessages((prev) => prev.filter(m => m._id !== data.messageId));
         }
      };

      socket.on("message:new", handleNewMessage);
      socket.on("message:update", handleMessageUpdate);
      socket.on("typing", handleTyping);
      socket.on("message:deleted", handleMessageDeleted);

      return () => {
         socket.off("message:new", handleNewMessage);
         socket.off("message:update", handleMessageUpdate);
         socket.off("typing", handleTyping);
         socket.off("message:deleted", handleMessageDeleted);
      };
   }, [socket, active, user._id]);

   if (!user) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]"><Loader className="animate-spin text-blue-600" size={32} /></div>;

   return (
      <div className="h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0a0a0a] flex overflow-hidden transition-colors duration-300">

         {/* Sidebar */}
         <div className="w-full md:w-80 bg-white dark:bg-[#0f1014] border-r border-slate-200 dark:border-white/5 flex flex-col z-20 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
            <div className="p-5 border-b border-slate-100 dark:border-white/5">
               <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                  <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                     <MessageSquare className="text-white" size={18} />
                  </div>
                  Inbox
               </h2>
               <div className="mt-5 relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                     type="text" placeholder="Search messages..."
                     className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-xl text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-[#222] focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {threads.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">
                     No conversations yet. <br /> Visit a profile to start chatting!
                  </div>
               )}
               {threads.map(thread => {
                  const other = getOtherUser(thread);
                  return (
                     <button
                        key={thread._id}
                        onClick={() => loadConversation(thread)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 
                        ${active?.conversationId === thread._id ? 'bg-blue-50 dark:bg-[#1a1a1a] border-r-4 border-r-blue-600 dark:border-r-blue-500' : ''}`}
                     >
                        <div className="relative">
                           <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#2a2a2a] overflow-hidden border border-slate-100 dark:border-white/10 shrink-0">
                              {other.avatar ? <img src={other.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{other.name?.[0]}</div>}
                           </div>
                           {other.lastSeen === 'online' && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0f1014] rounded-full"></div>}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                           <h3 className={`font-bold truncate text-sm ${active?.conversationId === thread._id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{other.name || "Unknown User"}</h3>
                           <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600 mt-0.5 truncate">{other.role || 'User'}</p>
                        </div>
                     </button>
                  );
               })}
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
                           {active.avatar ? <img src={active.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{active.name?.[0]}</div>}
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900 dark:text-white text-lg">{active.name}</h3>
                           <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">{typingUser || "Active"}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => startCall(false)} className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors" title="Voice Call">
                           <Phone size={18} />
                        </button>
                        <button onClick={() => startCall(true)} className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors" title="Video Call">
                           <Video size={18} />
                        </button>
                     </div>
                  </div>

                  {/* 📅 Upcoming Session Context Banner */}
                  {upcomingSession && (
                     <div className="bg-blue-600/10 border-b border-blue-600/20 p-3 px-6 flex items-center justify-between backdrop-blur-sm z-10">
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${upcomingSession.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                              <CheckCheck size={16} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-0.5">
                                 Upcoming: {upcomingSession.serviceTitle}
                              </p>
                              <p className="text-sm font-bold text-white">
                                 {new Date(upcomingSession.scheduledDate).toLocaleDateString()} @ {upcomingSession.scheduledTime}
                                 <span className="ml-2 opacity-60 text-xs font-normal">({upcomingSession.status})</span>
                              </p>
                           </div>
                        </div>
                        {upcomingSession.status === 'confirmed' && (
                           <div className="flex items-center gap-2">
                              {upcomingSession.meetingLink && (
                                 <button
                                    onClick={() => {
                                       if (upcomingSession.meetingLink.includes('jit.si')) {
                                          setNewLinkInput("");
                                          setLinkUpdateModal(true);
                                       } else {
                                          window.open(upcomingSession.meetingLink, '_blank');
                                       }
                                    }}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                 >
                                    <Video size={14} /> Join Meeting
                                 </button>
                              )}
                              {/* Edit Meeting Link - Only for mentor */}
                              {user?.role === 'mentor' && (
                                 <button
                                    onClick={async () => {
                                       const newLink = prompt('Update to Google Meet link:', upcomingSession.meetingLink || 'https://meet.google.com/new');
                                       if (newLink && newLink.trim() && newLink !== upcomingSession.meetingLink) {
                                          try {
                                             await patch(`/mentorship/sessions/${upcomingSession._id}/status`, {
                                                status: upcomingSession.status,
                                                meetingLink: newLink.trim()
                                             });
                                             setUpcomingSession(prev => ({ ...prev, meetingLink: newLink.trim() }));
                                             showToast('Meeting link updated to Google Meet!', 'success');
                                          } catch (err) {
                                             showToast('Failed to update meeting link', 'error');
                                          }
                                       }
                                    }}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                    title="Edit Meeting Link"
                                 >
                                    <Edit size={12} />
                                 </button>
                              )}
                           </div>
                        )}
                        {upcomingSession.status === 'pending' && (
                           <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded border border-amber-500/20">
                              Awaiting Approval
                           </span>
                        )}
                     </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-3 z-10 custom-scrollbar">
                     {loading && <div className="flex justify-center py-10"><Loader className="animate-spin text-blue-600 dark:text-blue-500" /></div>}
                     {!loading && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                           <div className="w-20 h-20 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                              <MessageSquare size={32} className="text-slate-500 dark:text-slate-600" />
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
                                       <MoreVertical size={14} />
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
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {own && (
                                       <span>
                                          {m.status === 'seen' ? <CheckCheck size={14} className="text-white" /> :
                                             m.status === 'delivered' ? <CheckCheck size={14} className="text-blue-200/70" /> :
                                                <Check size={14} />}
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

         {/* Link Update Custom Modal */}
         {linkUpdateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0f1014] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl relative"
               >
                  <button onClick={() => setLinkUpdateModal(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white"><X size={20} /></button>

                  <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                     <Video size={32} className="text-blue-500" />
                  </div>

                  <h2 className="text-xl font-bold mb-2 text-white text-center">Update Meeting Link</h2>
                  <p className="text-slate-400 text-center text-sm mb-6">
                     This session is using an old video link. Please provide a new Google Meet link to join the session.
                  </p>

                  <div className="space-y-4">
                     <button
                        onClick={() => window.open('https://meet.google.com/new', '_blank')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-blue-400 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-white/5 transition-colors"
                     >
                        <Plus size={16} /> Create New Google Meet
                     </button>

                     <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                           <Video size={16} className="text-slate-500" />
                        </div>
                        <input
                           type="text"
                           value={newLinkInput}
                           onChange={e => setNewLinkInput(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 outline-none text-sm"
                           placeholder="Paste Google Meet link here..."
                        />
                     </div>

                     <button
                        onClick={submitLinkUpdate}
                        disabled={!newLinkInput.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                     >
                        Update & Join
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </div>
   );
}
