import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { useLocation, useNavigate } from "react-router-dom";
import ResourceCard from "../components/ResourceCard";
import {
   Search, BookOpen, Youtube, Filter, PlusCircle, X,
   PlayCircle, Clock, Loader, Upload, Library, ExternalLink, Map, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "../components/AuthModal";

const ROADMAPS = {
   "frontend": "frontend",
   "front end": "frontend",
   "backend": "backend",
   "back end": "backend",
   "fullstack": "full-stack",
   "full stack": "full-stack",
   "devops": "devops",
   "ai": "ai-data-scientist",
   "data science": "ai-data-scientist",
   "react": "react",
   "angular": "angular",
   "vue": "vue",
   "java": "java",
   "python": "python",
   "javascript": "javascript",
   "node": "nodejs",
   "nodejs": "nodejs",
   "android": "android",
   "ios": "ios",
   "flutter": "flutter",
   "sql": "sql",
   "system design": "system-design",
   "blockchain": "blockchain",
   "cyber security": "cyber-security",
   "ux": "ux-design",
   "game dev": "game-developer"
};

export default function Resources() {
   const { user, role, isAuthenticated } = useAuth();
   const { get, post, del, put, patch } = useApi();
   const location = useLocation();
   const navigate = useNavigate();

   const [tabValue, setTabValue] = useState(0); // 0 = Library, 1 = Videos, 2 = Ebooks, 3 = Pending
   const [list, setList] = useState([]);
   const [videoSearch, setVideoSearch] = useState("");
   const [ebookSearch, setEbookSearch] = useState("");
   const [videos, setVideos] = useState([]);
   const [ebooks, setEbooks] = useState([]);
   const [roadmapResult, setRoadmapResult] = useState(null);
   const [loading, setLoading] = useState(false);
   const [selectedVideo, setSelectedVideo] = useState(null);

   // Filters
   const [search, setSearch] = useState("");
   const [filterType, setFilterType] = useState("all");
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);

   // Form State
   const [showForm, setShowForm] = useState(false);
   const [form, setForm] = useState({ title: "", description: "", type: "note", url: "", file: null });
   const [editId, setEditId] = useState(null);
   const [msg, setMsg] = useState({ type: "", text: "" });

   // Auth Modal
   const [isAuthModalOpen, setAuthModalOpen] = useState(false);

   const queryParams = new URLSearchParams(location.search);
   const filter = queryParams.get("filter");
   const canManage = isAuthenticated && ["candidate", "admin", "superadmin"].includes(role?.toLowerCase());
   const isAdmin = isAuthenticated && ["admin", "superadmin"].includes(role?.toLowerCase());

   // Load Resources
   const load = async (reset = false) => {
      try {
         setLoading(true);
         let reqStatus = tabValue === 3 ? "pending" : "approved";
         if (filter === "my") reqStatus = "";

         const data = await get(`/resources?search=${encodeURIComponent(search)}&type=${filterType}&status=${reqStatus}&page=${page}&limit=8&filter=${filter || ''}`);
         let resources = data.resources || [];

         if (filter === "my" && user) {
            resources = resources.filter((r) => r.createdBy?._id === user._id);
         }
         setList(reset ? resources : [...list, ...resources]);
         setHasMore(page < data.pages);
      } catch (err) {
         console.error("Failed to load resources", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { if (tabValue === 0 || tabValue === 3) { setPage(1); load(true); } }, [filter, user, search, filterType, tabValue]);
   useEffect(() => { if (page > 1 && (tabValue === 0 || tabValue === 3)) load(); }, [page]);

   // Load Videos
   const searchVideos = async () => {
      setLoading(true);
      try {
         const res = await get(`/resources/videos?search=${encodeURIComponent(videoSearch || "programming tutorial")}`);
         setVideos(res || []);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
   };

   useEffect(() => { if (tabValue === 1) searchVideos(); }, [tabValue]);

   // Load Ebooks (Google Books API)
   const searchEbooks = async () => {
      setLoading(true);
      setRoadmapResult(null); // Reset roadmap

      // Check for Roadmap Match
      const queryLower = (ebookSearch || "software engineering").toLowerCase();
      const matchedKey = Object.keys(ROADMAPS).find(key => queryLower.includes(key));
      if (matchedKey) {
         setRoadmapResult({
            title: `${matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1)} Developer Roadmap`,
            slug: ROADMAPS[matchedKey],
            description: `A complete step-by-step guide to becoming a ${matchedKey} developer.`
         });
      }

      try {
         const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(ebookSearch || "software engineering")}&maxResults=20`);
         const data = await res.json();
         setEbooks(data.items || []);
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { if (tabValue === 2) searchEbooks(); }, [tabValue]);

   // CRUD
   const approve = async (id, status) => {
      if (!isAuthenticated) { setAuthModalOpen(true); return; }
      try {
         await patch(`/resources/${id}/status`, { status });
         setList(prev => prev.filter(r => r._id !== id));
         setMsg({ type: "success", text: `Resource ${status} successfully` });
      } catch (e) {
         setMsg({ type: "error", text: "Action failed" });
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isAuthenticated) { setAuthModalOpen(true); return; }
      setMsg({ type: "", text: "" });
      try {
         const formData = new FormData();
         Object.keys(form).forEach(key => {
            if (form[key]) formData.append(key, form[key]);
         });

         if (editId) {
            const updated = await put(`/resources/${editId}`, formData, true);
            setList(prev => prev.map(x => x._id === editId ? updated : x));
            setMsg({ type: "success", text: "Resource updated successfully" });
         } else {
            await post("/resources", formData, true);
            setMsg({ type: "success", text: isAdmin ? "Resource added successfully" : "Resource submitted for approval" });
            if (tabValue === 0) { setPage(1); load(true); }
         }
         resetForm();
      } catch {
         setMsg({ type: "error", text: "Operation failed" });
      }
   };

   const remove = async (id) => {
      if (!isAuthenticated) { setAuthModalOpen(true); return; }
      if (!window.confirm("Delete this resource?")) return;
      try {
         await del(`/resources/${id}`);
         setList(prev => prev.filter(x => x._id !== id));
         setMsg({ type: "success", text: "Deleted successfully" });
      } catch { setMsg({ type: "error", text: "Delete failed" }); }
   };

   const resetForm = () => {
      setForm({ title: "", description: "", type: "note", url: "", file: null });
      setEditId(null);
      setShowForm(false);
   };

   const startEdit = (r) => {
      if (!isAuthenticated) { setAuthModalOpen(true); return; }
      setEditId(r._id);
      setForm({ title: r.title, description: r.description || "", type: r.type || "note", url: r.url || "", file: null });
      setShowForm(true);
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">

         {/* Background Gradients */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px]" />
         </div>

         {/* Hero */}
         <div className="relative pt-12 pb-16 px-6 z-10">
            <div className="max-w-7xl mx-auto text-center">
               <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
               >
                  <BookOpen size={14} /> Knowledge Hub
               </motion.div>
               <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 dark:text-white"
               >
                  Learn & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Grow</span>
               </motion.h1>
               <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium"
               >
                  Access curated study materials, lecture notes, video tutorials, and a vast library of ebooks to accelerate your learning journey.
               </motion.p>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-6 relative z-20">
            {/* Navigation Bar */}
            <div className="bg-white/80 dark:bg-[#0f1014]/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/5 p-2 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-40 shadow-xl shadow-slate-200/50 dark:shadow-2xl">
               <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-full md:w-auto overflow-x-auto border border-slate-200 dark:border-white/5">
                  {[
                     { id: 0, label: "Document Library", icon: BookOpen },
                     { id: 1, label: "Video Search", icon: Youtube },
                     { id: 2, label: "Books & Roadmaps", icon: Library },
                     ...(isAdmin ? [{ id: 3, label: "Approvals", icon: Clock }] : [])
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setTabValue(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none whitespace-nowrap
                     ${tabValue === tab.id
                              ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-md dark:shadow-blue-600/20 ring-1 ring-slate-200 dark:ring-0'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                           }
                   `}
                     >
                        <tab.icon size={18} /> {tab.label}
                     </button>
                  ))}
               </div>

               {tabValue === 0 && (
                  <div className="flex gap-3 w-full md:w-auto">
                     <button
                        onClick={() => {
                           if (!isAuthenticated) setAuthModalOpen(true);
                           else navigate(filter === 'my' ? '/resources' : '/resources?filter=my');
                        }}
                        className={`px-5 py-3 rounded-xl font-bold text-sm border transition-all ${filter === 'my' ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:border-white dark:text-black' : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white'}`}
                     >
                        My Uploads
                     </button>
                     <button
                        onClick={() => {
                           if (!isAuthenticated) setAuthModalOpen(true);
                           else setShowForm(!showForm);
                        }}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                     >
                        {showForm ? <X size={18} /> :
                           <>
                              <PlusCircle size={18} /> Add Resource
                           </>
                        }
                     </button>
                  </div>
               )}
            </div>

            {/* MESSAGES */}
            <AnimatePresence>
               {msg.text && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 mb-6 rounded-2xl border font-bold flex items-center gap-3 shadow-lg ${msg.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500' : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-500'}`}>
                     {msg.type === 'error' ? <X size={20} /> : <div className="w-2 h-2 rounded-full bg-green-500" />} {msg.text}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* 1️⃣ DOCUMENT LIBRARY & PENDING APPROVALS */}
            {(tabValue === 0 || tabValue === 3) && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* ADD FORM */}
                  <AnimatePresence>
                     {showForm && tabValue === 0 && (
                        <motion.form
                           initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                           onSubmit={handleSubmit} className="bg-white dark:bg-[#0f1014] p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl mb-8 overflow-hidden relative"
                        >
                           <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-20 pointer-events-none">
                              <Upload size={120} className="text-blue-600 dark:text-blue-500" />
                           </div>

                           <h3 className="font-bold text-xl mb-6 text-slate-800 dark:text-white flex items-center gap-2 relative z-10">
                              {editId ? "Edit Resource" : "Upload New Material"}
                           </h3>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                              <div className="col-span-2 md:col-span-1">
                                 <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">Title</label>
                                 <input type="text" placeholder="e.g. Data Structures Notes" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-medium transition-all" required />
                              </div>

                              <div className="col-span-2 md:col-span-1">
                                 <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">Type</label>
                                 <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500/50 text-slate-900 dark:text-white cursor-pointer transition-all appearance-none text-sm font-bold">
                                    <option value="note">Note / Document</option>
                                    <option value="tutorial">Video Tutorial</option>
                                    <option value="link">External Link</option>
                                 </select>
                              </div>

                              <div className="col-span-2">
                                 <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                                 <textarea placeholder="Briefly describe this resource..." rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all resize-none text-sm font-medium" />
                              </div>

                              <div className="col-span-2">
                                 <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">Link or File</label>
                                 <div className="flex flex-col md:flex-row gap-4">
                                    <input type="text" placeholder="External URL (Optional)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="flex-1 px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all text-sm font-medium" />

                                    <label className="flex-1 cursor-pointer flex items-center justify-center px-5 py-3 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-blue-500 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-white transition-all group font-bold text-sm">
                                       <span className="truncate">{form.file ? form.file.name : "Attach File (PDF, DOC)"}</span>
                                       <input type="file" hidden onChange={e => setForm({ ...form, file: e.target.files[0] })} />
                                    </label>
                                 </div>
                              </div>

                              <div className="col-span-2 pt-4 flex gap-4">
                                 <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">Cancel</button>
                                 <button type="submit" className="flex-1 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                    {editId ? "Save Changes" : "Upload Resource"}
                                 </button>
                              </div>
                           </div>
                        </motion.form>
                     )}
                  </AnimatePresence>

                  {/* FILTERS OR APPROVAL HEADER */}
                  {tabValue === 3 ? (
                     <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-6 rounded-[1.5rem] mb-8 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-500">
                           <Clock size={24} />
                        </div>
                        <div>
                           <h3 className="font-bold text-orange-700 dark:text-orange-400 text-lg">Pending Approvals</h3>
                           <p className="text-orange-600/70 dark:text-orange-500/70 text-sm font-medium">{list.length} items waiting for review.</p>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-1 group">
                           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                           <input type="text" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-14 pr-4 py-4 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50 shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium transition-all" />
                        </div>
                        <div className="relative w-full md:w-64 group">
                           <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                           <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full pl-14 pr-4 py-4 bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-white/5 rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none appearance-none cursor-pointer font-medium transition-all">
                              <option value="all">All Types</option>
                              <option value="note">Notes</option>
                              <option value="tutorial">Tutorials</option>
                              <option value="link">Links</option>
                           </select>
                        </div>
                     </div>
                  )}

                  {/* LIST */}
                  {list.length === 0 && !loading ? (
                     <div className="text-center py-32 bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5">
                        <div className="inline-flex p-6 rounded-full bg-slate-50 dark:bg-white/5 mb-4 text-slate-400 dark:text-slate-500"><BookOpen size={48} /></div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">No resources found</h3>
                        <p className="text-slate-500 mt-2 font-medium">Try adjusting your filters or upload a new resource.</p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                           {list.map(r => (
                              <motion.div layout key={r._id} className="relative h-full">
                                 <ResourceCard
                                    resource={r}
                                    user={user}
                                    role={role}
                                    onEdit={startEdit}
                                    onDelete={remove}
                                    onDownload={() => {
                                       if (!isAuthenticated) setAuthModalOpen(true);
                                       else {
                                          // Default download behavior or logic inside ResourceCard
                                          // This is just a hook to trigger auth modal
                                       }
                                    }}
                                 />
                                 {tabValue === 3 && (
                                    <div className="absolute top-3 left-3 z-20 flex gap-2">
                                       <button onClick={() => approve(r._id, 'approved')} className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 shadow-lg border border-green-400">Approve</button>
                                       <button onClick={() => approve(r._id, 'rejected')} className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 shadow-lg border border-red-400">Reject</button>
                                    </div>
                                 )}
                              </motion.div>
                           ))}
                        </AnimatePresence>
                     </div>
                  )}

                  {hasMore && !loading && (
                     <div className="text-center mt-12">
                        <button onClick={() => setPage(p => p + 1)} className="px-8 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm">Load More</button>
                     </div>
                  )}
               </motion.div>
            )}

            {/* 2️⃣ VIDEO SEARCH */}
            {tabValue === 1 && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <form onSubmit={(e) => { e.preventDefault(); searchVideos(); }} className="max-w-2xl mx-auto mb-12 relative flex shadow-2xl shadow-slate-200/50 dark:shadow-none group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
                     <input
                        type="text" placeholder="Search for video tutorials..."
                        value={videoSearch} onChange={e => setVideoSearch(e.target.value)}
                        className="flex-1 pl-16 pr-6 py-5 bg-white dark:bg-[#0f1014] rounded-l-2xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 transition-all border-r-0 font-medium"
                     />
                     <button type="submit" className="px-10 bg-blue-600 text-white font-bold rounded-r-2xl hover:bg-blue-500 transition-all border border-blue-600 border-l-0 shadow-lg shadow-blue-600/20">Search</button>
                  </form>

                  {loading ? (
                     <div className="flex justify-center py-32"><Loader className="animate-spin text-blue-600 dark:text-blue-500" size={48} /></div>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {videos.map((v) => (
                           <div key={v.id} onClick={() => {
                              if (!isAuthenticated) setAuthModalOpen(true);
                              else setSelectedVideo(v);
                           }} className="group cursor-pointer bg-white dark:bg-[#0f1014] rounded-[1.5rem] border border-slate-200 dark:border-white/5 p-3 hover:border-blue-200 dark:hover:border-white/10 transition-all hover:-translate-y-1 shadow-sm hover:shadow-xl dark:shadow-none">
                              <div className="relative aspect-video rounded-xl bg-slate-100 dark:bg-black overflow-hidden mb-4 shadow-sm border border-slate-100 dark:border-white/5">
                                 <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                                 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                    <PlayCircle className="text-white drop-shadow-md" size={48} />
                                 </div>
                              </div>
                              <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors px-1 mb-1">{v.title}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-500 px-1 font-bold uppercase tracking-wider">{v.channel}</p>
                           </div>
                        ))}
                     </div>
                  )}
               </motion.div>
            )}

            {/* 3️⃣ EBOOK & ROADMAP SEARCH */}
            {tabValue === 2 && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <form onSubmit={(e) => { e.preventDefault(); searchEbooks(); }} className="max-w-2xl mx-auto mb-12 relative flex shadow-2xl shadow-slate-200/50 dark:shadow-none group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
                     <input
                        type="text" placeholder="Search for ebooks, content, roadmaps..."
                        value={ebookSearch} onChange={e => setEbookSearch(e.target.value)}
                        className="flex-1 pl-16 pr-6 py-5 bg-white dark:bg-[#0f1014] rounded-l-2xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 transition-all border-r-0 font-medium"
                     />
                     <button type="submit" className="px-10 bg-blue-600 text-white font-bold rounded-r-2xl hover:bg-blue-500 transition-all border border-blue-600 border-l-0 shadow-lg shadow-blue-600/20">Search</button>
                  </form>

                  {loading ? (
                     <div className="flex justify-center py-32"><Loader className="animate-spin text-blue-600 dark:text-blue-500" size={48} /></div>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* ROADMAP CARD (FEATURED) */}
                        {roadmapResult && (
                           <div className="col-span-1 sm:col-span-2 lg:col-span-2 group bg-gradient-to-br from-blue-600 to-purple-600 rounded-[1.5rem] border border-blue-400/30 p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-blue-600/20">
                              <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                              <div className="relative z-10">
                                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                                    <Map size={12} /> Official Roadmap
                                 </div>
                                 <h3 className="text-3xl font-black text-white mb-2">{roadmapResult.title}</h3>
                                 <p className="text-blue-100 font-medium mb-8 max-w-md">{roadmapResult.description}</p>

                                 <div className="flex gap-4">
                                    <a
                                       href={`https://roadmap.sh/${roadmapResult.slug}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); setAuthModalOpen(true); } }}
                                       className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                    >
                                       View Clear Roadmap <ExternalLink size={16} />
                                    </a>
                                    <a
                                       href={`https://roadmap.sh/${roadmapResult.slug}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); setAuthModalOpen(true); } }}
                                       className="px-6 py-3 bg-blue-700/50 text-white border border-white/20 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                       <FileText size={16} /> Roadmap PDF
                                    </a>
                                 </div>
                              </div>

                              <Map className="absolute -bottom-4 -right-4 text-white/10 rotate-12" size={200} />
                           </div>
                        )}

                        {ebooks.map((book) => {
                           const info = book.volumeInfo;
                           const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "https://via.placeholder.com/128x192.png?text=No+Cover";

                           return (
                              <div key={book.id} className="group bg-white dark:bg-[#0f1014] rounded-[1.5rem] border border-slate-200 dark:border-white/5 p-4 hover:border-blue-200 dark:hover:border-white/10 transition-all hover:-translate-y-1 shadow-sm hover:shadow-xl dark:shadow-none flex flex-col h-full">
                                 <div className="relative aspect-[2/3] rounded-xl bg-slate-100 dark:bg-black overflow-hidden mb-4 shadow-sm border border-slate-100 dark:border-white/5 mx-auto w-full max-w-[180px]">
                                    <img src={thumbnail} alt={info.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                                 </div>

                                 <div className="flex flex-col flex-1 text-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 text-sm">{info.title}</h3>
                                    {info.authors && (
                                       <p className="text-xs text-slate-500 dark:text-slate-500 font-medium mb-1 line-clamp-1">{info.authors.join(", ")}</p>
                                    )}
                                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider mb-4">{info.publishedDate?.substring(0, 4)}</p>

                                    <div className="mt-auto">
                                       <a
                                          href={info.previewLink || info.infoLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); setAuthModalOpen(true); } }}
                                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all w-full justify-center group-hover:shadow-lg dark:group-hover:shadow-blue-600/20"
                                       >
                                          Read Book <ExternalLink size={12} />
                                       </a>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </motion.div>
            )}

            {/* VIDEO MODAL */}
            <AnimatePresence>
               {selectedVideo && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                     <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-5xl bg-white dark:bg-[#0f1014] rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
                        <div className="relative aspect-video bg-black">
                           <iframe
                              src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                              title={selectedVideo.title}
                              className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                           />
                        </div>
                        <div className="p-6 bg-white dark:bg-[#0a0a0a] flex justify-between items-start gap-6 border-t border-slate-100 dark:border-white/5">
                           <div>
                              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedVideo.title}</h2>
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{selectedVideo.channel}</p>
                           </div>
                           <button onClick={() => setSelectedVideo(null)} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-white transition-colors border border-transparent dark:border-white/5 hover:text-red-500 dark:hover:text-red-400"><X size={24} /></button>
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>
         </div>
         <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
   );
}
