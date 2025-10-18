import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  MenuItem,
  Chip,
  CircularProgress,
  Divider,
  Autocomplete,
} from "@mui/material";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

export default function AdminSendMail() {
  const { role } = useAuth();
  const { get, post } = useApi();

  const isAdmin = ["admin", "superadmin"].includes(role?.toLowerCase());

  const [recipients, setRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [toRole, setToRole] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Normal");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ✅ load recipients list (admins/superadmins)
  const loadRecipients = async (role = "all") => {
    try {
      const data = await get(`/mail/recipients?role=${role}`);
      setRecipients(data);
    } catch (err) {
      console.error("Load recipients failed:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) loadRecipients("all");
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body = {
        toEmails: selectedEmails.map((e) => e.email),
        toRole: toRole || undefined,
        subject,
        message,
        priority,
      };
      const res = await post("/mail/send", body);
      setSuccess(res.message || "Mail sent successfully ✅");
      setSubject("");
      setMessage("");
      setSelectedEmails([]);
      setToRole("");
      setPriority("Normal");
    } catch (err) {
      console.error("Send mail failed:", err);
      setError("Failed to send mail. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error">🚫 Access denied — Admins only</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📧 Send Internal Mail
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Communicate with other admins, superadmins, or specific users.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2 }}
        >
          {/* Role Selection */}
          <TextField
            select
            label="Send to Role"
            value={toRole}
            onChange={(e) => setToRole(e.target.value)}
            helperText="Optional — send to all Admins or Superadmins"
            fullWidth
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="admin">All Admins</MenuItem>
            <MenuItem value="superadmin">All Superadmins</MenuItem>
          </TextField>

          {/* Specific Recipients */}
          <Autocomplete
            multiple
            options={recipients}
            getOptionLabel={(opt) => `${opt.name} (${opt.email})`}
            value={selectedEmails}
            onChange={(_, val) => setSelectedEmails(val)}
            filterSelectedOptions
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={`${option.name} (${option.email})`}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Specific Recipients"
                placeholder="Search users or admins"
              />
            )}
          />

          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            fullWidth
            multiline
            minRows={4}
          />

          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            fullWidth
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Normal">Normal</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </TextField>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#1976d2",
                ":hover": { bgcolor: "#1565c0" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Send"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setToRole("");
                setSelectedEmails([]);
                setSubject("");
                setMessage("");
                setPriority("Normal");
              }}
            >
              Clear
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
