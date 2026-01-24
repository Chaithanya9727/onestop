import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSocket } from "../socket.jsx";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const { socket } = useSocket();

  const showToast = useCallback((message, severity = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, severity }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      if (!data) return;

      let severity = "info";
      const title = data.title || "New Notification";
      const message = data.message || "You have a new update.";

      if (title.toLowerCase().includes("error") || message.includes("failed"))
        severity = "error";
      else if (title.toLowerCase().includes("approved") || message.includes("success"))
        severity = "success";
      else if (title.toLowerCase().includes("warning"))
        severity = "warning";

      showToast(`${title} — ${message}`, severity);
    };

    socket.on("notification", handleNotification);
    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("notification:new", handleNotification);
    };
  }, [socket, showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border
                ${toast.severity === 'success' ? 'bg-white border-green-200 text-green-700' : ''}
                ${toast.severity === 'error' ? 'bg-white border-red-200 text-red-700' : ''}
                ${toast.severity === 'warning' ? 'bg-white border-amber-200 text-amber-700' : ''}
                ${toast.severity === 'info' ? 'bg-slate-900 border-slate-700 text-white' : ''}
              `}
              style={{ minWidth: "300px", maxWidth: "90vw" }}
            >
              <div className="shrink-0">
                {toast.severity === 'success' && <CheckCircle size={20} className="text-green-500"/>}
                {toast.severity === 'error' && <AlertCircle size={20} className="text-red-500"/>}
                {toast.severity === 'warning' && <AlertTriangle size={20} className="text-amber-500"/>}
                {toast.severity === 'info' && <Info size={20} className="text-blue-400"/>}
              </div>
              
              <div className="flex-1 text-sm font-bold">{toast.message}</div>
              
              <button onClick={() => removeToast(toast.id)} className="shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
