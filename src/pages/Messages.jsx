import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/DisabledByDefault";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { role } = useAuth();
  const { get, post, del } = useApi();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Bulk select
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ✅ case-insensitive admin check
  const isAdmin = role?.toLowerCase() === "admin";

  // load messages
  const load = async () => {
    try {
      setLoading(true);
      const data = await get("/contact");
      setMessages(data || []);
      setSelectedIds(new Set()); // reset selection
    } catch {
      setErr("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  // send reply
  const sendReply = async (id) => {
    try {
      await post(`/contact/${id}/reply`, { reply: replyText });
      setSuccess("Reply sent ✅");
      setReplyId(null);
      setReplyText("");
      load(); // reload to show reply history
    } catch {
      setErr("Reply failed");
    }
  };

  // delete whole message
  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await del(`/contact/${id}`);
      setSuccess("Message deleted ❌");
      load();
    } catch {
      setErr("Delete failed");
    }
  };

  // delete single reply
  const deleteReply = async (msgId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await del(`/contact/${msgId}/reply/${replyId}`);
      setSuccess("Reply deleted ❌");
      load();
    } catch {
      setErr("Delete reply failed");
    }
  };

  // bulk delete
  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected messages?`)) return;
    try {
      await Promise.all([...selectedIds].map((id) => del(`/contact/${id}`)));
      setSuccess(`Deleted ${selectedIds.size} messages ❌`);
      setSelectedIds(new Set());
      load();
    } catch {
      setErr("Bulk delete failed");
    }
  };

  // toggle selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllOnPage = () =>
    setSelectedIds(new Set(messages.map((m) => m._id)));
  const clearSelection = () => setSelectedIds(new Set());

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading messages...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        📩 Messages
      </Typography>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Bulk actions bar (only for admin) */}
      {isAdmin && messages.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Select all">
              <span>
                <IconButton onClick={selectAllOnPage}>
                  <SelectAllIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Clear selection">
              <span>
                <IconButton
                  onClick={clearSelection}
                  disabled={selectedIds.size === 0}
                >
                  <DeselectIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete selected">
              <span>
                <IconButton
                  color="error"
                  onClick={bulkDelete}
                  disabled={selectedIds.size === 0}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Chip
              label={`${selectedIds.size} selected`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Paper>
      )}

      {messages.length === 0 ? (
        <Typography>No messages yet.</Typography>
      ) : (
        messages.map((m) => {
          const isSelected = selectedIds.has(m._id);
          return (
            <Paper key={m._id} sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">
                    {m.name} ({m.email})
                  </Typography>
                  <Typography sx={{ mb: 1 }}>{m.message}</Typography>

                  {/* ✅ Show stacked replies */}
                  {m.replies && m.replies.length > 0 && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: "grey.100",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Replies:</Typography>
                      {m.replies.map((r) => (
                        <Paper key={r._id} sx={{ p: 1, my: 1, bgcolor: "white" }}>
                          <Typography variant="body2">{r.text}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(r.repliedAt).toLocaleString()} by{" "}
                            {r.repliedBy?.name || "Admin"}
                          </Typography>

                          {/* Delete reply option for admin */}
                          {isAdmin && (
                            <Button
                              size="small"
                              color="error"
                              sx={{ ml: 2 }}
                              onClick={() => deleteReply(m._id, r._id)}
                            >
                              Delete Reply
                            </Button>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* ✅ Reply form for admins */}
                  {isAdmin && (
                    <>
                      {replyId === m._id ? (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                          <TextField
                            label="Your reply"
                            multiline
                            minRows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="contained"
                              onClick={() => sendReply(m._id)}
                              disabled={!replyText.trim()}
                            >
                              Send Reply
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setReplyId(null);
                                setReplyText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </Stack>
                        </Stack>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => setReplyId(m._id)}
                        >
                          Reply
                        </Button>
                      )}
                    </>
                  )}
                </Box>

                {/* Admin select + delete button */}
                {isAdmin && (
                  <Stack spacing={1} alignItems="flex-end">
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleSelect(m._id)}
                        />
                      }
                      label=""
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => remove(m._id)}
                    >
                      Delete Message
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Paper>
          );
        })
      )}
    </Box>
  );
}
