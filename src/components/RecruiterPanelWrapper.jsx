import React from "react";
import RecruiterLayout from "../layouts/RecruiterLayout.jsx";
import { SocketProvider } from "../socket.jsx";
import { ToastProvider } from "./ToastProvider.jsx";

/**
 * ✅ RecruiterPanelWrapper
 * Wraps the RecruiterLayout inside SocketProvider and ToastProvider
 * so RecruiterTopbar & RecruiterNotifications have access to sockets.
 */
export default function RecruiterPanelWrapper() {
  return (
    <SocketProvider>
      <ToastProvider>
        <RecruiterLayout />
      </ToastProvider>
    </SocketProvider>
  );
}
