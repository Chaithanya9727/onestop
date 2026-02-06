import React, { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
   Plus, Github, ExternalLink, Heart, Send, Search, LayoutGrid, X, Loader, Layers, Trophy, Sparkles
} from "lucide-react";
import { useToast } from "../components/ToastProvider";
import AuthModal from "../components/AuthModal";

export default function Projects() {
   const { user, isAuthenticated } = useAuth();
   const { get, post, put } = useApi();
   const { showToast } = useToast();

   const [projects, setProjects] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [createOpen, setCreateOpen] = useState(false);
   const [creating, setCreating] = useState(false);

   // Form State
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [image, setImage] = useState("");
   const [repoLink, setRepoLink] = useState("");
   const [demoLink, setDemoLink] = useState("");
   const [tags, setTags] = useState("");

   // Auth Modal
   const [isAuthModalOpen, setAuthModalOpen] = useState(false);

   useEffect(() => {
      loadProjects();
   }, []);

   const loadProjects = async () => {
      try {
         const data = await get("/projects");
         setProjects(data);
      } catch {
         showToast("Failed to load projects", "error");
      } finally {
         setLoading(false);
      }
   };

   const handleCreate = async (e) => {
      e.preventDefault();
      if (!isAuthenticated) {
         setAuthModalOpen(true);
         return;
      }
      if (!title || !description || !image) return;

      setCreating(true);
      try {
         const newProject = await post("/projects", {
            title,
            description,
            image,
            repoLink,
            demoLink,
            tags: tags.split(",").map(t => t.trim()).filter(Boolean)
         });
         setProjects([newProject, ...projects]);
         setCreateOpen(false);
         resetForm();
         showToast("Project added successfully!", "success");
      } catch {
         showToast("Failed to add project", "error");
      } finally {
         setCreating(false);
      }
   };

   const resetForm = () => {
      setTitle(""); setDescription(""); setImage(""); setRepoLink(""); setDemoLink(""); setTags("");
   };

   const handleLike = async (id) => {
      if (!isAuthenticated) {
         setAuthModalOpen(true);
         return;
      }
      try {
         // Optimistic
         setProjects(prev => prev.map(p => {
            if (p._id === id) {
               const isLiked = p.likes.includes(user?._id);
               return {
                  ...p,
                  likes: isLiked ? p.likes.filter(uid => uid !== user?._id) : [...p.likes, user?._id]
               };
            }
            return p;
         }));
         await put(`/projects/${id}/like`);
      } catch {
         loadProjects();
      }
   };

   const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-24 pb-20 px-6 relative overflow-hidden transition-colors duration-300">

         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] transition-colors" />
         </div>

         <div className="max-w-7xl mx-auto relative z-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
               <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                     <Layers size={14} /> Community Builds
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
                     Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">Showcase</span>
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mt-2 text-lg">Discover incredible things built by our community.</p>
               </div>
               <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80 group">
                     <Search size={18} className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-500 transition-colors" />
                     <input
                        type="text" placeholder="Search by title, stack, or tags..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 shadow-lg shadow-slate-200/50 dark:shadow-lg"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <button
                     onClick={() => {
                        if (!isAuthenticated) setAuthModalOpen(true);
                        else setCreateOpen(true);
                     }}
                     className="px-6 py-3 bg-white dark:bg-white text-purple-700 dark:text-purple-900 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-200 shadow-xl shadow-slate-200/50 dark:shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 w-full md:w-auto justify-center border border-slate-200 dark:border-transparent"
                  >
                     <Plus size={20} /> Share Project
                  </button>
               </div>
            </div>

            {/* Grid */}
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 animate-pulse shadow-sm" />)}
               </div>
            ) : (
               <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                     {filteredProjects.map((project, index) => {
                        const isLiked = isAuthenticated && project.likes.includes(user?._id);
                        return (
                           <motion.div
                              key={project._id}
                              layout
                              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-white dark:bg-[#0f1014] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-lg border border-slate-200 dark:border-white/5 overflow-hidden group hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-2xl transition-all flex flex-col h-full"
                           >
                              <div className="h-56 overflow-hidden bg-slate-100 dark:bg-[#1a1a1a] relative">
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 dark:opacity-60 z-10" />
                                 <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-100 dark:opacity-80 group-hover:dark:opacity-100" />

                                 {/* Overlay Actions */}
                                 <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-end gap-3 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    {project.repoLink && <a href={project.repoLink} target="_blank" className="p-2.5 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-xl text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-600 transition-colors border border-white/20 dark:border-white/10 shadow-lg"><Github size={18} /></a>}
                                    {project.demoLink && <a href={project.demoLink} target="_blank" className="p-2.5 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-xl text-slate-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-600 transition-colors border border-white/20 dark:border-white/10 shadow-lg"><ExternalLink size={18} /></a>}
                                 </div>
                              </div>

                              <div className="p-6 flex flex-col flex-1">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10">
                                       <img src={project.author?.avatar || `https://ui-avatars.com/api/?name=${project.author?.name}`} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                       <div className="text-xs font-bold text-slate-900 dark:text-white">{project.author?.name}</div>
                                       <div className="text-[10px] text-slate-500 font-medium">{new Date(project.createdAt).toLocaleDateString()}</div>
                                    </div>
                                 </div>

                                 <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{project.title}</h3>
                                 <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed flex-1 font-medium">{project.description}</p>

                                 <div className="flex items-center gap-2 mb-6 flex-wrap">
                                    {project.tags.slice(0, 3).map((tag, i) => (
                                       <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-lg">#{tag}</span>
                                    ))}
                                    {project.tags.length > 3 && <span className="text-xs text-slate-500 font-medium">+{project.tags.length - 3}</span>}
                                 </div>

                                 <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between mt-auto">
                                    <button onClick={() => handleLike(project._id)} className={`flex items-center gap-1.5 text-sm font-bold transition-all px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500 dark:hover:text-red-400'}`}>
                                       <Heart size={18} className={isLiked ? "fill-current" : ""} />
                                       {project.likes.length}
                                    </button>
                                    <button onClick={() => window.open(project.demoLink || project.repoLink, '_blank')} className="text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 transition-colors">
                                       View Details
                                    </button>
                                 </div>
                              </div>
                           </motion.div>
                        );
                     })}
                  </AnimatePresence>
               </motion.div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
               {createOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-md">
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0f1014] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-white/10 custom-scrollbar">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-[#0f1014]/95 backdrop-blur-xl z-10">
                           <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Sparkles className="text-purple-600 dark:text-purple-500" size={20} /> Share Project</h2>
                           <button onClick={() => setCreateOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Title <span className="text-red-500">*</span></label>
                                 <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-500/50 transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 font-medium" placeholder="e.g. AI Travel Planner" required />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Image URL <span className="text-red-500">*</span></label>
                                 <input type="url" value={image} onChange={e => setImage(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-500/50 transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 font-medium" placeholder="https://..." required />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description <span className="text-red-500">*</span></label>
                              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-500/50 transition-colors text-slate-700 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 font-medium min-h-[120px] resize-none custom-scrollbar" placeholder="What does it do? Tech stack?" required />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repositories Link</label>
                                 <input type="text" value={repoLink} onChange={e => setRepoLink(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-500/50 transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 font-medium" placeholder="GitHub URL" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Demo Link</label>
                                 <input type="text" value={demoLink} onChange={e => setDemoLink(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-500/50 transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 font-medium" placeholder="Website URL" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</label>
                              <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-500/50 transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 font-medium" placeholder="React, Node.js, AI (comma separated)" />
                           </div>

                           <div className="pt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                              <button type="button" onClick={() => setCreateOpen(false)} className="px-6 py-3 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                              <button type="submit" disabled={creating} className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 transition-all">
                                 {creating ? <Loader className="animate-spin" size={20} /> : 'Publish Project'}
                              </button>
                           </div>
                        </form>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>

         </div>
         <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
   );
}
