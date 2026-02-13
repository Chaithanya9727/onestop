import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
   MessageSquare, Heart, Share2, Send, Image as ImageIcon,
   MoreHorizontal, Sparkles, User, Filter, Globe, X, Loader, Trash,
   Search, Plus, ThumbsUp, MessageCircle, Clock, Tag, ExternalLink,
   Users, BarChart2, ShieldCheck, AlertCircle, Info, ChevronUp, ChevronDown,
   HelpCircle, Briefcase, Zap, Rocket, Star, LayoutDashboard, Calendar,
   Layers, Target, Code, Trophy, Phone, Megaphone, BookOpen, SendHorizonal
} from "lucide-react";
import { useToast } from "../components/ToastProvider";
import AuthModal from "../components/AuthModal";
import { Link, useLocation } from "react-router-dom";

export default function Community() {
   const { user, isAuthenticated } = useAuth();
   const { get, post, put, del } = useApi();
   const { showToast } = useToast();
   const location = useLocation();

   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [content, setContent] = useState("");
   const [title, setTitle] = useState("");
   const [tags, setTags] = useState("");
   const [category, setCategory] = useState("General");
   const [creating, setCreating] = useState(false);
   const [showCreateForm, setShowCreateForm] = useState(false);

   // Filter state
   const [activeTab, setActiveTab] = useState("All");
   const [searchTerm, setSearchTerm] = useState("");

   // Auth Modal
   const [isAuthModalOpen, setAuthModalOpen] = useState(false);

   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const categoryParam = params.get("category");
      if (categoryParam) {
         setActiveTab(categoryParam);
      }
      loadFeed();
   }, [activeTab, location.search]);

   const loadFeed = async () => {
      try {
         setLoading(true);
         const data = await get(`/feed?category=${activeTab}`);
         setPosts(data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleCreatePost = async () => {
      if (!isAuthenticated) {
         setAuthModalOpen(true);
         return;
      }
      if (!title.trim() || !content.trim()) {
         showToast("Title and Content are required", "error");
         return;
      }
      try {
         setCreating(true);
         const tagArray = tags.split(",").map(t => t.trim()).filter(t => t);
         const newPost = await post("/feed", {
            title,
            content,
            tags: tagArray,
            category
         });
         setPosts([newPost, ...posts]);
         setTitle("");
         setContent("");
         setTags("");
         setShowCreateForm(false);
         showToast("Question posted successfully!", "success");
      } catch (err) {
         const msg = err.response?.data?.message || err.message || "Failed to post";
         showToast(msg, "error");
      } finally {
         setCreating(false);
      }
   };

   const handleDeletePost = async (id) => {
      if (!window.confirm("Are you sure you want to delete this?")) return;
      try {
         await del(`/feed/${id}`);
         setPosts(prev => prev.filter(p => p._id !== id));
         showToast("Post removed", "success");
      } catch (err) {
         showToast("Failed to delete", "error");
      }
   };

   const handleLike = async (id) => {
      if (!isAuthenticated) {
         setAuthModalOpen(true);
         return;
      }
      try {
         setPosts(prev => prev.map(p => {
            if (p._id === id) {
               const isLiked = p.likes.includes(user?._id);
               return {
                  ...p,
                  likes: isLiked ? p.likes.filter(uid => uid !== user?._id) : [...p.likes, user?._id]
               };
            }
            return p;
         }));
         await put(`/feed/${id}/like`);
      } catch (err) {
         loadFeed();
      }
   };

   const handleAddComment = async (postId, text) => {
      if (!isAuthenticated) {
         setAuthModalOpen(true);
         return;
      }
      if (!text.trim()) return;

      try {
         const updatedPost = await post(`/feed/${postId}/comment`, { text });
         setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
         showToast("Answer posted!", "success");
      } catch (err) {
         showToast("Failed to post comment", "error");
      }
   };

   const handleDeleteComment = async (postId, commentId) => {
      if (!window.confirm("Delete this answer?")) return;
      try {
         const updatedPost = await del(`/feed/${postId}/comment/${commentId}`);
         setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
         showToast("Answer removed", "success");
      } catch (err) {
         showToast("Failed to delete", "error");
      }
   };

   const filteredPosts = posts.filter(post =>
      post.author && (
         post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         post.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      )
   );

   return (
      <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white pb-12 font-sans selection:bg-indigo-500/30">

         {/* --- HERO SECTION --- */}
         <div className="relative pt-32 pb-20 overflow-hidden border-b border-slate-200 dark:border-white/5 bg-[#fafafa] dark:bg-[#080808]">
            {/* Background Orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
               <div className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[100px]" />
               <div className="absolute top-1/2 -right-20 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1264px] mx-auto px-6 relative z-10 flex flex-col items-center">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
               >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-2xl">
                     <Sparkles size={14} className="text-amber-400" /> Knowledge Sharing
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
                     Find Answers. <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300">Share Knowledge.</span>
                  </h1>
                  <p className="max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                     Technical help, career advice, and recruiter discussions and discussions of candidates. The hub for the OneStop community.
                  </p>

                  <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 max-w-3xl mx-auto w-full px-4">
                     <div className="relative group flex-[2] min-w-0">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                           type="text"
                           placeholder="Search discussions, questions, or topics..."
                           className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-5 pl-14 pr-6 text-base font-bold shadow-2xl shadow-slate-200/50 dark:shadow-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <motion.button
                        onClick={() => setShowCreateForm(true)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        style={{
                           backgroundSize: "200% auto",
                           backgroundImage: "linear-gradient(to right, #4338ca, #6366f1, #4f46e5, #4338ca)"
                        }}
                        className="flex-1 min-w-[200px] px-8 py-5 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden group transition-all"
                     >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer pointer-events-none"></div>
                        <Plus size={22} strokeWidth={3} /> Ask Publicly
                     </motion.button>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* --- MAIN CONTENT AREA --- */}
         <div className="max-w-[1264px] mx-auto px-6 mt-12 flex flex-col md:flex-row gap-10 relative">

            {/* --- LEFT SIDEBAR (STICKY ON DESKTOP) --- */}
            <aside className="w-full md:w-56 shrink-0 space-y-2 sticky top-24 h-fit hidden md:block">
               <nav className="space-y-1">
                  <SidebarLink icon={Globe} label="Home" active={activeTab === "All"} onClick={() => setActiveTab("All")} />
                  <div className="pt-6 pb-2 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Public</div>
                  <SidebarLink icon={Briefcase} label="Candidate Discussion" active={activeTab === "Candidate Discussion"} onClick={() => setActiveTab("Candidate Discussion")} />
                  <SidebarLink icon={HelpCircle} label="Tech Help" active={activeTab === "Tech Help"} onClick={() => setActiveTab("Tech Help")} />
                  <SidebarLink icon={BarChart2} label="Career Advice" active={activeTab === "Career Advice"} onClick={() => setActiveTab("Career Advice")} />
                  <SidebarLink icon={Users} label="Users" />
                  <SidebarLink icon={Tag} label="Tags" />
               </nav>

               <div className="mt-10 p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-600/5 border border-indigo-100 dark:border-indigo-500/10">
                  <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Zap size={14} className="fill-current" /> Premium Hint
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                     Mention your company to get insights from fellow recruiters!
                  </p>
               </div>
            </aside>

            {/* --- FEED AREA --- */}
            <main className="flex-1 min-w-0">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-white/5 gap-4">
                  <h2 className="text-3xl font-black tracking-tight dark:text-white">
                     {activeTab === "All" ? "Recent Discussions" : activeTab}
                  </h2>
                  <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10 shrink-0">
                     <TabButton label="Newest" active />
                     <TabButton label="Trending" />
                     <TabButton label="No Answers" />
                  </div>
               </div>

               {/* Question Creation Modal/Overlay */}
               <AnimatePresence>
                  {showCreateForm && (
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                     >
                        <div className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[32px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                           <button onClick={() => setShowCreateForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-white/5 p-2 rounded-full">
                              <X size={24} />
                           </button>

                           <div className="mb-8">
                              <h3 className="text-3xl font-black mb-2">Ask a Question</h3>
                              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Share your expertise or get help.</p>
                           </div>

                           <div className="space-y-6">
                              <div>
                                 <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">Title</label>
                                 <input
                                    type="text"
                                    placeholder="Be specific and imagine you’re asking a person"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all text-sm"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                 />
                              </div>

                              <div>
                                 <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">Topic Category</label>
                                 <select
                                    className="w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all text-sm appearance-none dark:text-white"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                 >
                                    <option value="General" className="dark:bg-[#1a1c23]">General Discussion</option>
                                    <option value="Candidate Discussion" className="dark:bg-[#1a1c23]">Candidate Discussion (Recruiters)</option>
                                    <option value="Tech Help" className="dark:bg-[#1a1c23]">Technical Help</option>
                                    <option value="Career Advice" className="dark:bg-[#1a1c23]">Career Advice</option>
                                 </select>
                              </div>

                              <div>
                                 <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">Details</label>
                                 <textarea
                                    placeholder="Explain your problem or topic in detail..."
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all text-sm min-h-[200px] resize-y"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                 />
                              </div>

                              <div>
                                 <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">Tags</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. reactjs, backend, interview-tips"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all text-sm"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                 />
                              </div>

                              <div className="pt-4">
                                 <button
                                    onClick={handleCreatePost}
                                    disabled={creating}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                 >
                                    {creating ? <Loader className="animate-spin" size={20} /> : <><Rocket size={20} /> Launch Discussion</>}
                                 </button>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

               {/* Feed List */}
               <div className="space-y-4">
                  {loading ? (
                     [1, 2, 3, 4].map(i => (
                        <div key={i} className="p-6 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-3xl animate-pulse space-y-4">
                           <div className="h-6 w-3/4 bg-slate-100 dark:bg-white/5 rounded-full" />
                           <div className="h-4 w-1/2 bg-slate-100 dark:bg-white/5 rounded-full" />
                           <div className="flex gap-2">
                              <div className="h-8 w-16 bg-slate-100 dark:bg-white/5 rounded-full" />
                              <div className="h-8 w-16 bg-slate-100 dark:bg-white/5 rounded-full" />
                           </div>
                        </div>
                     ))
                  ) : (
                     <AnimatePresence mode="popLayout">
                        {filteredPosts.map((post, idx) => (
                           <QuestionCard
                              key={post._id}
                              post={post}
                              user={user}
                              index={idx}
                              handleLike={() => handleLike(post._id)}
                              handleDelete={() => handleDeletePost(post._id)}
                              handleAddComment={handleAddComment}
                              handleDeleteComment={handleDeleteComment}
                           />
                        ))}
                     </AnimatePresence>
                  )}

                  {!loading && filteredPosts.length === 0 && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 px-6 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[32px]">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                           <HelpCircle size={48} className="text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-2xl font-black mb-3">No active discussions</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-bold mb-8">Try adjusting your filters or search keywords to find what you're looking for.</p>
                        <button onClick={() => setShowCreateForm(true)} className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm active:scale-95 transition-all">Start a Conversation</button>
                     </motion.div>
                  )}
               </div>
            </main>

            {/* --- RIGHT SIDEBAR --- */}
            <aside className="hidden lg:block w-80 shrink-0 space-y-6 sticky top-24 h-fit">
               <div className="bg-amber-50 dark:bg-[#2d2a1c] border border-amber-200/50 dark:border-orange-500/10 rounded-[32px] overflow-hidden shadow-xl shadow-amber-200/20 dark:shadow-none">
                  <div className="px-6 py-4 bg-amber-100/50 dark:bg-[#343122] border-b border-amber-200 dark:border-orange-500/10 text-[10px] font-black text-amber-700 dark:text-orange-200 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Star size={14} className="fill-current" /> Hot Discussions
                  </div>
                  <div className="p-6 space-y-5">
                     <BlogLink text="Candidate Evaluation: How to spot leadership potential early?" />
                     <BlogLink text="The future of React Server Components in 2026" />
                     <BlogLink text="Best practices for interviewing remote developers" />
                  </div>
               </div>

               <div className="p-8 border border-slate-200 dark:border-white/10 rounded-[32px] bg-white dark:bg-[#0f1014] shadow-xl shadow-slate-100 dark:shadow-none">
                  <h4 className="text-[11px] font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-indigo-500">
                     <Tag size={18} /> Popular Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {["recruitment", "candidates", "interview", "reactjs", "backend", "system-design", "career", "salary-negotiation"].map(t => (
                        <span key={t} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-lg hover:text-indigo-600 dark:hover:text-white cursor-pointer transition-colors border border-transparent hover:border-indigo-500/30">
                           {t}
                        </span>
                     ))}
                  </div>
               </div>

               <div className="p-8 bg-black dark:bg-white text-white dark:text-black rounded-[32px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/40 transition-all" />
                  <BarChart2 size={40} className="mb-6 opacity-40" />
                  <h4 className="font-black text-2xl mb-2 leading-none">Growing <br /> Together</h4>
                  <p className="text-[11px] font-bold opacity-60 leading-relaxed mb-8">Join the 100k+ users currently collaborating in our community.</p>
                  <button className="w-full py-4 bg-indigo-600 dark:bg-indigo-600 text-white rounded-2xl font-black text-xs hover:scale-105 active:scale-95 transition-all">Join Pro Circle</button>
               </div>
            </aside>
         </div>

         <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
   );
}

// Sub-Components
const SidebarLink = ({ icon: Icon, label, active, onClick }) => (
   <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-black transition-all rounded-2xl ${active ? 'text-indigo-600 dark:text-white bg-indigo-50 dark:bg-indigo-600/10 shadow-sm border border-indigo-100 dark:border-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'}`}
   >
      <Icon size={20} className={`${active ? "text-indigo-600 dark:text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
      <span className="tracking-tight">{label}</span>
   </button>
);

const TabButton = ({ label, active }) => (
   <button className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${active ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>
      {label}
   </button>
);

const QuestionCard = ({ post, user, handleLike, handleDelete, handleAddComment, handleDeleteComment, index }) => {
   const [isExpanded, setIsExpanded] = useState(false);
   const [commentText, setCommentText] = useState("");

   const isLiked = user && post.likes?.includes(user._id);
   const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
   const isAuthor = user && (post.author?._id === user._id || isAdmin);

   const onAddComment = async (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      await handleAddComment(post._id, commentText);
      setCommentText("");
   };

   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.98, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         transition={{ delay: index * 0.05 }}
         className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden hover:border-indigo-500/30 transition-all group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 mb-4"
      >
         <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
               {/* Stats */}
               <div className="flex md:flex-col gap-6 md:w-20 items-center justify-center md:pt-2">
                  <div className="text-center group/stat cursor-pointer" onClick={handleLike}>
                     <div className={`text-xl font-black leading-none mb-1 transition-colors ${isLiked ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>{post.likes?.length || 0}</div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/stat:text-indigo-500">Votes</div>
                  </div>
                  <div
                     onClick={() => setIsExpanded(!isExpanded)}
                     className={`text-center py-2 px-3 rounded-2xl border cursor-pointer transition-all ${post.comments?.length > 0 ? 'bg-emerald-500 text-white border-transparent' : 'border-slate-200 dark:border-white/10 text-slate-400 hover:border-indigo-500'}`}
                  >
                     <div className="text-sm font-black leading-none mb-1">{post.comments?.length || 0}</div>
                     <div className="text-[8px] font-black uppercase tracking-[0.2em]">Answers</div>
                  </div>
               </div>

               {/* Content */}
               <div className="flex-1 space-y-4">
                  <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
                     <div className="flex items-center gap-3 mb-2">
                        {post.category && post.category !== "General" && (
                           <span className="px-2.5 py-1 bg-indigo-600 text-white text-[9px] font-black rounded uppercase tracking-widest">
                              {post.category}
                           </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                           <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                     </div>
                     <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {post.title}
                     </h3>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                     {post.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-slate-50 dark:border-white/5">
                     <div className="flex flex-wrap gap-2">
                        {post.tags?.map(t => (
                           <span key={t} className="px-3 py-1 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-white/5">
                              #{t}
                           </span>
                        ))}
                     </div>

                     <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right flex flex-col">
                           <span className="text-xs font-black dark:text-white">{post.author?.name}</span>
                           <span className="text-[10px] font-bold text-slate-400">Collaborator</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 overflow-hidden border-2 border-slate-200 dark:border-white/20">
                           {post.author?.avatar ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-black">{post.author?.name?.charAt(0)}</div>}
                        </div>
                        {isAuthor && (
                           <button onClick={handleDelete} className="ml-2 p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                              <Trash size={18} />
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Expanded Answers Section */}
         <AnimatePresence>
            {isExpanded && (
               <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5"
               >
                  <div className="p-6 md:p-8 space-y-8">
                     <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                           <MessageCircle size={16} /> {post.comments?.length || 0} Answers
                        </h4>
                        <button
                           onClick={() => setIsExpanded(false)}
                           className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                        >
                           Close Discussion
                        </button>
                     </div>

                     {/* Answers List */}
                     <div className="space-y-6">
                        {post.comments?.filter(c => c.user).map((comment) => (
                           <div key={comment._id} className="flex gap-4 group/comment">
                              <div className="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10">
                                 {comment.user?.avatar ? (
                                    <img src={comment.user.avatar} className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-xs font-black">
                                       {comment.user?.name?.charAt(0)}
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 space-y-1">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-black dark:text-white">{comment.user?.name}</span>
                                       <span className="text-[10px] font-medium text-slate-400">• {new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {(user?._id === comment.user?._id || isAuthor) && (
                                       <button
                                          onClick={() => handleDeleteComment(post._id, comment._id)}
                                          className="opacity-0 group-hover/comment:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                                       >
                                          <Trash size={14} />
                                       </button>
                                    )}
                                 </div>
                                 <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    {comment.text}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>

                     {/* Add Answer Input */}
                     <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                        <form onSubmit={onAddComment} className="relative">
                           <textarea
                              placeholder="Write your answer..."
                              className="w-full bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px] resize-none"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                           />
                           <button
                              type="submit"
                              disabled={!commentText.trim()}
                              className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                           >
                              <SendHorizonal size={18} />
                           </button>
                        </form>
                        <p className="mt-3 text-[10px] font-bold text-slate-400">
                           Press Enter to post your answer. Keep it helpful and professional.
                        </p>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   );
};

const BlogLink = ({ text, icon: Icon = ExternalLink }) => (
   <div className="flex gap-4 group cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
         <Icon size={14} className="text-slate-400 group-hover:text-white" />
      </div>
      <span className="text-[12px] text-slate-600 dark:text-slate-300 font-bold group-hover:text-indigo-600 leading-snug transition-colors line-clamp-2">{text}</span>
   </div>
);
