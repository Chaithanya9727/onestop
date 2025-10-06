import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./context/AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // "disconnected", "connecting", "connected", "error"

  const socket = useMemo(() => {
    if (!token) {
      console.log("🔑 No token available, skipping socket creation");
      return null;
    }

    console.log("🔄 Creating new socket connection with token");
    setConnectionStatus("connecting");

    const newSocket = io("https://server-hv9f.onrender.com/", {
      auth: {
        token: token
      },
      transports: ["polling", "websocket"], // Prefer polling first to avoid initial WS errors
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
    });

    return newSocket;
  }, [token]);

  useEffect(() => {
    if (!socket) {
      console.log("❌ No socket instance available");
      setConnectionStatus("disconnected");
      return;
    }

    // Connection event handlers
    const handleConnect = () => {
      console.log("✅ Socket connected successfully:", socket.id);
      setIsConnected(true);
      setConnectionStatus("connected");
      socketRef.current = socket;
    };

    const handleDisconnect = (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      
      if (reason === "io server disconnect") {
        // Server forcibly disconnected, need to manually reconnect
        setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    };

    const handleConnectError = (error) => {
      console.error("🚨 Socket connection error:", error);
      setIsConnected(false);
      setConnectionStatus("error");
    };

    const handleReconnect = (attempt) => {
      console.log("🔄 Socket reconnected after", attempt, "attempts");
      setIsConnected(true);
      setConnectionStatus("connected");
    };

    const handleReconnectAttempt = (attempt) => {
      console.log("🔄 Socket reconnection attempt:", attempt);
      setConnectionStatus("connecting");
    };

    const handleReconnectError = (error) => {
      console.error("🚨 Socket reconnection error:", error);
      setConnectionStatus("error");
    };

    const handleReconnectFailed = () => {
      console.error("💥 Socket reconnection failed");
      setConnectionStatus("error");
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect", handleReconnect);
    socket.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("reconnect_error", handleReconnectError);
    socket.on("reconnect_failed", handleReconnectFailed);

    // Application-specific event listeners
    socket.on("presence:update", (data) => {
      console.log("👥 Presence update:", data);
    });

    socket.on("message:new", (data) => {
      console.log("💬 New message received:", data);
    });

    socket.on("message:update", (data) => {
      console.log("📝 Message status update:", data);
    });

    socket.on("typing", (data) => {
      console.log("⌨️ Typing indicator:", data);
    });

    // Connect the socket (if not already connected)
    if (!socket.connected) {
      console.log("🔌 Manually connecting socket...");
      socket.connect();
    }

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up socket connection and listeners");
      
      // Remove all listeners to prevent memory leaks
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reconnect", handleReconnect);
      socket.off("reconnect_attempt", handleReconnectAttempt);
      socket.off("reconnect_error", handleReconnectError);
      socket.off("reconnect_failed", handleReconnectFailed);
      socket.off("presence:update");
      socket.off("message:new");
      socket.off("message:update");
      socket.off("typing");

      // Only disconnect if we're the last component using this socket
      if (socket.connected) {
        console.log("🔌 Disconnecting socket during cleanup");
        socket.disconnect();
      }
      
      socketRef.current = null;
      setIsConnected(false);
      setConnectionStatus("disconnected");
    };
  }, [socket]);

  // Debug connection status changes
  useEffect(() => {
    console.log(`🔍 Socket connection status: ${connectionStatus}, Connected: ${isConnected}`);
  }, [connectionStatus, isConnected]);

  // Provide connection status for debugging in components
  const contextValue = {
    socket: socketRef.current,
    isConnected,
    connectionStatus
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

// Enhanced hook with better error handling and debugging
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  const { socket, isConnected, connectionStatus } = context;

  // Debug hook usage
  useEffect(() => {
    if (socket && isConnected) {
      console.log("🎯 useSocket: Socket is available and connected", socket.id);
    } else if (socket && !isConnected) {
      console.log("⚠️ useSocket: Socket instance exists but not connected");
    } else {
      console.log("❌ useSocket: No socket available");
    }
  }, [socket, isConnected]);

  // Helper functions for common socket operations
  const sendMessage = (payload, callback) => {
    if (!socket || !isConnected) {
      console.error("🚨 Cannot send message: Socket not connected");
      if (callback) callback({ ok: false, error: "Socket not connected" });
      return;
    }

    console.log("📤 Sending message:", payload);
    socket.emit("message:send", payload, (response) => {
      console.log("📨 Message send response:", response);
      if (callback) callback(response);
    });
  };

  const markMessage = (messageId, status) => {
    if (!socket || !isConnected) {
      console.error("🚨 Cannot mark message: Socket not connected");
      return;
    }

    console.log(`📋 Marking message ${messageId} as ${status}`);
    socket.emit("message:mark", { messageId, status });
  };

  const sendTyping = (to, conversationId, typing = true) => {
    if (!socket || !isConnected) {
      console.error("🚨 Cannot send typing indicator: Socket not connected");
      return;
    }

    console.log(`⌨️ Sending typing indicator to ${to}: ${typing}`);
    socket.emit("typing", { to, conversationId, typing });
  };

  return {
    socket,
    isConnected,
    connectionStatus,
    sendMessage,
    markMessage,
    sendTyping,
  };
};

// Optional: Export connection status constants for use in components
export const SOCKET_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error"
};