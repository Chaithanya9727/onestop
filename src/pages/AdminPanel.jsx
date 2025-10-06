import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Tabs,
  Tab,
  TableContainer,
  Stack,
  TextField,
} from "@mui/material";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

export default function AdminPanel() {
  const { role } = useAuth();
  const { get, put, del, post } = useApi();

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0); // 0 = Manage Users, 1 = Messages
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");

  // ✅ Load users
  const loadUsers = async () => {
    try {
      const userData = await get("/users");
      setUsers(userData);
    } catch {
      setError("Failed to load users");
    }
  };

  // ✅ Load messages
  const loadMessages = async () => {
    try {
      const msgData = await get("/contact");
      setMessages(msgData);
    } catch {
      setError("Failed to load messages");
    }
  };

  // Initial load
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadUsers(), loadMessages()]);
      } catch (err) {
        console.error("Admin data fetch failed", err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    if (role === "admin") load();
  }, [role]);

  // ✅ Auto-refresh messages every 10s when on Messages tab
  useEffect(() => {
    if (tab === 1) {
      const interval = setInterval(() => {
        loadMessages();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [tab]);

  // Change user role
  const handleRoleChange = async (id, newRole) => {
    try {
      await put(`/users/${id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
    } catch {
      alert("Failed to update role");
    }
  };

  // Reset user password
  const handleResetPassword = async (id) => {
    const newPass = prompt("Enter a new temporary password:");
    if (!newPass) return;
    try {
      await put(`/users/${id}/reset-password`, { newPassword: newPass });
      alert("Password reset successfully ✅ (email sent to user)");
    } catch {
      alert("Failed to reset password");
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await del(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("User deleted successfully ❌");
    } catch {
      alert("Failed to delete user");
    }
  };

  // Delete message
  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await del(`/contact/${id}`);
      await loadMessages();
      alert("Message deleted ✅ (logged in audit)");
    } catch {
      alert("Failed to delete message");
    }
  };

  // Send reply
  const handleSendReply = async (msgId) => {
    try {
      await post(`/contact/${msgId}/reply`, { reply: replyText });
      setReplyText("");
      await loadMessages();
      alert("Reply sent ✅ (and email delivered)");
    } catch {
      alert("Failed to send reply");
    }
  };

  // Delete reply
  const handleDeleteReply = async (msgId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await del(`/contact/${msgId}/reply/${replyId}`);
      await loadMessages();
      alert("Reply deleted ❌");
    } catch {
      alert("Failed to delete reply");
    }
  };

  if (role !== "admin") {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">Access Denied 🚫</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Admin Panel...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        👑 Admin Panel
      </Typography>

      {/* Tabs */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Manage Users" />
        <Tab label="Messages" />
      </Tabs>

      {/* Error */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Manage Users */}
      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          {users.length === 0 ? (
            <Typography>No users found.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Role</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        color={
                          u.role === "admin"
                            ? "error"
                            : u.role === "student"
                            ? "primary"
                            : "default"
                        }
                        size="small"
                        sx={{ mr: 2 }}
                      />
                      <Select
                        size="small"
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u._id, e.target.value)
                        }
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="guest">Guest</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleResetPassword(u._id)}
                        >
                          Reset Password
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {/* Messages */}
      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📩 Messages
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Message</b></TableCell>
                  <TableCell><b>Time</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messages.map((m) => (
                  <>
                    <TableRow key={m._id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>
                        {m.message.length > 80
                          ? m.message.slice(0, 80) + "..."
                          : m.message}
                      </TableCell>
                      <TableCell>
                        {new Date(m.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            color="error"
                            size="small"
                            onClick={() => handleDeleteMessage(m._id)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              setExpandedMsg(expandedMsg === m._id ? null : m._id)
                            }
                          >
                            {expandedMsg === m._id ? "Hide" : "Reply"}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Chat Section */}
                    {expandedMsg === m._id && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "grey.100",
                              borderRadius: 2,
                              maxHeight: 400,
                              overflowY: "auto",
                            }}
                          >
                            {/* User message bubble */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-start",
                                mb: 2,
                              }}
                            >
                              <Paper
                                sx={{
                                  p: 1.5,
                                  maxWidth: "70%",
                                  bgcolor: "#e0f7fa",
                                }}
                              >
                                <Typography variant="body1">{m.message}</Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {new Date(m.createdAt).toLocaleString()} by{" "}
                                  {m.name}
                                </Typography>
                              </Paper>
                            </Box>

                            {/* Replies */}
                            {m.replies && m.replies.length > 0 && (
                              m.replies.map((r) => (
                                <Box
                                  key={r._id}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    mb: 2,
                                  }}
                                >
                                  <Paper
                                    sx={{
                                      p: 1.5,
                                      maxWidth: "70%",
                                      bgcolor: "#fce4ec",
                                    }}
                                  >
                                    <Typography variant="body2">{r.text}</Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(r.repliedAt).toLocaleString()} by{" "}
                                      {r.repliedBy?.name || "Admin"}
                                    </Typography>
                                    <Button
                                      size="small"
                                      color="error"
                                      sx={{ ml: 2 }}
                                      onClick={() =>
                                        handleDeleteReply(m._id, r._id)
                                      }
                                    >
                                      Delete Reply
                                    </Button>
                                  </Paper>
                                </Box>
                              ))
                            )}

                            {/* Reply form */}
                            <Stack spacing={2} sx={{ mt: 2 }}>
                              <TextField
                                label="Your reply"
                                multiline
                                minRows={2}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <Stack direction="row" justifyContent="flex-end">
                                <Button
                                  variant="contained"
                                  onClick={() => handleSendReply(m._id)}
                                  disabled={!replyText.trim()}
                                >
                                  Send Reply
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {messages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No messages yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
