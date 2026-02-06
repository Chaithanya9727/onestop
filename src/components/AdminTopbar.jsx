import React, { useState } from "react";
import { Sun, Moon, Search, ChevronDown, User, Settings, LogOut, Bell, Menu, Home } from "lucide-react";
import { useThemeMode } from "../hooks/useThemeMode";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AdminNotifications from "./AdminNotifications";

export default function AdminTopbar({ title }) {
    const { mode, toggleTheme } = useThemeMode();
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="h-20 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 flex items-center justify-between px-8 transition-all">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                    {title || "Overview"}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-all">
                    {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>

                <AdminNotifications />

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all ${isProfileOpen ? 'bg-slate-100 dark:bg-white/5' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-600/20">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-lg object-cover" /> : user?.name?.[0]}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{user?.name?.split(' ')[0]}</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{role}</p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121214] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/5 p-2 z-40">
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all">
                                    <User size={16} /> My Account
                                </Link>
                                <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all">
                                    <Home size={16} /> Go back to main menu
                                </Link>
                                <div className="h-px bg-slate-100 dark:bg-white/5 my-1"></div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                                >
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
