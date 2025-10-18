import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

export default function AdminMailBox() {
  const { role, user } = useAuth();
  const { get, del, patch } = useApi();

  const isAdmin = ["admin", "superadmin"].includes(role?.toLowerCase());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("inbox"); // inbox | sent
  const [mails, setMails] = useState([]);

  const load = async (box = tab) => {
    try {
      setLoading(true);
      const res = await get(`/mail?box=${box}`);
      setMails(res.items || []);
      setSuccess("");
      setErr("");
    } catch (error) {
      console.error("Load mail error:", error);
      setErr("Failed to load mail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load("inbox");
  }, [isAdmin]);

  const handleTab = (_, val) => {
    setTab(val);
    load(val);
  };

  const markRead = async (id) => {
    try {
      await patch(`/mail/${id}/read`);
      setSuccess("Marked as read ✅");
      load(tab);
    } catch {
      setErr("Failed to mark as read");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this mail?")) return;
    try {
      await del(`/mail/${id}`);
      setSuccess("Mail deleted ❌");
      load(tab);
    } catch {
      setErr("Failed to delete mail");
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Alert severity="error">🚫 Access denied — Admins only</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📥 Admin Mailbox
      </Typography>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs
        value={tab}
        onChange={handleTab}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab value="inbox" label="Inbox" />
        <Tab value="sent" label="Sent" />
      </Tabs>

      {loading ? (
        <Box sx={{ textAlign: "center", p: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading {tab}...</Typography>
        </Box>
      ) : mails.length === 0 ? (
        <Typography>No {tab} messages found.</Typography>
      ) : (
        mails.map((m) => {
          const isUnread = !m.readAt && tab === "inbox";
          return (
            <Paper
              key={m._id}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 3,
                borderLeft: isUnread ? "5px solid #1976d2" : "5px solid transparent",
                boxShadow: 2,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {tab === "sent"
                      ? `To: ${m.toUser?.name || m.toEmail}`
                      : `From: ${m.from?.name || "Unknown"} (${m.from?.email})`}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {m.subject}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography sx={{ whiteSpace: "pre-line" }}>{m.message}</Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={`Priority: ${m.priority}`}
                      color={
                        m.priority === "High"
                          ? "error"
                          : m.priority === "Low"
                          ? "default"
                          : "primary"
                      }
                      size="small"
                      variant="outlined"
                    />
                    {m.readAt && (
                      <Chip
                        label="Read"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(m.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>

                {/* actions */}
                <Stack spacing={1} alignItems="flex-end">
                  {tab === "inbox" && !m.readAt && (
                    <Tooltip title="Mark as Read">
                      <IconButton onClick={() => markRead(m._id)}>
                        <MarkEmailReadIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => remove(m._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
          );
        })
      )}
    </Box>
  );
}
