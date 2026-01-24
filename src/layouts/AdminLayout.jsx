import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare, 
  FileText, 
  LogOut, 
  Menu, 
  ChevronLeft 
} from "lucide-react";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 80;

export default function AdminLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  
  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
    { label: "Job Approvals", icon: <Briefcase size={20} />, path: "/admin/jobs" },
    { label: "Recruiter Approvals", icon: <Users size={20} />, path: "/admin/recruiter-approvals" },
    { label: "Mentor Approvals", icon: <Users size={20} />, path: "/admin/mentor-approvals" },
    { label: "Manage Events", icon: <Briefcase size={20} />, path: "/admin/events" },
    { label: "Users", icon: <Users size={20} />, path: "/admin/users" },
    { label: "Messages", icon: <MessageSquare size={20} />, path: "/admin/messages" },
    { label: "Audit Logs", icon: <FileText size={20} />, path: "/admin/logs" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
       {/* Background Gradients */}
       <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[100px] transition-colors duration-500" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[100px] transition-colors duration-500" />
       </div>

       {/* Sidebar */}
       <motion.aside 
          initial={false}
          animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
          className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#0f1014] border-r border-slate-200 dark:border-white/5 z-50 flex flex-col shadow-2xl shadow-slate-200/50 dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out`}
       >
          {/* Header */}
          <div className={`h-20 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f1014]`}>
             {!collapsed && (
                <Link to="/" className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 group">
                   <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform"><span className="text-lg">🎓</span></div>
                   OneStop
                </Link>
             )}
             <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
             </button>
          </div>

          {/* User Info */}
          <div className={`p-6 flex flex-col items-center ${collapsed ? 'gap-2' : 'gap-4'} border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f1014]`}>
             <div className="relative group">
                <div className={`rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 ${collapsed ? 'w-10 h-10' : 'w-16 h-16'} transition-all group-hover:border-blue-500`}>
                   {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/>
                   ) : (
                      <div className="w-full h-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">{user?.name?.[0]}</div>
                   )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0f1014] rounded-full shadow-sm"></div>
             </div>
             {!collapsed && (
                <div className="text-center">
                   <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">{user?.name}</h3>
                   <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-500/20">{role}</span>
                </div>
             )}
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
             {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                   <Link 
                      key={item.path} 
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative mb-1
                         ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 dark:shadow-blue-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
                         ${collapsed ? 'justify-center' : ''}
                      `}
                   >
                      <div className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white'}`}>
                         {item.icon}
                      </div>
                      
                      {!collapsed && (
                         <span className="font-bold text-sm tracking-tight">{item.label}</span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                         <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all transform translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap">
                            {item.label}
                         </div>
                      )}
                   </Link>
                );
             })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f1014]">
             <button 
                onClick={logout} 
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all ${collapsed ? 'justify-center' : ''}`}
             >
                <LogOut size={20} />
                {!collapsed && <span className="font-bold text-sm">Logout</span>}
             </button>
          </div>
       </motion.aside>

       {/* Main Content */}
       <main 
          className="flex-1 transition-all duration-300 ease-in-out min-h-screen relative z-10"
          style={{ marginLeft: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
       >
          <div className="p-0">
             <Outlet />
          </div>
       </main>

    </div>
  );
}
