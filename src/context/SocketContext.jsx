// src/context/SocketContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

/* =====================================================
   ⚡ SOCKET PROVIDER
===================================================== */
export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected | connecting | connected | error

  // Backend Socket URL
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  /* =====================================================
     🔌 Socket Initialization
  ====================================================== */
  const socket = useMemo(() => {
    if (!token) {
      console.warn("🔑 No token, skipping socket initialization");
      return null;
    }

    console.log("🔄 Creating socket connection...");
    setConnectionStatus("connecting");

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true,
    });

    return s;
  }, [token, SOCKET_URL]);

  /* =====================================================
     ⚙️ Socket Event Handlers
  ====================================================== */
  useEffect(() => {
    if (!socket) {
      console.log("❌ No socket instance available");
      setConnectionStatus("disconnected");
      return;
    }

    const handleConnect = () => {
      console.log("✅ Connected to socket server:", socket.id);
      setIsConnected(true);
      setConnectionStatus("connected");
      socketRef.current = socket;

      // Register user and join their notification room
      if (user?._id) {
        socket.emit("registerUser", user._id);
        socket.emit("presence:online", { userId: user._id, role: user.role });
        socket.emit("notification:join", user._id); // ✅ join personal notification room
      }
    };

    const handleDisconnect = (reason) => {
      console.warn("❌ Socket disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      if (reason === "io server disconnect") {
        socket.connect();
      }
    };

    const handleError = (error) => {
      console.error("🚨 Socket error:", error.message);
      setIsConnected(false);
      setConnectionStatus("error");
    };

    const handleReconnect = (attempt) => {
      console.log(`🔄 Socket reconnected (attempt ${attempt})`);
      setIsConnected(true);
      setConnectionStatus("connected");
      if (user?._id) {
        socket.emit("presence:online", { userId: user._id, role: user.role });
        socket.emit("notification:join", user._id);
      }
    };

    const handleReconnectAttempt = (a) => {
      console.log("🔁 Attempting to reconnect:", a);
      setConnectionStatus("connecting");
    };

    const handleReconnectFailed = () => {
      console.error("💥 Reconnection failed");
      setConnectionStatus("error");
    };

    /* =====================================================
       🔔 Notifications
    ====================================================== */
    const handleNotification = (payload) => {
      console.log("🔔 Notification received:", payload);
      window.dispatchEvent(new CustomEvent("socket:notification", { detail: payload }));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("reconnect", handleReconnect);
    socket.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("reconnect_failed", handleReconnectFailed);

    // Support both event names just in case
    socket.on("notification", handleNotification);
    socket.on("notification:new", handleNotification);

    /* =====================================================
       💬 Messaging
    ====================================================== */
    socket.on("message:new", (data) => {
      console.log("💬 New message received:", data);
      window.dispatchEvent(new CustomEvent("socket:newMessage", { detail: data }));
    });

    socket.on("message:update", (data) => {
      console.log("📝 Message updated:", data);
    });

    socket.on("typing", (data) => {
      console.log("⌨️ Typing:", data);
    });

    if (!socket.connected) socket.connect();

    return () => {
      console.log("🧹 Cleaning socket listeners");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.off("reconnect", handleReconnect);
      socket.off("reconnect_attempt", handleReconnectAttempt);
      socket.off("reconnect_failed", handleReconnectFailed);
      socket.off("notification");
      socket.off("notification:new");
      socket.off("message:new");
      socket.off("message:update");
      socket.off("typing");

      if (socket.connected) socket.disconnect();

      setIsConnected(false);
      setConnectionStatus("disconnected");
    };
  }, [socket, user]);

  /* =====================================================
     🧭 Connection Debug Logging
  ====================================================== */
  useEffect(() => {
    console.log(`🔍 Socket status: ${connectionStatus} | Connected: ${isConnected}`);
  }, [connectionStatus, isConnected]);

  const contextValue = {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}

/* =====================================================
   🎯 useSocket Hook
===================================================== */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");

  const { socket, isConnected, connectionStatus } = context;

  // ✅ Send Message
  const sendMessage = (payload, callback) => {
    if (!socket || !isConnected) {
      console.error("🚨 Cannot send message: Socket not connected");
      callback?.({ ok: false, error: "Socket not connected" });
      return;
    }

    console.log("📤 Sending message:", payload);
    socket.emit("message:send", payload, (response) => {
      console.log("📨 Message response:", response);
      callback?.(response);
    });
  };

  // ✅ Mark Message
  const markMessage = (messageId, status) => {
    if (!socket || !isConnected) return console.error("Socket not connected");
    socket.emit("message:mark", { messageId, status });
  };

  // ✅ Typing Indicator
  const sendTyping = (to, conversationId, typing = true) => {
    if (!socket || !isConnected) return console.error("Socket not connected");
    socket.emit("typing", { to, conversationId, typing });
  };

  // ✅ Emit Notification (manual)
  const sendNotification = (payload) => {
    if (!socket || !isConnected) return console.error("Socket not connected");
    console.log("📢 Sending manual notification:", payload);
    socket.emit("notification:send", payload);
  };

  return {
    socket,
    isConnected,
    connectionStatus,
    sendMessage,
    markMessage,
    sendTyping,
    sendNotification,
  };
};

/* =====================================================
   🔖 Socket Status Constants
===================================================== */
export const SOCKET_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
};
