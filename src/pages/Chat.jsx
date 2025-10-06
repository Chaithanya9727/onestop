import { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  List,
  ListItemButton,
  Avatar,
  Typography,
  Divider,
  Stack,
  TextField,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket";
import "../styles.css";

export default function Chat() {
  const { get, post } = useApi();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [users, setUsers] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // ✅ Scroll to bottom
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // ✅ Load users
  useEffect(() => {
    (async () => {
      try {
        const list = await get("/users");
        setUsers(list.filter((u) => u._id !== user?._id));
      } catch {
        setError("Failed to load users");
      }
    })();
  }, [user]);

  // ✅ Load conversation
  const loadConversation = async (targetUser) => {
    try {
      setLoading(true);
      const conv = await post(`/chat/start/${targetUser._id}`);
      setActive({ ...targetUser, conversationId: conv._id });

      const res = await get(`/chat/${conv._id}/messages?limit=50`);
      setMessages(res.messages || []);

      // Mark unseen messages as seen
      res.messages?.forEach((m) => {
        if (m.to === user._id && m.status !== "seen") {
          socket.emit("message:mark", { messageId: m._id, status: "seen" });
        }
      });
    } catch {
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Send message
  const sendMessage = () => {
    if (!draft.trim() || !active || !socket) return;

    const payload = {
      conversationId: active.conversationId,
      to: active._id,
      body: draft.trim(),
    };

    socket.emit("message:send", payload, (ack) => {
      if (ack?.ok && ack.message) {
        setMessages((prev) => [...prev, ack.message]);
        scrollToBottom();
      }
    });

    setDraft("");
    socket.emit("typing", {
      to: active._id,
      conversationId: active.conversationId,
      typing: false,
    });
  };

  // ✅ Typing
  const handleTyping = (e) => {
    setDraft(e.target.value);
    if (!socket || !active) return;

    socket.emit("typing", {
      to: active._id,
      conversationId: active.conversationId,
      typing: true,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", {
        to: active._id,
        conversationId: active.conversationId,
        typing: false,
      });
    }, 2000);
  };

  // ✅ Delete message
  const handleDelete = (mode) => {
    if (!selectedMsg || !socket) return;

    socket.emit("message:delete", { messageId: selectedMsg._id, mode }, (ack) => {
      if (ack?.ok) {
        if (mode === "me") {
          setMessages((msgs) => msgs.filter((m) => m._id !== selectedMsg._id));
        } else if (mode === "everyone") {
          setMessages((msgs) =>
            msgs.map((m) =>
              m._id === selectedMsg._id ? { ...m, body: "❌ Message deleted" } : m
            )
          );
        }
      }
    });

    setMenuAnchor(null);
    setSelectedMsg(null);
  };

  // ✅ Live socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNew = ({ message }) => {
      if (message.conversation === active?.conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // If receiver is active, mark as seen
        if (message.to === user._id) {
          socket.emit("message:mark", {
            messageId: message._id,
            status: "seen",
          });
        }
      }
    };

    const handleDeleted = ({ messageId, mode }) => {
      if (mode === "everyone") {
        setMessages((msgs) =>
          msgs.map((m) =>
            m._id === messageId ? { ...m, body: "❌ Message deleted" } : m
          )
        );
      }
    };

    const handleTypingEvent = ({ from, typing }) => {
      if (from !== user?._id && typing) {
        const typingUserObj = users.find((u) => u._id === from);
        if (typingUserObj) {
          setTypingUser(typingUserObj.name);
          clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setTypingUser(null), 2000);
        }
      } else {
        setTypingUser(null);
      }
    };

    const handleMessageUpdate = ({ messageId, status }) => {
      setMessages((msgs) =>
        msgs.map((m) =>
          m._id === messageId ? { ...m, status: status } : m
        )
      );
    };

    socket.on("message:new", handleNew);
    socket.on("message:deleted", handleDeleted);
    socket.on("typing", handleTypingEvent);
    socket.on("message:update", handleMessageUpdate);

    return () => {
      socket.off("message:new", handleNew);
      socket.off("message:deleted", handleDeleted);
      socket.off("typing", handleTypingEvent);
      socket.off("message:update", handleMessageUpdate);
    };
  }, [socket, active?.conversationId, users, user?._id]);

  // ✅ Fix alignment delay
  if (!user || !user._id) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading user session...</Typography>
      </Box>
    );
  }

  useEffect(() => {
    if (user && user._id) setMessages((prev) => [...prev]);
  }, [user]);

  if (loading && !messages.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ✅ Helper to show message ticks
  const renderStatus = (msg) => {
    if (msg.from !== user._id) return null;

    if (msg.status === "sent") {
      return <DoneIcon fontSize="small" sx={{ ml: 0.5, color: "gray" }} />;
    } else if (msg.status === "delivered") {
      return <DoneAllIcon fontSize="small" sx={{ ml: 0.5, color: "gray" }} />;
    } else if (msg.status === "seen") {
      return <DoneAllIcon fontSize="small" sx={{ ml: 0.5, color: "#2196f3" }} />;
    }
    return null;
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
        gap: 2,
        height: "calc(100vh - 100px)",
      }}
    >
      {/* Sidebar */}
      <Paper sx={{ p: 1, overflow: "auto" }}>
        <Typography variant="h6" sx={{ p: 1, fontWeight: "bold" }}>
          All Users
        </Typography>
        <Divider />
        <List>
          {users.map((u) => (
            <ListItemButton
              key={u._id}
              selected={active?._id === u._id}
              onClick={() => loadConversation(u)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "white",
                  "& .MuiTypography-root": { color: "white" },
                },
              }}
            >
              <Badge
                color="success"
                variant="dot"
                overlap="circular"
                invisible={!u.online}
              >
                <Avatar src={u.avatar} sx={{ mr: 2 }}>
                  {u.name[0].toUpperCase()}
                </Avatar>
              </Badge>
              <Typography fontWeight="medium">{u.name}</Typography>
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Chat Window */}
      <Paper className="chat-window">
        <Box className="chat-header">
          {active ? active.name : "Select a user"}
        </Box>

        <Box className="chat-body">
          {messages.map((m) => (
            <Stack
              key={m._id}
              alignItems={
                (m.from?._id || m.from) === user._id ? "flex-end" : "flex-start"
              }
              sx={{ mb: 2 }}
            >
              <Box
                className={`chat-bubble ${
                  (m.from?._id || m.from) === user._id ? "sent" : "received"
                }`}
                onClick={(e) => {
                  if ((m.from?._id || m.from) === user._id) {
                    setMenuAnchor(e.currentTarget);
                    setSelectedMsg(m);
                  }
                }}
              >
                <Typography>{m.body}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.2}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                  {renderStatus(m)}
                </Stack>
              </Box>
            </Stack>
          ))}

          {typingUser && (
            <Typography
              sx={{
                fontStyle: "italic",
                fontSize: "0.85rem",
                color: "gray",
                mb: 1,
                textAlign: "left",
              }}
            >
              🖊️ {typingUser} is typing...
            </Typography>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {active && (
          <Box className="chat-input">
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message…"
              value={draft}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Paper>

      {/* Delete Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleDelete("me")}>Delete for me</MenuItem>
        <MenuItem onClick={() => handleDelete("everyone")}>
          Delete for everyone
        </MenuItem>
      </Menu>
    </Box>
  );
}
