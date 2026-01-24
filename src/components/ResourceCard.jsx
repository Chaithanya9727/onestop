import { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  X,
  PlayCircle,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResourceCard({ resource, user, role, onEdit, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isImage = (url) => url?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
  const isPdf = (url) => url?.match(/\.pdf$/i);
  const isDoc = (url) => url?.match(/\.(doc|docx|ppt|pptx)$/i);

  const getIcon = () => {
    if (resource.type === "link") return <LinkIcon size={20} className="text-blue-500 dark:text-blue-400" />;
    if (resource.type === "tutorial") return <PlayCircle size={20} className="text-red-500 dark:text-red-400" />;
    if (isImage(resource.url)) return <ImageIcon size={20} className="text-purple-500 dark:text-purple-400" />;
    return <FileText size={20} className="text-orange-500 dark:text-orange-400" />;
  };

  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(resource.url);
  const youtubeThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;

  const handleOpen = () => {
    if (resource.type === "link") {
       window.open(resource.url, "_blank", "noopener,noreferrer");
    } else if (isPdf(resource.url) || isDoc(resource.url) || isImage(resource.url)) {
       setIsPreviewOpen(true);
    } else {
       if (!resource.url) return;
       window.open(resource.url, "_blank");
    }
  };

  const isOwner = user && resource.createdBy?._id === user._id;
  const isAdmin = ["admin", "superadmin"].includes(role?.toLowerCase());
  const canManage = isOwner || isAdmin;

  // Generate Embed URL for Google Docs Viewer if needed
  const getEmbedUrl = () => {
      if (isPdf(resource.url) || isDoc(resource.url)) {
         return `https://docs.google.com/gview?url=${encodeURIComponent(resource.url)}&embedded=true`;
      }
      return resource.url;
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group relative bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-blue-400 dark:hover:border-blue-500/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Card Handler for Actions */}
        {canManage && (
          <div className="absolute top-3 right-3 z-10" ref={menuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
              className="p-1.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-black/80 border border-slate-200 dark:border-white/10 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <MoreVertical size={16} />
            </button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-20"
                >
                  <button onClick={() => { onEdit(resource); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-colors text-left uppercase tracking-wide">
                    <Edit size={14} className="text-blue-500" /> Edit
                  </button>
                  <button onClick={() => { onDelete(resource._id); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left uppercase tracking-wide">
                    <Trash2 size={14} className="text-red-500" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Thumbnail Section */}
        <div 
           className="relative h-48 bg-slate-100 dark:bg-[#0a0a0a] overflow-hidden cursor-pointer group"
           onClick={handleOpen}
        >
           {isImage(resource.url) ? (
             <img 
               src={resource.url} 
               alt={resource.title} 
               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
             />
           ) : youtubeThumbnail ? (
             <>
               <img 
                  src={youtubeThumbnail} 
                  alt={resource.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-lg">
                      <PlayCircle className="text-white drop-shadow-md ml-1" size={24} />
                   </div>
               </div>
             </>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#111] dark:to-[#0a0a0a]">
                <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm">
                   {getIcon()}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-600">
                  {resource.type}
                </span>
             </div>
           )}
           
           {/* Overlay on hover */}
           <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
              <span className="flex items-center gap-2 text-white font-bold bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/30 hover:bg-white/30 transition-all shadow-xl">
                 <Eye size={16} /> View
              </span>
           </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
               resource.type === 'tutorial' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20' : 
               resource.type === 'link' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20' : 
               'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20'
            }`}>
               {resource.type}
            </span>
            {resource.status === 'pending' && (
               <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                 Pending
               </span>
            )}
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-auto">
               {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h3 
            className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight"
            onClick={handleOpen}
          >
            {resource.title}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 flex-1 font-medium leading-relaxed">
            {resource.description || "No description provided."}
          </p>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between mt-auto">
             <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                   {resource.createdBy?.name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-500 truncate max-w-[120px]">
                   {resource.createdBy?.name || "User"}
                </span>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Modal Viewer */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-5xl bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[85vh]"
             >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-[#0f1014]">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-white/5">
                         {getIcon()}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-lg">{resource.title}</h3>
                   </div>
                   <div className="flex items-center gap-2">
                      {resource.url && (
                        <a href={resource.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors" title="Open Original">
                           <LinkIcon size={20} />
                        </a>
                      )}
                      <button onClick={() => setIsPreviewOpen(false)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors">
                        <X size={20} />
                      </button>
                   </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 bg-slate-100 dark:bg-[#0a0a0a] relative p-4 flex items-center justify-center">
                  {isImage(resource.url) ? (
                     <div className="w-full h-full flex items-center justify-center overflow-auto">
                        <img src={resource.url} alt="Preview" className="max-w-full max-h-full rounded-xl shadow-lg object-contain" />
                     </div>
                  ) : (
                     <iframe
                       src={getEmbedUrl()}
                       title="Document Viewer"
                       className="w-full h-full border-none bg-white rounded-xl shadow-sm" 
                     />
                  )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
