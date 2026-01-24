import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Heart, Share2, Send, Image as ImageIcon,
  MoreHorizontal, Sparkles, User, Filter, Globe, X, Loader, Trash
} from "lucide-react";
import { useToast } from "../components/ToastProvider";

export default function Community() {
  const { user } = useAuth();
  const { get, post, put, del } = useApi();
  const { showToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  // Comment State
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const data = await get("/feed");
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim()) return;
    try {
      setCreating(true);
      const newPost = await post("/feed", { content });
      setPosts([newPost, ...posts]);
      setContent("");
      showToast("Posted successfully!", "success");
    } catch (err) {
      // Extract error message if available
      const msg = err.response?.data?.message || err.message || "Failed to post";
      showToast(msg, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await del(`/feed/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
      showToast("Post deleted", "success");
    } catch (err) {
      showToast("Failed to delete post", "error");
    }
  };

  const handleLike = async (id) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(p => {
         if (p._id === id) {
            const isLiked = p.likes.includes(user._id);
            return {
               ...p,
               likes: isLiked ? p.likes.filter(uid => uid !== user._id) : [...p.likes, user._id]
            };
         }
         return p;
      }));

      await put(`/feed/${id}/like`);
    } catch (err) {
      console.error(err);
      loadFeed(); // Revert on error
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
       const updatedPost = await post(`/feed/${postId}/comment`, { text: commentText });
       setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
       setCommentText("");
       showToast("Comment added", "success");
    } catch (err) {
       const msg = err.response?.data?.message || err.message || "Failed to add comment";
       showToast(msg, "error");
    } finally {
       setCommenting(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
       await del(`/feed/${postId}/comment/${commentId}`);
       
       // Update global posts state to remove the comment immediately from UI
       setPosts(prev => prev.map(p => {
          if (p._id === postId) {
             return {
                ...p,
                comments: p.comments.filter(c => c._id !== commentId)
             };
          }
          return p;
       }));
       showToast("Comment deleted", "success");
    } catch (err) {
       const msg = err.response?.data?.message || err.message || "Failed to delete comment";
       showToast(msg, "error");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!", "success");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-24 pb-20 px-4 relative overflow-hidden transition-colors duration-300">
        
        {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px] transition-colors" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px] transition-colors" />
       </div>

       <div className="max-w-2xl mx-auto relative z-10">
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Globe size={14} /> Global Feed
             </div>
             <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-3">
                Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Hub</span>
             </h1>
             <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Connect, share insights, and grow with 2M+ developers.</p>
          </motion.div>

          {/* Create Post */}
          <div className="bg-white dark:bg-[#0f1014] p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-xl dark:shadow-none border border-slate-200 dark:border-white/5 mb-10 relative overflow-hidden group focus-within:border-blue-500/30 transition-colors">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
             <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1a1a1a] overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/5">
                   {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold">{user?.name?.charAt(0)}</div>}
                </div>
                <div className="flex-1">
                   <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your thoughts, achievements, or questions..."
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl p-4 focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#0f1014] min-h-[120px] resize-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 transition-all outline-none"
                   />
                   <div className="flex justify-between items-center mt-4">
                      <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">
                         <ImageIcon size={20}/>
                      </button>
                      <button 
                         onClick={handleCreatePost}
                         disabled={!content.trim() || creating}
                         className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-600/20"
                      >
                         {creating ? <Loader size={16} className="animate-spin"/> : <><Send size={16}/> Post</>}
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Feed */}
          <div className="space-y-6">
             {loading ? (
                [1,2,3].map(i => <div key={i} className="h-48 bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 animate-pulse shadow-sm"/>)
             ) : (
                <AnimatePresence>
                {posts.map(post => {
                   const isLiked = post.likes.includes(user?._id);
                   const isAuthor = post.author?._id === user?._id || user?.role === 'admin' || user?.role === 'superadmin';

                   return (
                      <motion.div 
                         key={post._id}
                         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                         className="bg-white dark:bg-[#0f1014] p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-lg border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/10 transition-colors group"
                      >
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1a1a1a] overflow-hidden border border-slate-200 dark:border-white/5">
                                 {post.author?.avatar ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">{post.author?.name?.charAt(0)}</div>} 
                               </div>
                               <div>
                                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{post.author?.name}</h3>
                                  <p className="text-xs text-slate-500 font-medium">{new Date(post.createdAt).toLocaleDateString()}</p>
                               </div>
                            </div>
                            {isAuthor && (
                               <button 
                                  onClick={() => handleDeletePost(post._id)}
                                  className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                               >
                                  <Trash size={18}/>
                               </button>
                            )}
                         </div>

                         <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap text-base font-medium">{post.content}</p>

                         {post.image && (
                            <div className="rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-white/10 relative group-hover:scale-[1.01] transition-transform shadow-md">
                               <img src={post.image} alt="Post content" className="w-full"/>
                            </div>
                         )}

                         <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                            <button 
                               onClick={() => handleLike(post._id)}
                               className={`flex items-center gap-2 text-sm font-bold transition-all p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 ${isLiked ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400'}`}
                            >
                               <Heart size={20} className={isLiked ? "fill-current" : ""}/>
                               {post.likes.length}
                            </button>
                            <button 
                               onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)}
                               className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                               <MessageSquare size={20}/>
                               {post.comments?.length || 0}
                            </button>
                            <button 
                               onClick={handleShare}
                               className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-all ml-auto p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                               <Share2 size={20}/> Share
                            </button>
                         </div>

                         {/* Comments Section */}
                         <AnimatePresence>
                           {activeCommentId === post._id && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex gap-3 mb-6">
                                       <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex-shrink-0 overflow-hidden">
                                          {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-xs font-bold">{user?.name?.charAt(0)}</div>}
                                       </div>
                                       <div className="flex-1 flex gap-2">
                                          <input 
                                             type="text" 
                                             value={commentText}
                                             onChange={(e) => setCommentText(e.target.value)}
                                             onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                                             placeholder="Write a comment..."
                                             className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500/50 text-slate-900 dark:text-white"
                                          />
                                          <button 
                                             onClick={() => handleCommentSubmit(post._id)}
                                             disabled={commenting || !commentText.trim()}
                                             className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20"
                                          >
                                             {commenting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                                          </button>
                                       </div>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                       {post.comments?.length > 0 ? post.comments.map((comment, index) => {
                                          const isCommentAuthor = comment.user?._id === user?._id || user?.role === 'admin';
                                          return (
                                              <div key={index} className="flex gap-3 text-sm group/comment">
                                                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex-shrink-0 overflow-hidden">
                                                     {comment.user?.avatar ? <img src={comment.user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold">{comment.user?.name?.charAt(0) || "?"}</div>}
                                                 </div>
                                                 <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl rounded-tl-sm flex-1 relative group-hover/comment:bg-slate-100 dark:group-hover/comment:bg-white/10 transition-colors">
                                                    <div className="flex items-center justify-between mb-1">
                                                       <div className="font-bold text-slate-900 dark:text-white">{comment.user?.name || "Unknown"}</div>
                                                       <div className="flex items-center gap-2">
                                                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "Just now"}</span>
                                                          {isCommentAuthor && (
                                                             <button onClick={() => handleDeleteComment(post._id, comment._id)} className="opacity-0 group-hover/comment:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                                                                <Trash size={12} />
                                                             </button>
                                                          )}
                                                       </div>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-300">{comment.text}</p>
                                                 </div>
                                              </div>
                                          );
                                       }) : (
                                          <p className="text-center text-slate-400 text-sm py-4">No comments yet. Be the first!</p>
                                       )}
                                    </div>
                                </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </motion.div>
                   );
                })}
                </AnimatePresence>
             )}
          </div>

       </div>
    </div>
  );
}
