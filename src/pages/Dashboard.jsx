import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Link,
  Stack,
  Chip,
  CircularProgress,
  Avatar,
  Badge,
  Alert,
  useTheme,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { useSocket } from "../socket.jsx";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { get } = useApi();
  const { socket, isConnected } = useSocket();
  const theme = useTheme();

  const [recentNotices, setRecentNotices] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Load dashboard data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const noticesRes = await get("/notices");
        const resourcesRes = await get("/resources");
        const evsRes = await get("/events?limit=3&page=1");

        const noticesArr = Array.isArray(noticesRes)
          ? noticesRes
          : noticesRes.notices || [];
        setRecentNotices(noticesArr.slice(0, 3));

        const resourcesArr = Array.isArray(resourcesRes)
          ? resourcesRes
          : resourcesRes.resources || [];
        setRecentResources(resourcesArr.slice(0, 3));

        if (user && (role === "candidate" || role === "admin" || role === "superadmin")) {
          const mine = resourcesArr.filter((r) => r.user === user._id);
          setMyResources(mine.slice(0, 3));
        }

        const evsArr = Array.isArray(evsRes) ? evsRes : evsRes.events || [];
        const upcoming = evsArr
          .filter((ev) => new Date(ev.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        setUpcomingEvents(upcoming);

        if (role === "admin" || role === "superadmin") {
          const msgs = await get("/messages");
          setRecentMessages(msgs.messages?.slice(0, 3) || []);

          const logs = await get("/users/audit");
          const logsArr = Array.isArray(logs) ? logs : logs.logs || [];
          setRecentLogs(logsArr.slice(0, 5));
        }
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) load();
  }, [authLoading, user, role, get]);

  // ✅ Real-time socket alert
  useEffect(() => {
    if (!socket || !isConnected) return;
    const handleNewMessage = (data) => {
      const message = data.message || data;
      setNewMessage(message);
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => console.log("🔇 Sound autoplay blocked"));
    };
    socket.on("message:new", handleNewMessage);
    return () => socket.off("message:new", handleNewMessage);
  }, [socket, isConnected]);

  if (authLoading || loading)
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your dashboard...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* 🎉 Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: 4,
            background:
              theme.palette.mode === "light"
                ? "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(255,51,102,0.1))"
                : "linear-gradient(135deg, rgba(176,148,255,0.12), rgba(255,92,138,0.12))",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Welcome back,{" "}
            <Typography
              component="span"
              sx={{
                background:
                  "linear-gradient(90deg, #6c63ff, #ff3366)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              {user?.name || "User"} 👋
            </Typography>
          </Typography>
          <Chip
            label={role || "Guest"}
            color={
              role === "superadmin"
                ? "success"
                : role === "admin"
                ? "warning"
                : role === "candidate"
                ? "primary"
                : "default"
            }
            variant="filled"
            sx={{ fontWeight: "bold", textTransform: "capitalize" }}
          />
        </Paper>
      </motion.div>

      {/* 💬 Live Message Alert */}
      {newMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Paper
            sx={{
              p: 2.5,
              mb: 4,
              borderLeft: `6px solid ${
                theme.palette.mode === "light" ? "#f50057" : "#ff5c8a"
              }`,
              backgroundColor:
                theme.palette.mode === "light" ? "#fff6f8" : "#2b1c2c",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 3,
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 4px 16px rgba(245,0,87,0.15)"
                  : "0 6px 20px rgba(255,92,138,0.25)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge color="error" variant="dot">
                <Avatar
                  src={newMessage.from?.avatar}
                  alt={newMessage.from?.name || "User"}
                >
                  {!newMessage.from?.avatar && newMessage.from?.name?.charAt(0)}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  New message from {newMessage.from?.name || "Unknown"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {newMessage.body?.slice(0, 80) || "New message received..."}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              color="error"
              onClick={() => navigate("/chat")}
            >
              Open Chat
            </Button>
          </Paper>
        </motion.div>
      )}

      {/* ⚡ Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: "📚 Resources",
            desc: "Access notes, tutorials, and shared study materials.",
            btn: "Go to Resources",
            action: () => navigate("/resources"),
          },
          {
            title: "👤 Profile",
            desc: "Manage your account information and settings.",
            btn: "Go to Profile",
            action: () => navigate("/profile"),
          },
          ...(role === "admin" || role === "superadmin"
            ? [
                {
                  title: "👑 Admin Panel",
                  desc: "Manage users, roles, and contact messages.",
                  btn: "Go to Admin Panel",
                  action: () => navigate("/admin"),
                },
                {
                  title: "📜 Activity Logs",
                  desc: "Track user role changes, deletions, and resets.",
                  btn: "View Logs",
                  action: () => navigate("/admin/logs"),
                },
              ]
            : []),
        ].map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 4,
                  background:
                    theme.palette.mode === "light"
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(30,30,45,0.6)",
                  backdropFilter: "blur(12px)",
                  boxShadow:
                    theme.palette.mode === "light"
                      ? "0 6px 18px rgba(108,99,255,0.15)"
                      : "0 8px 24px rgba(176,148,255,0.25)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {item.desc}
                </Typography>
                <Button variant="contained" onClick={item.action}>
                  {item.btn}
                </Button>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* 📢 Latest Notices + Resources */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6">📢 Latest Notices</Typography>
              <Button size="small" variant="outlined" onClick={() => navigate("/notices")}>
                View All
              </Button>
            </Stack>
            {recentNotices.length > 0 ? (
              recentNotices.map((n) => (
                <Box key={n._id} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1">{n.title}</Typography>
                    {n.pinned && <Chip label="Pinned" size="small" color="warning" />}
                    <Chip label={n.audience} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {n.body.slice(0, 140)}...
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No notices yet.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              📌 Recent Resources
            </Typography>
            {recentResources.length > 0 ? (
              recentResources.map((r) => (
                <Box key={r._id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{r.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.type} — {r.description || "No description"}
                  </Typography>
                  {r.url && (
                    <Link href={r.url} target="_blank" underline="hover">
                      Open Resource
                    </Link>
                  )}
                </Box>
              ))
            ) : (
              <Typography>No resources yet.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
