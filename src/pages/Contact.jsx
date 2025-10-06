import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import './styles.css'

export default function Contact() {
  const { user } = useAuth();
  const { post, get } = useApi();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);

  // Load conversation history for logged-in user
  const loadMessages = async () => {
    try {
      const data = await get("/contact"); 
      // ✅ only show this user's messages
      const mine = data.filter((m) => m.email === (user?.email || email));
      setConversations(mine);
    } catch (err) {
      console.error("Failed to load conversation", err);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadMessages();

      // ✅ auto-refresh every 10 seconds
      const interval = setInterval(() => {
        loadMessages();
      }, 10000);

      return () => clearInterval(interval); // cleanup on unmount
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await post("/contact", { name, email, message });
      setSuccess("Message sent successfully ✅");
      setMessage("");
      loadMessages(); // ✅ refresh immediately
    } catch (err) {
      console.error("Contact send failed", err);
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: "auto" }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📩 Contact Us
        </Typography>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          Have any questions or feedback? Send us a message and we’ll reply soon.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2, mt: 2 }}
        >
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">
              Send
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setName(user?.name || "");
                setEmail(user?.email || "");
                setMessage("");
              }}
            >
              Clear
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Conversation Thread */}
      {conversations.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            💬 Conversation History
          </Typography>

          {conversations.map((m) => (
            <Box key={m._id} sx={{ mb: 3 }}>
              {/* User message bubble */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  mb: 1,
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
                  <Typography variant="caption" color="text.secondary">
                    {new Date(m.createdAt).toLocaleString()}
                  </Typography>
                </Paper>
              </Box>

              {/* Admin replies */}
              {m.replies && m.replies.length > 0 ? (
                m.replies.map((r) => (
                  <Box
                    key={r._id}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mb: 1,
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
                      <Typography variant="caption" color="text.secondary">
                        {new Date(r.repliedAt).toLocaleString()} by{" "}
                        {r.repliedBy?.name || "Admin"}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No replies yet.
                </Typography>
              )}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
