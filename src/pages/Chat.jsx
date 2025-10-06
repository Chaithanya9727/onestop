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
  Drawer,
  AppBar,
  Toolbar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Load users
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

  // Load conversation
  const loadConversation = async (targetUser) => {
    try {
      setLoading(true);
      const conv = await post(`/chat/start/${targetUser._id}`);
      setActive({ ...targetUser, conversationId: conv._id });
      const res = await get(`/chat/${conv._id}/messages?limit=30`);
      setMessages(res.messages || []);
      setDrawerOpen(false); // close drawer on mobile
    } catch {
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!draft.trim() || !active) return;
    const payload = {
      conversationId: active.conversationId,
      to: active._id,
      body: draft.trim(),
    };
    socket.emit("message:send", payload, (ack) => {
      if (ack?.ok) setMessages((m) => [...m, ack.message]);
    });
    setDraft("");
  };

  // Delete message
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

  // Socket listeners
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
      <Box className="chat-loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="chat-container">
      {/* Desktop Sidebar */}
      <Paper className="chat-sidebar desktop-only">
        <Typography variant="h6" className="sidebar-title">
          All Users
        </Typography>
        <Divider />
        <List className="user-list">
          {users.map((u) => (
            <ListItemButton
              key={u._id}
              selected={active?._id === u._id}
              onClick={() => loadConversation(u)}
              className={`user-item ${
                active?._id === u._id ? "user-selected" : ""
              }`}
            >
              <Badge
                color="success"
                variant="dot"
                overlap="circular"
                invisible={!u.online}
              >
                <Avatar src={u.avatar} className="user-avatar">
                  {u.name[0]}
                </Avatar>
              </Badge>
              <Typography fontWeight="500">{u.name}</Typography>
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260, p: 1 }}>
          <Typography variant="h6" sx={{ p: 1, fontWeight: "bold" }}>
            All Users
          </Typography>
          <Divider />
          <List>
            {users.map((u) => (
              <ListItemButton
                key={u._id}
                onClick={() => loadConversation(u)}
                selected={active?._id === u._id}
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
                <Typography>{u.name}</Typography>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Chat Window */}
      <Paper className="chat-window">
        <AppBar position="static" sx={{ background: "#1565c0" }}>
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 2,
            }}
          >
            {/* Mobile menu button */}
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              className="mobile-only"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {active ? active.name : "Select a user"}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box className="chat-messages">
          {messages.map((m, i) => (
            <Stack
              key={m._id || i}
              className={`chat-bubble-wrapper ${
                m.from === user._id ? "sent" : "received"
              }`}
            >
              <Box
                className={`chat-bubble ${
                  m.from === user._id ? "bubble-sent" : "bubble-received"
                }`}
              >
                <Typography>{m.body}</Typography>
                {m.from === user._id && (
                  <IconButton
                    size="small"
                    className="msg-menu-btn"
                    onClick={(e) => {
                      setMenuAnchor(e.currentTarget);
                      setSelectedMsg(m);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="caption" className="msg-time">
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

        {/* Input */}
        <Box className="chat-input-bar">
          <TextField
            size="small"
            fullWidth
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="chat-input"
          />
          <IconButton className="send-btn" onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
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
