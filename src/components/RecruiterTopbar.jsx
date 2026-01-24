import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket.jsx";

export default function RecruiterTopbar() {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const handleSettings = () => {
    setIsOpen(false);
    navigate("/rpanel/settings");
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate("/rpanel/overview");
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.orgName?.trim()?.charAt(0)?.toUpperCase() ||
    "R";

  return (
    <div className="flex items-center gap-4">
       
       {/* Status Indicator */}
       <div className="relative group cursor-help">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}`}></div>
          <div className="absolute right-0 top-6 w-max px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             {isConnected ? "System Online" : "System Offline"}
          </div>
       </div>

       {/* Profile Dropdown */}
       <div className="relative">
          <button 
             onClick={() => setIsOpen(!isOpen)} 
             className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
             <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                {user?.avatar ? (
                   <img src={user.avatar} className="w-full h-full rounded-full object-cover"/>
                ) : (
                   userInitial
                )}
             </div>
             <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
             {isOpen && (
                <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                   <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                   >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                         <p className="font-bold text-slate-800 truncate">{user?.name || "Recruiter"}</p>
                         <p className="text-xs text-slate-500 truncate">{user?.email || "recruiter@onestop.com"}</p>
                      </div>

                      <div className="p-1">
                         <button onClick={handleProfile} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium">
                            <User size={16} /> Profile
                         </button>
                         <button onClick={handleSettings} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium">
                            <Settings size={16} /> Settings
                         </button>
                      </div>

                      <div className="p-1 border-t border-slate-100">
                         <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold">
                            <LogOut size={16} /> Logout
                         </button>
                      </div>
                   </motion.div>
                </>
             )}
          </AnimatePresence>
       </div>

    </div>
  );
}
