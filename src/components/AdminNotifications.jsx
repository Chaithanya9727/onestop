import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle, Loader } from "lucide-react";
import useApi from "../hooks/useApi";
import { useSocket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function AdminNotifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const { get, patch } = useApi();
    const { socket } = useSocket();
    const { user } = useAuth();

    // Load Notifications
    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    // Real-time updates
    useEffect(() => {
        if (!socket || !user?._id) return;

        const handleNotif = (payload) => {
            setNotifications(prev => [{ ...payload, read: false, createdAt: new Date().toISOString() }, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        socket.on("notification:new", handleNotif);
        return () => socket.off("notification:new", handleNotif);
    }, [socket, user]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const res = await get("/notifications");
            const list = res?.notifications || res?.data?.notifications || [];
            setNotifications(list.slice(0, 10)); // Top 10
            setUnreadCount(list.filter(n => !n.read).length);
        } catch (err) {
            console.error("Notifications error", err);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await patch("/notifications/mark-all/read");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0f1014] animate-pulse"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#0f1014] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                                    Notifications
                                    {unreadCount > 0 && <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{unreadCount}</span>}
                                </h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={16} /></button>
                                </div>
                            </div>

                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-12 flex justify-center"><Loader className="animate-spin text-indigo-600 dark:text-indigo-400" size={24} /></div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Bell size={20} />
                                        </div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">Clean Inbox!</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No new notifications at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50 dark:divide-white/5">
                                        {notifications.map((n) => (
                                            <div key={n._id} className={`p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-500/10' : ''}`}>
                                                <div className="flex gap-3 items-start">
                                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-transparent'}`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate">{n.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                                                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">{new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-center">
                                <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    View All Activity
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
