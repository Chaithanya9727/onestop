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
  Stack,
  CircularProgress,
  TextField,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";


export default function AdminMessages() {
  const { get, post, del } = useApi();
  const { role } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyId, setReplyId] = useState(null);

  const pageSize = 10;

  // ✅ Load all messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await get(`/messages?search=${search}&page=${page}&limit=${pageSize}`);
      setMessages(data.messages || []);
      setPages(data.pages || 1);
      setSelected([]);
      setError("");
    } catch (err) {
      console.error("Failed to load messages", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadMessages();
  };

  // ✅ Delete Message (Admin + SuperAdmin)
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await del(`/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setSuccess("Message deleted successfully ✅");
    } catch {
      setError("Failed to delete message");
    }
  };

  // ✅ Bulk Delete (SuperAdmin)
  const handleBulkDelete = async () => {
    if (role !== "superadmin") return alert("Only SuperAdmin can bulk delete 🚫");
    if (selected.length === 0) return alert("Select at least one message to delete");
    if (!window.confirm(`Delete ${selected.length} selected messages?`)) return;
    try {
      await del("/messages/bulk/all");
      setMessages([]);
      setSuccess("All messages deleted successfully ✅");
    } catch {
      setError("Failed to bulk delete messages");
    }
  };

  // ✅ Send Reply
  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await post(`/messages/${replyId}/reply`, { reply: replyText });
      setReplyText("");
      setReplyId(null);
      loadMessages();
      setSuccess("Reply sent successfully ✅");
    } catch {
      setError("Failed to send reply");
    }
  };

  // ✅ Selection toggles
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === messages.length) setSelected([]);
    else setSelected(messages.map((m) => m._id));
  };

  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading messages...</Typography>
      </Box>
    );

  if (role !== "admin" && role !== "superadmin")
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error">🚫 Access Denied — Admins Only</Alert>
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        💬 Messages Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* 🔍 Search Bar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search messages"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          fullWidth
        />
        <Button variant="contained" onClick={handleSearch}>
          🔍 Search
        </Button>

        {role === "superadmin" && (
          <Button
            variant="contained"
            color="error"
            onClick={handleBulkDelete}
            disabled={messages.length === 0}
          >
            🗑 Delete All
          </Button>
        )}
      </Stack>

      {/* 🧾 Messages Table */}
      <Paper sx={{ overflowX: "auto" }}>
        {messages.length === 0 ? (
          <Typography sx={{ p: 3 }}>No messages found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {role === "superadmin" && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.length === messages.length && messages.length > 0}
                      indeterminate={
                        selected.length > 0 && selected.length < messages.length
                      }
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                )}
                <TableCell><b>From</b></TableCell>
                <TableCell><b>To</b></TableCell>
                <TableCell><b>Message</b></TableCell>
                <TableCell><b>Created</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((m) => (
                <TableRow key={m._id}>
                  {role === "superadmin" && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(m._id)}
                        onChange={() => toggleSelect(m._id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    {m.from ? `${m.from.name} (${m.from.email})` : "System"}
                  </TableCell>
                  <TableCell>
                    {m.to ? `${m.to.name} (${m.to.email})` : "—"}
                  </TableCell>
                  <TableCell>{m.body}</TableCell>
                  <TableCell>
                    {new Date(m.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setReplyId(m._id)}
                      >
                        Reply
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(m._id)}
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

      {/* Pagination */}
      {pages > 1 && (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ◀ Prev
          </Button>
          <Typography>
            Page {page} of {pages}
          </Typography>
          <Button
            variant="outlined"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ▶
          </Button>
        </Stack>
      )}

      {/* Reply Dialog */}
      <Dialog open={!!replyId} onClose={() => setReplyId(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reply to Message</DialogTitle>
        <DialogContent>
          <TextField
            label="Your Reply"
            multiline
            fullWidth
            minRows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyId(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendReply}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
