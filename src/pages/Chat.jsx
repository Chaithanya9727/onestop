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
  Alert,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket";
import '../styles.css'

export default function Chat() {
  const { get, post } = useApi();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [users, setUsers] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const messagesEndRef = useRef(null);

  // ✅ Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // ✅ Load all users
  useEffect(() => {
    (async () => {
      try {
        const list = await get("/users");
        setUsers(list.filter((u) => u._id !== user._id));
      } catch {
        setError("Failed to load users");
      }
    })();
  }, [user]);

  // ✅ Ensure conversation + load messages
  const loadConversation = async (targetUser) => {
    try {
      setLoading(true);
      const conv = await post(`/chat/start/${targetUser._id}`);
      setActive({ ...targetUser, conversationId: conv._id });

      const res = await get(`/chat/${conv._id}/messages?limit=30`);
      setMessages(res.messages || []);
    } catch {
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Send message
  const sendMessage = () => {
    if (!draft.trim() || !active) return;

    const payload = {
      conversationId: active.conversationId,
      to: active._id,
      body: draft.trim(),
    };

    socket.emit("message:send", payload, (ack) => {
      if (ack?.ok) {
        setMessages((m) => [...m, ack.message]);
      }
    });

    setDraft("");
  };

  // ✅ Delete message
  const handleDelete = (mode) => {
    if (!selectedMsg) return;

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

  // ✅ Listen socket updates
  useEffect(() => {
    if (!socket) return;

    socket.on("message:new", ({ message }) => {
      if (message.conversation === active?.conversationId) {
        setMessages((m) => [...m, message]);
      }
    });

    socket.on("message:deleted", ({ messageId, mode }) => {
      if (mode === "everyone") {
        setMessages((msgs) =>
          msgs.map((m) =>
            m._id === messageId ? { ...m, body: "❌ Message deleted" } : m
          )
        );
      }
    });

    return () => {
      socket.off("message:new");
      socket.off("message:deleted");
    };
  }, [socket, active?.conversationId]);

  if (loading && !messages.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

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
                  {u.name[0]}
                </Avatar>
              </Badge>
              <Typography fontWeight="medium">{u.name}</Typography>
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Chat Window */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #eee",
            fontWeight: "bold",
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          {active ? active.name : "Select a user"}
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            background: "#e5ddd5", // WhatsApp-like
          }}
        >
          {messages.map((m, i) => (
            <Stack
              key={m._id || i}
              alignItems={m.from === user._id ? "flex-end" : "flex-start"}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  position: "relative",
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  maxWidth: "70%",
                  boxShadow: 2,
                  backgroundColor:
                    m.from === user._id ? "#DCF8C6" : "white",
                  color: "black",
                }}
              >
                <Typography>{m.body}</Typography>
                {m.from === user._id && (
                  <IconButton
                    size="small"
                    sx={{ position: "absolute", top: -10, right: -10 }}
                    onClick={(e) => {
                      setMenuAnchor(e.currentTarget);
                      setSelectedMsg(m);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                • {m.status}
              </Typography>
            </Stack>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box
          sx={{
            p: 1,
            display: "flex",
            gap: 1,
            borderTop: "1px solid #eee",
            background: "#f0f0f0",
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            sx={{ bgcolor: "white", borderRadius: 2 }}
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            sx={{ bgcolor: "primary.main", color: "white" }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Delete menu */}
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
