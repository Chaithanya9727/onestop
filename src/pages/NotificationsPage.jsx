import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  Tooltip,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import { useSocket } from "../socket.jsx";
import useApi from "../hooks/useApi";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import RefreshIcon from "@mui/icons-material/Refresh";
import CampaignIcon from "@mui/icons-material/Campaign";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

export default function NotificationsPage() {
  const { get, patch } = useApi();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Fetch from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await get("/notifications");
      const list = res?.notifications || res?.data?.notifications || res?.data || [];
      setNotifications(list);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read (bulk endpoint)
  const markAllRead = async () => {
    try {
      await patch("/notifications/mark-all/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  // Mark one as read
  const markOneRead = async (id) => {
    try {
      // Fallback: mark individually if you also have /:id/read
      await patch(`/notifications/${id}/read`).catch(() => Promise.resolve());
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error updating notification:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Realtime socket listener
  useEffect(() => {
    if (socket) {
      const handler = (data) => {
        setNotifications((prev) => [
          {
            _id: `temp_${Date.now()}`,
            title: data?.title || "Notification",
            message: data?.message || "",
            read: false,
            createdAt: data?.time || new Date().toISOString(),
          },
          ...prev,
        ]);
      };
      socket.on("notification", handler);
      return () => socket.off("notification", handler);
    }
  }, [socket]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [filter, notifications]);

  const getIcon = (type) => {
    switch (type) {
      case "admin":
        return <AdminPanelSettingsIcon color="primary" />;
      case "recruiter":
        return <WorkIcon color="success" />;
      case "candidate":
        return <PersonIcon color="info" />;
      case "job":
        return <CampaignIcon color="secondary" />;
      default:
        return <SystemUpdateAltIcon color="action" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography
          variant="h5"
          fontWeight={800}
          mb={3}
          sx={{
            background: "linear-gradient(90deg, #6c63ff, #ff4081)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🔔 Notifications Center
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          mb={3}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="All"
              color={filter === "all" ? "primary" : "default"}
              onClick={() => setFilter("all")}
              sx={{ cursor: "pointer", fontWeight: 600 }}
            />
            <Chip
              label="Unread"
              color={filter === "unread" ? "secondary" : "default"}
              onClick={() => setFilter("unread")}
              sx={{ cursor: "pointer", fontWeight: 600 }}
            />
            <Chip
              label="Read"
              color={filter === "read" ? "success" : "default"}
              onClick={() => setFilter("read")}
              sx={{ cursor: "pointer", fontWeight: 600 }}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchNotifications}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark All as Read">
              <IconButton onClick={markAllRead}>
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Typography
            textAlign="center"
            color="text.secondary"
            mt={6}
            fontSize="1.1rem"
          >
            No notifications found.
          </Typography>
        ) : (
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              p: 2,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95))",
              backdropFilter: "blur(8px)",
            }}
          >
            {filteredNotifications.map((n) => (
              <Box
                key={n._id || Math.random()}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2,
                  backgroundColor: n.read ? "#f5f6fa" : "#edf2ff",
                  boxShadow: n.read
                    ? "none"
                    : "0 0 12px rgba(108,99,255,0.2)",
                  transition: "all 0.2s ease",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {getIcon(n.type)}
                  <Box>
                    <Typography fontWeight={700}>{n.title}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      {n.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>

                {!n.read && (
                  <Tooltip title="Mark as Read">
                    <IconButton
                      color="primary"
                      onClick={() => markOneRead(n._id)}
                    >
                      <MarkEmailReadIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Paper>
        )}

        {!loading && notifications.length > 0 && (
          <Box textAlign="center" mt={3}>
            <Button
              variant="outlined"
              startIcon={<NotificationsActiveIcon />}
              onClick={markAllRead}
            >
              Mark All as Read
            </Button>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}
