import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../socket.jsx";
import useApi from "../hooks/useApi";
import { 
  Bell, Check, RefreshCw, Briefcase, User, Shield, FileText, Settings, CheckCircle, Loader 
} from "lucide-react";

export default function NotificationsPage() {
  const { get, patch } = useApi();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await get("/notifications");
      const list = res?.notifications || res?.data?.notifications || res?.data || [];
      setNotifications(list);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await patch("/notifications/mark-all/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const markOneRead = async (id) => {
    try {
      await patch(`/notifications/${id}/read`).catch(() => Promise.resolve());
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error updating notification:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handler = (data) => {
        setNotifications((prev) => [
          {
            _id: `temp_${Date.now()}`,
            title: data?.title || "Notification",
            message: data?.message || "",
            read: false,
            createdAt: data?.time || new Date().toISOString(),
            type: 'system' // Default type if not provided
          },
          ...prev,
        ]);
      };
      socket.on("notification:new", handler);
      return () => socket.off("notification:new", handler);
    }
  }, [socket]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [filter, notifications]);

  const getIcon = (type) => {
    switch (type) {
      case "admin": return <Shield className="text-purple-500" />;
      case "recruiter": return <Briefcase className="text-blue-500" />;
      case "candidate": return <User className="text-green-500" />;
      case "job": return <FileText className="text-amber-500" />;
      default: return <Settings className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 pb-20">
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                   <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Bell size={28} /></span>
                   Notifications
                </h1>
                <p className="text-slate-500 font-medium mt-2 ml-1">Stay updated with latest activities.</p>
             </div>
             
             <div className="flex gap-2">
                <button 
                   onClick={fetchNotifications} 
                   className="p-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                   title="Refresh"
                >
                   <RefreshCw size={20} />
                </button>
                <button 
                   onClick={markAllRead} 
                   className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2"
                >
                   <CheckCircle size={18} /> Mark all read
                </button>
             </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit font-bold text-sm">
             {['all', 'unread', 'read'].map((f) => (
                <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-5 py-2 rounded-lg capitalize transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   {f}
                </button>
             ))}
          </div>

          {/* List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
             {loading ? (
                <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-indigo-600" size={32} /></div>
             ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                   <Bell size={48} className="mb-4 opacity-20" />
                   <p className="font-bold">No notifications found.</p>
                </div>
             ) : (
                <div className="divide-y divide-slate-50">
                   <AnimatePresence>
                      {filteredNotifications.map((n) => (
                         <motion.div
                            key={n._id || Math.random()}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-6 flex gap-4 transition-colors ${n.read ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'}`}
                         >
                            <div className={`p-3 rounded-xl h-fit shrink-0 ${n.read ? 'bg-slate-50' : 'bg-white shadow-sm'}`}>
                               {getIcon(n.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start gap-4">
                                  <h3 className={`font-bold text-lg mb-1 leading-tight ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h3>
                                  {!n.read && (
                                     <button onClick={() => markOneRead(n._id)} className="text-indigo-600 hover:text-indigo-800" title="Mark as read">
                                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                                     </button>
                                  )}
                               </div>
                               <p className="text-slate-600 text-sm leading-relaxed mb-2 whitespace-pre-line">{n.message}</p>
                               <p className="text-xs font-bold text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                         </motion.div>
                      ))}
                   </AnimatePresence>
                </div>
             )}
          </div>

       </motion.div>
    </div>
  );
}
