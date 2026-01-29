import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./context/AuthContext";

const SocketContext = createContext(null);

/* =====================================================
   ⚡ SOCKET PROVIDER
===================================================== */
export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // Backend URL
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  /* =====================================================
     🔌 Initialize socket only when token is available
  ====================================================== */
  useEffect(() => {
    if (!token) {
      console.warn("🔑 No token — socket not initialized yet");
      setIsConnected(false);
      setConnectionStatus("disconnected");
      return;
    }

    console.log("🔄 Creating socket connection...");
    setConnectionStatus("connecting");

    const socket = io(SOCKET_URL, {
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

    socketRef.current = socket;

    /* =====================================================
       ⚙️ Event Handlers
    ====================================================== */
    socket.on("connect", () => {
      console.log("✅ Connected to socket server:", socket.id);
      setIsConnected(true);
      setConnectionStatus("connected");

      if (user?._id) {
        socket.emit("presence:online", { userId: user._id, role: user.role });
        socket.emit("notification:join", user._id);
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");

      if (reason === "io server disconnect") socket.connect();
    });

    socket.on("connect_error", (err) => {
      console.error("🚨 Socket error:", err.message);
      setConnectionStatus("error");
    });

    socket.on("reconnect", (attempt) => {
      console.log(`🔄 Socket reconnected (attempt ${attempt})`);
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    /* =====================================================
       🔔 Real-time Notifications
    ====================================================== */
    socket.on("notification:new", (notif) => {
      console.log("🔔 New Notification received:", notif);
      window.dispatchEvent(new CustomEvent("socket:notification", { detail: notif }));
    });

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
      console.log("⌨️ Typing event:", data);
    });

    return () => {
      console.log("🧹 Cleaning socket listeners...");
      socket.removeAllListeners();
      socket.disconnect();
      setIsConnected(false);
      setConnectionStatus("disconnected");
    };
  }, [token, user, SOCKET_URL]);

  const socket = socketRef.current;

  /* =====================================================
     🔍 Debug logging
  ====================================================== */
  useEffect(() => {
    console.log(`📡 Socket status: ${connectionStatus} | Connected: ${isConnected}`);
  }, [connectionStatus, isConnected]);

  const contextValue = {
    socket,
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

  const sendNotification = (payload) => {
    if (!socket || !isConnected) return console.error("Socket not connected");
    console.log("📢 Sending manual notification:", payload);
    socket.emit("notification:send", payload);
  };

  const markMessage = (messageId, status) => {
    if (!socket || !isConnected) return console.error("Socket not connected");
    socket.emit("message:mark", { messageId, status });
  };

  const sendTyping = (to, conversationId, typing = true) => {
    if (!socket || !isConnected) return console.error("Socket not connected");
    socket.emit("typing", { to, conversationId, typing });
  };

  return {
    socket,
    isConnected,
    connectionStatus,
    sendMessage,
    sendNotification,
    markMessage,
    sendTyping,
  };
};

/* =====================================================
   🔖 Export Socket States
===================================================== */
export const SOCKET_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
};
