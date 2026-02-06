import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket.jsx";
import useApi from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Briefcase,
  Menu as MenuIcon,
  X,
  Bell,
  MessageSquare,
  LogOut,
  User,
  LayoutDashboard,
  Calendar,
  Shield,
  Trophy,
  Rocket,
  Code,
  Users,
  Megaphone,
  BookOpen,
  Layers,
  Sun,
  Moon,
  Zap,
  Star,
  FileText,
  Phone,
  Target
} from "lucide-react";
import { useThemeMode } from "../hooks/useThemeMode";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { get, patch } = useApi();
  const location = useLocation();
  const { socket } = useSocket();
  const { mode, toggleTheme } = useThemeMode();

  // Navigation State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Hover State
  const [hoveredPath, setHoveredPath] = useState(location.pathname);

  useEffect(() => {
    setHoveredPath(location.pathname);
  }, [location.pathname]);

  // Load Data
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Socket & Notifications
  const loadNotifications = async () => {
    try {
      const res = await get("/notifications");
      const list = res?.notifications || res?.data?.notifications || [];
      setNotifications(list.slice(0, 10)); // Keep latest 10
      setUnreadCount(list.filter(n => !n.read).length);
    } catch (err) {
      console.error("Notifications error", err);
    }
  };

  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit("registerUser", user._id);

    const handleNotif = (payload) => {
      setNotifications(prev => [{ ...payload, read: false, createdAt: new Date().toISOString() }, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on("notification:new", handleNotif);
    return () => socket.off("notification:new", handleNotif);
  }, [socket, user]);

  const markAllRead = async () => {
    try {
      await patch("/notifications/mark-all/read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  // UI Helpers
  const isActive = (path) => location.pathname === path;
  const getDashboardPath = () => role === "mentor" ? "/mentor-dashboard" : "/dashboard";

  // --- NAVIGATION CONFIGURATION ---

  const mainLinks = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: getDashboardPath(), auth: true },
  ];

  const canManageEvents = ['admin', 'superadmin', 'recruiter', 'mentor'].includes(role);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 transition-colors duration-500 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/60"
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-[80px]">
            {/* Branding */}
            <Link to={user ? getDashboardPath() : "/"} className="flex items-center gap-3.5 group relative z-10 shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500 scale-125"></div>
                <div className="relative w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <Zap size={20} className="text-white dark:text-black fill-current" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:translate-x-0.5 transition-transform duration-300">
                  OneStop
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-px w-3 bg-indigo-500 rounded-full"></span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase leading-none font-sans">
                    Agency
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1 p-1.5 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm relative z-0">
              {/* Main Links */}
              {mainLinks.map((link) => (
                (!link.auth || (link.auth && user)) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    onMouseEnter={() => setHoveredPath(link.path)}
                    onMouseLeave={() => setHoveredPath(location.pathname)}
                    className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-colors duration-200 z-10 ${isActive(link.path) ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {hoveredPath === link.path && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-slate-200/50 dark:border-white/5 -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                )
              ))}

              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2"></div>

              {/* Dropdowns Group */}
              <div className="flex items-center gap-1">

                {/* Events Dropdown */}
                <div className="relative group px-3 py-2 cursor-pointer">
                  <div className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isActive('/events') ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    Events <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300 opacity-60" />
                  </div>
                  <div className="absolute top-full right-0 pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right -translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-white/10 p-1.5 overflow-hidden">
                      <Link to="/events" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <Calendar size={16} className="text-yellow-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Explore Events</span>
                      </Link>
                      {canManageEvents && (
                        <Link to="/manage/events" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Layers size={16} className="text-indigo-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Manage Events</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Jobs Dropdown */}
                {(!user || !['mentor', 'recruiter'].includes(role)) && (
                  <div className="relative group px-3 py-2 cursor-pointer">
                    <div className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isActive('/opportunities/jobs') ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      Jobs <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300 opacity-60" />
                    </div>
                    <div className="absolute top-full right-0 pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right -translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-white/10 p-1.5 overflow-hidden">
                        <Link to="/opportunities/jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Briefcase size={16} className="text-blue-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Find Jobs</span>
                        </Link>
                        <Link to="/resume-shield" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Shield size={16} className="text-emerald-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Resume Shield</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Practice Dropdown (NEW) */}
                {(!user || !['mentor', 'recruiter'].includes(role)) && (
                  <div className="relative group px-3 py-2 cursor-pointer">
                    <div className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isActive('/practice') ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      Practice <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300 opacity-60" />
                    </div>
                    <div className="absolute top-full right-0 pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right -translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-white/10 p-1.5 overflow-hidden">
                        <Link to="/practice" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Target size={16} className="text-rose-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Practice Hub</span>
                        </Link>
                        <Link to="/challenges" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Code size={16} className="text-orange-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Coding Problems</span>
                        </Link>
                        <Link to="/mock-interview" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Rocket size={16} className="text-violet-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Mock Interview</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compete Dropdown */}
                {(!user || !['mentor', 'recruiter'].includes(role)) && (
                  <div className="relative group px-3 py-2 cursor-pointer">
                    <div className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isActive('/contests') ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      Compete <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300 opacity-60" />
                    </div>
                    <div className="absolute top-full right-0 pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right -translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-white/10 p-1.5 overflow-hidden">
                        <Link to="/contests" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Trophy size={16} className="text-purple-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Contests</span>
                        </Link>
                        <Link to="/hackathons" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Rocket size={16} className="text-pink-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Hackathons</span>
                        </Link>
                        <Link to="/leaderboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Star size={16} className="text-yellow-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Leaderboard</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mentorship Dropdown - Visible only to Candidates or Guests */}
                {(!user || role === "candidate") && (
                  <div className="relative group px-3 py-2 cursor-pointer">
                    <div className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isActive('/mentors') ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      Mentorship <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300 opacity-60" />
                    </div>
                    <div className="absolute top-full right-0 pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right -translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-white/10 p-1.5 overflow-hidden">
                        <Link to="/mentors" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Users size={16} className="text-indigo-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Find Mentor</span>
                        </Link>
                        <Link to="/become-mentor" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <Star size={16} className="text-amber-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Become Mentor</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Community Dropdown */}
                <div className="relative group px-3 py-2 cursor-pointer">
                  <div className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isActive('/community') ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    Community <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300 opacity-60" />
                  </div>
                  <div className="absolute top-full right-0 pt-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right -translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-white/10 p-1.5 overflow-hidden">
                      <Link to="/community" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <MessageSquare size={16} className="text-cyan-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Discussion Feed</span>
                      </Link>
                      <Link to="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <LayoutDashboard size={16} className="text-violet-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Project Showcase</span>
                      </Link>
                      <Link to="/resources" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <BookOpen size={16} className="text-teal-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Resources</span>
                      </Link>
                      <Link to="/notices" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <Megaphone size={16} className="text-red-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Announcements</span>
                      </Link>
                      <Link to="/contact" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <Phone size={16} className="text-lime-500" /> <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Contact Us</span>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-4">

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:scale-110 active:scale-95 transition-all duration-300"
              >
                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? (
                <>
                  <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-100 dark:border-[#0f1014]"></span>
                      )}
                    </button>
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute top-full right-0 mt-4 w-80 bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-indigo-500/10 dark:shadow-none border border-slate-100 dark:border-white/10 overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-widest">Inbox</h3>
                            <button onClick={markAllRead} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Mark all read</button>
                          </div>
                          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-10 text-center text-slate-400 text-xs font-bold">No notifications</div>
                            ) : notifications.map(n => (
                              <div key={n._id} className={`p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Pill */}
                  <div className="relative group pl-2">
                    <button className="flex items-center gap-3 p-1 pr-4 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" /> : user.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col items-start leading-none hidden md:flex">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name?.split(' ')[0]}</span>
                        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 capitalize">{role}</span>
                      </div>
                      <ChevronDown size={12} className="text-slate-400" />
                    </button>

                    {/* User Dropdown */}
                    <div className="absolute top-full right-0 mt-4 w-60 bg-white dark:bg-[#0f1014] rounded-2xl shadow-xl shadow-indigo-500/10 dark:shadow-none border border-slate-100 dark:border-white/10 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                      <Link to={role === 'candidate' ? "/candidate/profile" : "/profile"} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <User size={16} /> {role === 'candidate' ? "My Profile" : "Settings"}
                      </Link>
                      {role === "candidate" && (
                        <Link to="/candidate/applications" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <Layers size={16} /> My Applications
                        </Link>
                      )}
                      <Link to="/mentorship/my-sessions" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <Calendar size={16} /> My Sessions
                      </Link>
                      <Link to={getDashboardPath()} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      {['superadmin', 'admin'].includes(role) && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <Shield size={16} /> Admin Panel
                        </Link>
                      )}
                      <div className="h-px bg-slate-100 dark:bg-white/5 my-1"></div>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Log in
                  </Link>
                  <Link to="/register" className="group relative px-6 py-2.5 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30">
                    <div className="absolute inset-0 bg-indigo-600 group-hover:bg-indigo-700 transition-colors"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative text-sm font-black text-white flex items-center gap-2">
                      Get Started <Star size={14} className="fill-current" />
                    </span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button - Styled minimal */}
              <button
                className="xl:hidden w-10 h-10 flex items-center justify-center text-slate-900 dark:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Fully Restored */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "100vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="xl:hidden fixed inset-0 bg-white dark:bg-[#0a0a0a] z-40 top-[80px]"
            >
              <div className="p-6 flex flex-col gap-6 max-h-[calc(100vh-80px)] overflow-y-auto pb-20">
                <div className="grid grid-cols-2 gap-3">
                  {mainLinks.map(link => (
                    (!link.auth || (link.auth && user)) && (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`p-4 rounded-2xl text-base font-bold text-center border transition-all ${isActive(link.path) ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-white/5'}`}
                      >
                        {link.label}
                      </Link>
                    )
                  ))}
                </div>

                <div className="space-y-6">
                  {/* Events Mobile */}
                  <div>
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3">Events</h4>
                    <div className="space-y-2">
                      <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Calendar size={18} className="text-yellow-500" /> <span className="font-bold text-slate-800 dark:text-white">Explore Events</span>
                      </Link>
                      {canManageEvents && (
                        <Link to="/manage/events" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                          <Layers size={18} className="text-indigo-500" /> <span className="font-bold text-slate-800 dark:text-white">Manage Events</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Opportunities Mobile */}
                  <div>
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3">Jobs</h4>
                    <div className="space-y-2">
                      <Link to="/opportunities/jobs" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Briefcase size={18} className="text-blue-500" /> <span className="font-bold text-slate-800 dark:text-white">Find Jobs</span>
                      </Link>
                      <Link to="/resume-shield" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Shield size={18} className="text-emerald-500" /> <span className="font-bold text-slate-800 dark:text-white">Resume Shield</span>
                      </Link>
                    </div>
                  </div>

                  {/* Compete Mobile */}
                  <div>
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3">Compete</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/contests" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center rounded-xl bg-slate-50 dark:bg-white/5 font-bold text-slate-800 dark:text-white border border-slate-100 dark:border-white/5">Contests</Link>
                      <Link to="/hackathons" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center rounded-xl bg-slate-50 dark:bg-white/5 font-bold text-slate-800 dark:text-white border border-slate-100 dark:border-white/5">Hackathons</Link>
                      <Link to="/challenges" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center col-span-2 rounded-xl bg-slate-50 dark:bg-white/5 font-bold text-slate-800 dark:text-white border border-slate-100 dark:border-white/5">Coding Challenges</Link>
                    </div>
                  </div>

                  {/* Mentorship Mobile - Visible only to Candidates or Guests */}
                  {(!user || role === "candidate") && (
                    <div>
                      <h4 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3">Mentorship</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Link to="/mentors" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center rounded-xl bg-slate-50 dark:bg-white/5 font-bold text-slate-800 dark:text-white border border-slate-100 dark:border-white/5">Find Mentor</Link>
                        <Link to="/become-mentor" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center rounded-xl bg-slate-50 dark:bg-white/5 font-bold text-slate-800 dark:text-white border border-slate-100 dark:border-white/5">Become Mentor</Link>
                      </div>
                    </div>
                  )}

                  {/* Community Mobile */}
                  <div>
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3">Community</h4>
                    <div className="space-y-2">
                      <Link to="/community" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <MessageSquare size={18} className="text-cyan-500" /> <span className="font-bold text-slate-800 dark:text-white">Discussion Feed</span>
                      </Link>
                      <Link to="/projects" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <LayoutDashboard size={18} className="text-violet-500" /> <span className="font-bold text-slate-800 dark:text-white">Project Showcase</span>
                      </Link>
                      <Link to="/resources" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <BookOpen size={18} className="text-teal-500" /> <span className="font-bold text-slate-800 dark:text-white">Resources</span>
                      </Link>
                      <Link to="/notices" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Megaphone size={18} className="text-red-500" /> <span className="font-bold text-slate-800 dark:text-white">Announcements</span>
                      </Link>
                      <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Phone size={18} className="text-lime-500" /> <span className="font-bold text-slate-800 dark:text-white">Contact Us</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {!user && (
                  <div className="mt-8">
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full block py-4 bg-indigo-600 rounded-xl text-center text-white font-black text-lg shadow-xl shadow-indigo-600/30">
                      Join Now
                    </Link>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full block py-4 mt-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-[80px]" />
    </>
  );
}
