import React, { useState, useEffect } from "react";
import { Outlet, useLocation, NavLink, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
   LayoutDashboard,
   Users,
   Briefcase,
   Settings,
   ChevronLeft,
   ChevronRight,
   Menu,
   Shield,
   FileText,
   MessageSquare,
   Activity,
   Box,
   Globe,
   ShieldCheck,
   Cpu,
   Database,
   Home,
   LogOut
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar.jsx";
import { useAuth } from "../context/AuthContext";

const navItems = [
   { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} />, exact: true },
   { to: "/admin/users", label: "Users", icon: <Users size={20} /> },
   { to: "/admin/jobs", label: "Jobs", icon: <Briefcase size={20} /> },
   { to: "/admin/mentor-approvals", label: "Mentor Approvals", icon: <ShieldCheck size={20} /> },
   { to: "/admin/recruiter-approvals", label: "Recruiter Approvals", icon: <Globe size={20} /> },
   { to: "/admin/logs", label: "Audit Logs", icon: <FileText size={20} /> },
   { to: "/admin/messages", label: "Messages", icon: <MessageSquare size={20} /> },
   { to: "/admin/metrics", label: "Metrics", icon: <Activity size={20} /> },
];

export default function AdminLayout() {
   const [collapsed, setCollapsed] = useState(false);
   const [mobileOpen, setMobileOpen] = useState(false);
   const location = useLocation();
   const { logout, user } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth < 1024) setCollapsed(true);
         else setCollapsed(false);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   const sidebarWidth = collapsed ? "w-[80px]" : "w-[280px]";

   return (
      <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] font-sans transition-colors duration-300 overflow-hidden">
         {/* Sidebar */}
         <aside className={`fixed inset-y-0 left-0 z-40 bg-slate-900 dark:bg-black text-white transition-all duration-300 ease-in-out flex flex-col shadow-2xl border-r border-white/5 ${sidebarWidth} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            {/* Brand */}
            <Link to="/" className={`h-24 flex items-center ${collapsed ? 'justify-center' : 'px-8'} border-b border-white/5`}>
               {!collapsed ? (
                  <div className="flex flex-col">
                     <span className="text-2xl font-display font-black tracking-tight text-white leading-none">OneStop</span>
                     <span className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">Admin OS</span>
                  </div>
               ) : (
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xl">A</div>
               )}
            </Link>

            {/* Nav */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
               {navItems.map((item) => {
                  const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                  return (
                     <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}
                     >
                        <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                           {item.icon}
                        </div>
                        {!collapsed && (<span className="font-bold text-sm tracking-wide">{item.label}</span>)}
                        {collapsed && (<div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 border border-white/10 translate-x-2 group-hover:translate-x-0">{item.label}</div>)}
                     </NavLink>
                  );
               })}

               <div className="pt-4 mt-4 border-t border-white/5">
                  <NavLink to="/" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300 ${collapsed ? 'justify-center' : ''}`}>
                     <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Home size={20} />
                     </div>
                     {!collapsed && (<span className="font-bold text-sm tracking-wide">Public View</span>)}
                  </NavLink>
               </div>
            </nav>

            {/* User / Logout */}
            <div className="p-4 border-t border-white/5">
               <button onClick={logout} className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-400 hover:text-rose-500 transition-all ${collapsed ? 'justify-center' : ''}`}>
                  <LogOut size={20} />
                  {!collapsed && <span className="font-bold text-xs">Terminate Session</span>}
               </button>
            </div>

            {/* Collapse Trigger */}
            <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-28 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform hidden lg:flex">
               {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
         </aside>

         {/* Mobile Overlay */}
         {mobileOpen && (<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)}></div>)}

         {/* Main Content */}
         <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out" style={{ marginLeft: collapsed ? '80px' : '280px' }}>
            <AdminTopbar title={navItems.find(item => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to))?.label} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 dark:bg-[#0a0a0a]">
               <AnimatePresence mode="wait">
                  <motion.div key={location.pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                     <Outlet />
                  </motion.div>
               </AnimatePresence>
            </main>
         </div>
      </div>
   );
}
