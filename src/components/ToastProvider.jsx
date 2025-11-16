// src/components/ToastProvider.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Snackbar, Alert, Slide } from "@mui/material";
import { useSocket } from "../socket.jsx";

/**
 * 🌐 Toast Context + Real-Time Notification Integration
 * -----------------------------------------------------
 * ✅ Provides global showToast()
 * ✅ Listens to socket "notification" & "notification:new" events
 * ✅ Shows recruiter notifications instantly via MUI Snackbar
 */

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const { socket } = useSocket();

  // 🔥 Manually trigger a toast anywhere in the app
  const showToast = useCallback((message, severity = "info") => {
    setToast({ open: true, message, severity });
  }, []);

  const handleClose = () => setToast((t) => ({ ...t, open: false }));

  /* =====================================================
     ⚡ Real-Time Socket Notifications (Recruiter, Admin, etc.)
  ====================================================== */
  useEffect(() => {
    if (!socket) return;

    // Unified handler for all real-time notifications
    const handleNotification = (data) => {
      if (!data) return;

      // Choose severity based on type or content
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

    // Listen for both global and targeted notification events
    socket.on("notification", handleNotification);
    socket.on("notification:new", handleNotification);

    // Cleanup
    return () => {
      socket.off("notification", handleNotification);
      socket.off("notification:new", handleNotification);
    };
  }, [socket, showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 🎉 Global Snackbar Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            minWidth: 300,
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            textTransform: "none",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
