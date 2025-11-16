// src/components/RecruiterTopbar.jsx
import React, { useEffect, useState } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
  Tooltip,
  Box,
  Badge,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { useToast } from "./ToastProvider.jsx";
import { useSocket } from "../socket.jsx"; // ✅ Correct import path

export default function RecruiterTopbar() {
  const { user, logout } = useAuth();
  const { get, patch } = useApi();
  const { showToast } = useToast();
  const { socket, isConnected } = useSocket(); // ✅ From socket provider
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  const open = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchor);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotifOpen = (event) => setNotifAnchor(event.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const handleSettings = () => {
    handleClose();
    navigate("/rpanel/settings");
  };

  const handleProfile = () => {
    handleClose();
    navigate("/rpanel/overview");
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.orgName?.trim()?.charAt(0)?.toUpperCase() ||
    "R";

  /* =====================================================
     🔔 Fetch Notifications (API)
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
    } catch {
      showToast("Failed to mark notifications", "error");
    }
  };

  /* =====================================================
     ⚡ Real-time Notifications (Socket.io)
  ====================================================== */
  useEffect(() => {
    fetchNotifications();
    if (!socket) return;

    const handleNewNotification = (notif) => {
      console.log("🔔 [Socket Notification]", notif);
      showToast(`${notif.title}: ${notif.message}`, "info");
      setNotifications((prev) => [notif, ...prev]);
      setUnread((u) => u + 1);
    };

    socket.on("notification:new", handleNewNotification);
    return () => socket.off("notification:new", handleNewNotification);
  }, [socket]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      {/* Connection Status */}
      <Tooltip title={isConnected ? "Online" : "Offline"}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: isConnected ? "green" : "gray",
            boxShadow: isConnected
              ? "0 0 10px rgba(0,255,0,0.6)"
              : "0 0 5px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
          }}
        />
      </Tooltip>

      {/* 🔔 Notifications */}
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleNotifOpen}>
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* 📩 Notifications Dropdown */}
      <Menu
        anchorEl={notifAnchor}
        id="notif-menu"
        open={notifOpen}
        onClose={handleNotifClose}
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
            overflowY: "auto",
            backdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer", fontWeight: 600 }}
            onClick={markAllRead}
          >
            Mark all read
          </Typography>
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 2, textAlign: "center" }}
          >
            No notifications yet
          </Typography>
        ) : (
          <List dense disablePadding>
            {notifications.map((n) => (
              <ListItem
                key={n._id}
                sx={{
                  px: 2,
                  py: 1,
                  borderBottom: "1px solid #f0f0f0",
                  bgcolor: n.read ? "transparent" : "rgba(108,99,255,0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(108,99,255,0.08)",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      fontWeight={n.read ? 500 : 700}
                      color={n.read ? "text.primary" : "primary.main"}
                      sx={{ fontSize: 14 }}
                    >
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "normal", fontSize: 13 }}
                    >
                      {n.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>

      {/* 🧑‍💼 Profile Menu */}
      <Tooltip title="Recruiter Menu">
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{ ml: 1 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            src={user?.avatar || ""}
            alt={user?.name || "Recruiter"}
            sx={{
              width: 38,
              height: 38,
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {userInitial}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, scale: 0.95, y: -10 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.15 },
          elevation: 4,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.95)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {user?.name || "Recruiter"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || "recruiter@onestop.com"}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>

        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
