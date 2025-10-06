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
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";

export default function Dashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { get } = useApi();

  const [recentNotices, setRecentNotices] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Notices
        const noticesRes = await get("/notices");
        const noticesArr = Array.isArray(noticesRes)
          ? noticesRes
          : noticesRes.notices || [];
        setRecentNotices(noticesArr.slice(0, 3));

        // ✅ Resources
        const resourcesRes = await get("/resources");
        const resourcesArr = Array.isArray(resourcesRes)
          ? resourcesRes
          : resourcesRes.resources || [];
        setRecentResources(resourcesArr.slice(0, 3));

        if (user && (role === "student" || role === "admin")) {
          const mine = resourcesArr.filter((r) => r.user === user._id);
          setMyResources(mine.slice(0, 3));
        }

        // ✅ Admin extras
        if (role === "admin") {
          const msgs = await get("/contact");
          setRecentMessages(msgs.slice(0, 3));

          const logs = await get("/users/audit");
          const logsArr = Array.isArray(logs) ? logs : logs.logs || [];
          setRecentLogs(logsArr.slice(0, 5));
        }

        // ✅ Events
        const evsRes = await get("/events?limit=3&page=1");
        const evsArr = Array.isArray(evsRes) ? evsRes : evsRes.events || [];

        // sort by date & filter upcoming only
        const upcoming = evsArr
          .filter((ev) => new Date(ev.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);

        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      load();
    }
  }, [authLoading, user, role, get]);

  if (authLoading || loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Welcome Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">
          Welcome back, <b>{user?.name || "User"}</b> 👋
        </Typography>
        <Chip
          label={
            role === "admin"
              ? "Admin"
              : role === "student"
              ? "Student"
              : "Guest"
          }
          color={
            role === "admin"
              ? "error"
              : role === "student"
              ? "primary"
              : "default"
          }
          variant="outlined"
        />
      </Paper>

      {/* Quick Links */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">📚 Resources</Typography>
            <Typography sx={{ mb: 2 }}>
              Access notes, tutorials, and shared study materials.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/resources")}>
              Go to Resources
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">👤 Profile</Typography>
            <Typography sx={{ mb: 2 }}>
              Manage your account information and settings.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/profile")}>
              Go to Profile
            </Button>
          </Paper>
        </Grid>

        {role === "admin" && (
          <>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6">👑 Admin Panel</Typography>
                <Typography sx={{ mb: 2 }}>
                  Manage users, roles, and contact messages.
                </Typography>
                <Button variant="contained" onClick={() => navigate("/admin")}>
                  Go to Admin Panel
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6">📜 Activity Logs</Typography>
                <Typography sx={{ mb: 2 }}>
                  Track user role changes, deletions, and resets.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/admin/logs")}
                >
                  View Logs
                </Button>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Notices + Resources */}
      <Grid container spacing={3}>
        {/* Latest Notices */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6">📢 Latest Notices</Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate("/notices")}
              >
                View All
              </Button>
            </Stack>
            {recentNotices.length > 0 ? (
              recentNotices.map((n) => (
                <Box key={n._id} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1">{n.title}</Typography>
                    {n.pinned && (
                      <Chip label="Pinned" size="small" color="warning" />
                    )}
                    <Chip label={n.audience} size="small" variant="outlined" />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {n.body.length > 140
                      ? n.body.slice(0, 140) + "..."
                      : n.body}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No notices yet.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Resources */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
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
                    <Link
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
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

      {/* Upcoming Events */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">📅 Upcoming Events</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate("/events")}
            >
              View All
            </Button>
          </Stack>

          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((ev) => (
              <Box key={ev._id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{ev.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(ev.date).toLocaleDateString()} @ {ev.location}
                </Typography>
                <Typography variant="body2" noWrap>
                  {ev.description}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No upcoming events yet.</Typography>
          )}
        </Paper>
      </Box>

      {/* Admin: Recent Messages */}
      {role === "admin" && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📩 Recent Messages
            </Typography>
            {recentMessages.length > 0 ? (
              recentMessages.map((m) => (
                <Box key={m._id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    {m.name} ({m.email})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {m.message}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No messages yet.</Typography>
            )}
          </Paper>
        </Box>
      )}

      {/* Admin: Recent Activity Logs */}
      {role === "admin" && (
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">📜 Recent Activity Logs</Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate("/admin/logs")}
              >
                View All
              </Button>
            </Stack>

            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <Box key={log._id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    {log.performedBy?.name || "Unknown User"} → {log.action}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {log.details}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No activity logs yet.</Typography>
            )}
          </Paper>
        </Box>
      )}

      {/* My Resources */}
      {(role === "student" || role === "admin") && (
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">📂 My Resources</Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate("/resources?filter=my")}
              >
                View All
              </Button>
            </Stack>

            {myResources.length > 0 ? (
              myResources.map((r) => (
                <Box key={r._id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{r.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.type} — {r.description || "No description"}
                  </Typography>
                  {r.url && (
                    <Link
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      Open Resource
                    </Link>
                  )}
                </Box>
              ))
            ) : (
              <Typography>You haven’t added any resources yet.</Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}
