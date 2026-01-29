import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Pin, Trash2, Edit2, Download, Paperclip,
  Search, X, PlusCircle, Megaphone, AlertCircle, CheckCircle
} from "lucide-react";

export default function Notices() {
  const { role, token } = useAuth();
  const { get, post, del, put } = useApi();

  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", audience: "all", pinned: false, file: null });
  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterAudience, setFilterAudience] = useState("all");
  const [showPinned, setShowPinned] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const isAdminOrSuper = ["admin", "superadmin"].includes(role?.toLowerCase());

  const load = async (reset = false) => {
    try {
      setLoading(true);
      const data = await get(`/notices?search=${search}&audience=${filterAudience}&pinned=${showPinned}&page=${page}&limit=6`);
      setList(reset ? data.notices : [...list, ...data.notices]);
      setHasMore(page < data.pages);
    } catch {
      setErr("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); load(true); }, [search, filterAudience, showPinned]);
  useEffect(() => { load(page === 1); }, [page]);

  const uploadFile = async (fileObj) => {
    if (!fileObj) return null;
    const formData = new FormData();
    formData.append("file", fileObj);
    const res = await fetch("http://localhost:5000/api/resources/upload", {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
    return (await res.json()).url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setSuccess("");
    try {
      let attachmentUrl = null;
      if (form.file) attachmentUrl = await uploadFile(form.file);

      const payload = { ...form, attachment: attachmentUrl || undefined };

      if (editId) {
        const updated = await put(`/notices/${editId}`, payload);
        setList(prev => prev.map(n => n._id === editId ? updated : n));
        setSuccess("Notice updated successfully");
      } else {
        await post("/notices", payload);
        setSuccess("Notice created successfully");
        setPage(1); load(true);
      }
      resetForm();
    } catch {
      setErr("Operation failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await del(`/notices/${id}`);
      setList(prev => prev.filter(n => n._id !== id));
      setSuccess("Deleted successfully");
    } catch { setErr("Delete failed"); }
  };

  const resetForm = () => {
    setForm({ title: "", body: "", audience: "all", pinned: false, file: null });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (n) => {
    setForm({
      title: n.title, body: n.body, audience: n.audience,
      pinned: n.pinned, file: null
    });
    setEditId(n.id || n._id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-6 md:p-12 relative overflow-hidden transition-colors duration-300">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-100 dark:bg-red-600/5 rounded-full blur-[100px] transition-colors" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[100px] transition-colors" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest mb-4 inline-flex items-center gap-2">
                <Megaphone size={12} /> Official Updates
              </span>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                Notices & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-400 dark:to-orange-400">Updates</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Stay informed with the latest announcements from the team.</p>
            </motion.div>
          </div>
          {isAdminOrSuper && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              {showForm ? <X size={20} /> : <PlusCircle size={20} />}
              {showForm ? "Cancel" : "New Notice"}
            </motion.button>
          )}
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {(err || success) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 rounded-xl border flex items-center gap-2 font-bold ${err ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500' : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-500'}`}>
              {err ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              {err || success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#0f1014] p-4 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center group focus-within:border-blue-500/30 transition-colors"
        >
          <div className="relative flex-1 w-full group/search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/search:text-blue-500 dark:group-focus-within/search:text-blue-400 transition-colors" size={18} />
            <input
              type="text" placeholder="Search notices..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 font-medium transition-all"
            />
          </div>
          <select
            value={filterAudience} onChange={e => setFilterAudience(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-blue-500/50 outline-none cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
          >
            <option value="all">All Audiences</option>
            <option value="candidates">Candidates</option>
            <option value="guests">Guests</option>
            <option value="admins">Admins</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer select-none px-4 py-3 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <input type="checkbox" checked={showPinned} onChange={e => setShowPinned(e.target.checked)} className="rounded text-blue-500 focus:ring-0 bg-transparent border-slate-300 dark:border-white/20" />
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-slate-700 dark:group-hover:text-white transition-colors"><Pin size={14} /> Pinned Only</span>
          </label>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-white dark:bg-[#0f1014] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                {editId ? <Edit2 size={20} className="text-blue-500" /> : <PlusCircle size={20} className="text-blue-500" />}
                {editId ? "Edit Notice" : "Create New Notice"}
              </h3>
              <div className="grid gap-5 relative z-10">
                <input
                  type="text" placeholder="Notice Title"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl focus:border-blue-500/50 outline-none text-slate-900 dark:text-white font-bold text-lg placeholder-slate-500 dark:placeholder-slate-600 transition-colors" required
                />
                <textarea
                  placeholder="Body content..." rows={5}
                  value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl focus:border-blue-500/50 outline-none resize-none text-slate-700 dark:text-slate-300 font-medium placeholder-slate-500 dark:placeholder-slate-600 transition-colors" required
                />
                <div className="flex flex-wrap gap-4">
                  <select
                    value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                    className="flex-1 min-w-[200px] px-5 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl outline-none text-slate-700 dark:text-slate-300 font-bold focus:border-blue-500/50 transition-colors"
                  >
                    <option value="all">All Users</option>
                    <option value="candidates">Candidates</option>
                    <option value="guests">Guests</option>
                    <option value="admins">Admins</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer px-5 py-3 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold transition-colors">
                    <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} className="rounded bg-transparent border-slate-300 dark:border-white/20 text-blue-500" />
                    <span>Pin to top</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 cursor-pointer px-5 py-3 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 font-bold truncate transition-colors">
                    <Paperclip size={18} className="text-blue-500" />
                    <span className="truncate">{form.file ? form.file.name : (editId ? "Replace Attachment" : "Attach File")}</span>
                    <input type="file" hidden onChange={e => setForm({ ...form, file: e.target.files[0] })} />
                  </label>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={resetForm} className="px-6 py-3 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    {editId ? "Update Notice" : "Publish Notice"}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* List */}
        {loading && page === 1 ? (
          <div className="flex justify-center py-20"><div className="animate-spin text-blue-500"><Megaphone /></div></div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5">
            <Megaphone size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-600 opacity-50" />
            <p className="text-xl font-bold text-slate-500">No notices found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {list.map((n, i) => (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white dark:bg-[#0f1014] p-6 rounded-3xl border shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all relative group
                      ${n.pinned ? 'border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/5' : 'border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30'}
                    `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border 
                         ${n.audience === 'all' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20'}
                       `}>
                      {n.audience}
                    </span>
                    {n.pinned && <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-500 dark:text-orange-400"><Pin size={14} className="fill-orange-500 dark:fill-orange-400" /> Pinned</div>}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">{n.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line mb-6 text-sm leading-relaxed font-medium">{n.body}</p>

                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 dark:border-white/5">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{new Date(n.createdAt).toLocaleDateString()}</span>

                    <div className="flex items-center gap-3">
                      {n.attachment && (
                        <a href={n.attachment} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 group/btn" title="Download Attachment">
                          <span className="text-xs font-bold hidden group-hover/btn:block">Download</span> <Download size={18} />
                        </a>
                      )}
                      {isAdminOrSuper && (
                        <div className="flex gap-2 border-l border-slate-200 dark:border-white/10 pl-3">
                          <button onClick={() => startEdit(n)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => remove(n._id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center pt-8">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-8 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#252525] hover:text-slate-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              Load More Notices
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
