import React, { useState, useEffect } from "react";
import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
   LayoutDashboard,
   Briefcase,
   Calendar,
   Users,
   BarChart3,
   Settings,
   ChevronLeft,
   ChevronRight,
   Menu,
   Plus
} from "lucide-react";
import RecruiterTopbar from "../components/RecruiterTopbar.jsx";
import RecruiterNotifications from "../components/RecruiterNotifications.jsx";
import { useToast } from "../components/ToastProvider.jsx";

const navItems = [
   { to: "/rpanel/overview", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
   { to: "/rpanel/jobs", label: "Jobs", icon: <Briefcase size={20} /> },
   { to: "/rpanel/applications", label: "Applications", icon: <Users size={20} /> },
   { to: "/rpanel/events", label: "Events", icon: <Calendar size={20} /> },
   { to: "/rpanel/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
   { to: "/rpanel/settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function RecruiterLayout() {
   const [collapsed, setCollapsed] = useState(false);
   const [mobileOpen, setMobileOpen] = useState(false);
   const location = useLocation();
   const navigate = useNavigate();
   const { showToast } = useToast();

   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth < 1024) setCollapsed(true);
         else setCollapsed(false);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0a] font-sans transition-colors duration-300">

         {/* Sidebar */}
         <aside
            className={`fixed inset-y-0 left-0 z-40 bg-slate-900 dark:bg-black text-white transition-all duration-300 ease-in-out flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-white/5 dark:border-white/10
          ${collapsed ? 'w-[80px]' : 'w-[280px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
         >
            {/* Brand */}
            <div className={`h-24 flex items-center ${collapsed ? 'justify-center' : 'px-8'} border-b border-white/5`}>
               {!collapsed ? (
                  <div className="flex flex-col">
                     <span className="text-2xl font-display font-black tracking-tight text-white leading-none">OneStop</span>
                     <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mt-1 font-body">Recruiter</span>
                  </div>
               ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl">R</div>
               )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
               {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                     <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                       ${isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                       ${collapsed ? 'justify-center' : ''}
                    `}
                     >
                        <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                           {item.icon}
                        </div>

                        {!collapsed && (
                           <span className="font-bold text-sm tracking-wide">{item.label}</span>
                        )}

                        {collapsed && (
                           <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 border border-white/10 translate-x-2 group-hover:translate-x-0">
                              {item.label}
                           </div>
                        )}
                     </NavLink>
                  );
               })}
            </nav>

            {/* User / Logout Section (Optional bottom section) */}
            <div className="p-4 border-t border-white/5">
               <div className={`flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 ${collapsed ? 'justify-center' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs ring-2 ring-slate-900">
                     You
                  </div>
                  {!collapsed && (
                     <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">Recruiter Account</p>
                        <p className="text-[10px] text-slate-400 truncate">Manage hiring</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Collapse Button */}
            <button
               onClick={() => setCollapsed(!collapsed)}
               className="absolute -right-3 top-28 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform hidden lg:flex"
            >
               {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
         </aside>

         {/* Overlay for mobile */}
         {mobileOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)}></div>
         )}

         {/* Main Content */}
         <div
            className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
            style={{ marginLeft: collapsed ? '80px' : '280px' }} // Adjusted for wider sidebar
         >
            {/* Topbar */}
            <header className="h-20 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 flex items-center justify-between px-8 transition-all">
               <div className="flex items-center gap-4">
                  <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                     <Menu size={24} />
                  </button>
                  <h2 className="hidden md:block text-xl font-black text-slate-800 dark:text-white tracking-tight">
                     {navItems.find(item => location.pathname.startsWith(item.to))?.label || "Overview"}
                  </h2>
               </div>

               <div className="flex items-center gap-4">
                  <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => navigate("/rpanel/post-job")}
                     className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all shadow-lg shadow-slate-200 dark:shadow-none"
                  >
                     <Plus size={18} /> Post Job
                  </motion.button>
                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
                  <RecruiterNotifications />
                  <RecruiterTopbar />
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
               <AnimatePresence mode="wait">
                  <motion.div
                     key={location.pathname}
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                     <Outlet />
                  </motion.div>
               </AnimatePresence>
            </main>
         </div>

      </div>
   );
}
