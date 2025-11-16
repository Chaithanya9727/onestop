// src/components/RecruiterNotifications.jsx
import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemText,
  Box,
  CircularProgress,
  Tooltip,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider.jsx";
import { useSocket } from "../socket.jsx"; // ✅ Real-time socket context

export default function RecruiterNotifications() {
  const { get, patch } = useApi();
  const { showToast } = useToast();
  const { socket } = useSocket();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  const open = Boolean(anchorEl);

  /* =====================================================
     📥 Fetch notifications
  ====================================================== */
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await get("/api/notifications");
      const data = Array.isArray(res?.notifications)
        ? res.notifications
        : [];
      setNotifications(data);
      setUnread(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      showToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🧠 Mark all as read
  ====================================================== */
  const markAllRead = async () => {
    try {
      await patch("/api/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      showToast("All notifications marked as read", "success");
    } catch (err) {
      showToast("Failed to mark notifications", "error");
    }
  };

  /* =====================================================
     ⚡ Real-time Socket Notifications
  ====================================================== */
  useEffect(() => {
    fetchNotifications();

    if (!socket) return;
    const handleNewNotification = (notif) => {
      console.log("🔔 [Socket Notification]", notif);
      showToast(`${notif.title}: ${notif.message}`, "info");

      setNotifications((prev) => [
        { ...notif, _id: notif._id || Date.now(), read: false },
        ...prev,
      ]);
      setUnread((u) => u + 1);
    };

    socket.on("notification:new", handleNewNotification);
    return () => socket.off("notification:new", handleNewNotification);
  }, [socket]);

  /* =====================================================
     🧭 Handlers
  ====================================================== */
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };
  const handleClose = () => setAnchorEl(null);

  /* =====================================================
     🧩 Render
  ====================================================== */
  return (
    <>
      {/* 🔔 Notification Bell */}
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleOpen}
          aria-controls={open ? "notifications-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          color="inherit"
        >
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* 📬 Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        id="notifications-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, scale: 0.95, y: -10 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.15 },
          elevation: 4,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 320,
            maxHeight: 400,
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            overflowY: "auto",
            backdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.95)",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.1)",
              borderRadius: "4px",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* 🔹 Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button
              onClick={markAllRead}
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "primary.main",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* 🔁 Loading / Empty / Notifications */}
        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box textAlign="center" py={3}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n._id}
              onClick={handleClose}
              sx={{
                whiteSpace: "normal",
                alignItems: "flex-start",
                py: 1.2,
                borderLeft: n.read
                  ? "4px solid transparent"
                  : "4px solid #6c63ff",
                backgroundColor: n.read
                  ? "transparent"
                  : "rgba(108,99,255,0.05)",
                "&:hover": { bgcolor: "rgba(108,99,255,0.08)" },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle2"
                    fontWeight={n.read ? 400 : 600}
                    color={n.read ? "text.primary" : "primary.main"}
                  >
                    {n.title || "Notification"}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.3 }}
                  >
                    {n.message || "No message provided"}
                  </Typography>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
