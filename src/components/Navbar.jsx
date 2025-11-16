import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Stack,
  Chip,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Snackbar,
  Alert,
  Tooltip,
  Fade,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket.jsx";
import { useThemeMode } from "../hooks/useThemeMode.js";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import VisibilityIcon from "@mui/icons-material/Visibility";

/* =====================================================
   🌐 Navbar Component
===================================================== */
export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { get, patch } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const { connectionStatus, socket } = useSocket();
  const { mode, toggleTheme } = useThemeMode();

  // ======= Menus & UI States =======
  const [avatarMenu, setAvatarMenu] = useState(null);
  const [eventMenu, setEventMenu] = useState(null);
  const [adminMenu, setAdminMenu] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const unreadNotifCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const avatarOpen = Boolean(avatarMenu);
  const eventOpen = Boolean(eventMenu);
  const adminOpen = Boolean(adminMenu);
  const notifOpen = Boolean(notifAnchor);

  /* =====================================================
     🔄 Preload Notices & Events
  ====================================================== */
  useEffect(() => {
    const preload = async () => {
      try {
        await get("/notices");
        await get("/events");
      } catch (err) {
        console.error("Preload failed:", err);
      }
    };
    if (user) preload();
  }, [user, get]);

  /* =====================================================
     🔔 Notifications Fetch & Socket Sync
  ====================================================== */
  const loadNotifications = async () => {
    try {
      const res = await get("/notifications");
      const list = res?.notifications || res?.data?.notifications || res?.data || [];
      setNotifications(list.slice(0, 15));
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit("registerUser", user._id);
    loadNotifications();

    const handler = (payload) => {
      setNotifications((prev) => [
        {
          _id: `temp_${Date.now()}`,
          title: payload?.title || "Notification",
          message: payload?.message || "",
          read: false,
          createdAt: payload?.createdAt || new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 15));
    };

    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, [socket, user?._id]);

  const markAllRead = async () => {
    try {
      await patch("/notifications/mark-all/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  /* =====================================================
     🌐 Socket Connection Toast
  ====================================================== */
  useEffect(() => {
    if (["connected", "connecting"].includes(connectionStatus)) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(t);
    }
  }, [connectionStatus]);

  /* =====================================================
     🧭 Menu Handlers
  ====================================================== */
  const handleAvatarClick = (e) => setAvatarMenu(e.currentTarget);
  const handleAvatarClose = () => setAvatarMenu(null);
  const handleEventMenu = (e) => setEventMenu(e.currentTarget);
  const closeEventMenu = () => setEventMenu(null);
  const handleAdminMenu = (e) => setAdminMenu(e.currentTarget);
  const closeAdminMenu = () => setAdminMenu(null);
  const openNotifMenu = (e) => setNotifAnchor(e.currentTarget);
  const closeNotifMenu = () => setNotifAnchor(null);

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Notices", path: "/notices" },
    { label: "Resources", path: "/resources" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;
  const roleColor =
    role === "superadmin"
      ? "success"
      : role === "admin"
      ? "warning"
      : role === "mentor"
      ? "secondary"
      : "primary";

  const getDashboardPath = () =>
    role === "mentor" ? "/mentor-dashboard" : "/dashboard";

  /* =====================================================
     🧱 Render
  ====================================================== */
  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            mode === "dark" ? "rgba(25,25,40,0.85)" : "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          borderBottom:
            mode === "dark"
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.1)",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.08), 0 0 40px rgba(108,99,255,0.05)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: "78px",
            px: { xs: 2, md: 4 },
          }}
        >
          {/* 🌟 Brand */}
          <Typography
            variant="h6"
            fontWeight="bold"
            onClick={() => navigate(user ? getDashboardPath() : "/")}
            sx={{
              cursor: "pointer",
              color: mode === "dark" ? "#fff" : "#1e1e2f",
              letterSpacing: 0.5,
              fontSize: "1.55rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              "&:hover": { textShadow: "0 0 12px rgba(176,148,255,0.7)" },
            }}
          >
            🎓 <span style={{ color: "#6c63ff" }}>OneStop</span>{" "}
            <span style={{ color: mode === "dark" ? "#ffb6ec" : "#f50057" }}>
              Hub
            </span>
          </Typography>

          {/* 🖥️ Menu */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    component={Link}
                    to={item.path}
                    sx={{
                      textTransform: "none",
                      fontWeight: active ? 700 : 500,
                      color: active
                        ? "#fff"
                        : mode === "dark"
                        ? "#d1caff"
                        : "#333",
                      background: active
                        ? "linear-gradient(135deg, #6c63ff, #ff4081)"
                        : "transparent",
                      px: 2.5,
                      py: 1,
                      borderRadius: "30px",
                      "&:hover": {
                        background: active
                          ? "linear-gradient(135deg, #7a6aff, #ff5b95)"
                          : "rgba(108,99,255,0.08)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              );
            })}

            {/* Events Dropdown */}
            <Button
              endIcon={<ChevronDown size={16} />}
              onClick={handleEventMenu}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: mode === "dark" ? "#fff" : "#222",
              }}
            >
              Events
            </Button>
            <Menu
              anchorEl={eventMenu}
              open={eventOpen}
              onClose={closeEventMenu}
              TransitionComponent={Fade}
            >
              <MenuItem onClick={() => navigate("/events")}>
                📅 View All Events
              </MenuItem>
              {(role === "admin" ||
                role === "superadmin" ||
                role === "mentor") && (
                <>
                  <MenuItem onClick={() => navigate("/admin/events")}>
                    📊 Manage Events
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/admin/create-event")}>
                    ➕ Create Event
                  </MenuItem>
                </>
              )}
              <MenuItem onClick={() => navigate("/events/my/registrations")}>
                🎟 My Registrations
              </MenuItem>
            </Menu>

            {/* Mentor Hub */}
            {(role === "candidate" || role === "mentor") && (
              <Button
                component={Link}
                to={
                  role === "mentor" ? "/mentor-dashboard" : "/apply-for-mentor"
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: mode === "dark" ? "#fff" : "#222",
                }}
              >
                Mentor Hub
              </Button>
            )}

            {/* Admin Menu */}
            {(role === "admin" || role === "superadmin") && (
              <>
                <Button
                  endIcon={<ChevronDown size={16} />}
                  onClick={handleAdminMenu}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: mode === "dark" ? "#fff" : "#222",
                  }}
                >
                  Admin Panel
                </Button>
                <Menu
                  anchorEl={adminMenu}
                  open={adminOpen}
                  onClose={closeAdminMenu}
                  TransitionComponent={Fade}
                >
                  <MenuItem onClick={() => navigate("/admin")}>
                    🧭 Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/admin/logs")}>
                    📜 Activity Logs
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/admin/metrics")}>
                    📈 Metrics
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      closeAdminMenu();
                      navigate("/admin/recruiter-approvals");
                    }}
                  >
                    🧾 Recruiter Approvals
                  </MenuItem>
                  <Divider />
                  <Typography
                    sx={{
                      px: 2,
                      py: 0.5,
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      color: "text.secondary",
                    }}
                  >
                    🧑‍🏫 Mentor Management
                  </Typography>
                  <MenuItem onClick={() => navigate("/admin/mentor-approvals")}>
                    ✅ Mentor Approvals
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Theme Toggle */}
            <Tooltip title={mode === "light" ? "Dark Mode" : "Light Mode"} arrow>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: "#fff",
                  background:
                    mode === "light"
                      ? "linear-gradient(135deg, #6c63ff, #ff3366)"
                      : "linear-gradient(135deg, #b094ff, #ff5c8a)",
                  "&:hover": { transform: "scale(1.1)" },
                  transition: "all 0.3s ease",
                }}
              >
                {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </IconButton>
            </Tooltip>

            {/* ==================== */}
            {/* 👤 Authenticated Menu */}
            {/* ==================== */}
            {!user ? (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  sx={authButtonStyle("#00c6ff", "#0072ff")}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  sx={authButtonStyle("#f093fb", "#f5576c")}
                >
                  Signup
                </Button>
              </>
            ) : (
              <>
                {/* 🔔 Notification Dropdown */}
                <Tooltip title="Notifications">
                  <IconButton onClick={openNotifMenu}>
                    <Badge
                      color="error"
                      badgeContent={
                        unreadNotifCount > 99 ? "99+" : unreadNotifCount
                      }
                      invisible={unreadNotifCount === 0}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* 💬 Chat */}
                <IconButton onClick={() => navigate("/chat")}>
                  <Badge badgeContent={unreadMessages} color="error" max={99}>
                    <ChatIcon
                      sx={{ color: mode === "dark" ? "#fff" : "#333" }}
                    />
                  </Badge>
                </IconButton>

                {/* 👤 Avatar Menu */}
                <Box>
                  <Tooltip title="Account Menu">
                    <IconButton onClick={handleAvatarClick}>
                      <Avatar
                        src={user.avatar || ""}
                        alt={user.name}
                        sx={{ width: 40, height: 40, border: "2px solid #fff" }}
                      >
                        {!user.avatar && user.name?.charAt(0)}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={avatarMenu}
                    open={avatarOpen}
                    onClose={handleAvatarClose}
                    TransitionComponent={Fade}
                  >
                    <MenuItem onClick={() => navigate("/profile")}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile
                    </MenuItem>
                    <MenuItem onClick={() => navigate(getDashboardPath())}>
                      <DashboardIcon fontSize="small" sx={{ mr: 1 }} /> Dashboard
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => logout()}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
                    </MenuItem>
                  </Menu>
                </Box>

                <Chip
                  label={role}
                  size="small"
                  color={roleColor}
                  sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                />
              </>
            )}
          </Stack>

          {/* 📱 Mobile Menu */}
          <IconButton
            sx={{
              display: { xs: "flex", md: "none" },
              color: mode === "dark" ? "#fff" : "#333",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 🔔 Notifications Dropdown */}
      <Menu
        anchorEl={notifAnchor}
        open={notifOpen}
        onClose={closeNotifMenu}
        PaperProps={{
          elevation: 4,
          sx: { width: 380, borderRadius: 3, p: 1 },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1.5, py: 1 }}
        >
          <Typography variant="subtitle1" fontWeight={800}>
            Notifications
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Mark all read">
              <IconButton size="small" onClick={markAllRead}>
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View all">
              <IconButton
                size="small"
                onClick={() => {
                  closeNotifMenu();
                  navigate("/notifications");
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, color: "text.secondary" }}>No notifications yet.</Box>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n._id}
              sx={{
                alignItems: "flex-start",
                borderRadius: 2,
                my: 0.5,
                backgroundColor: n.read
                  ? "transparent"
                  : "rgba(108,99,255,0.06)",
              }}
              onClick={() => navigate("/notifications")}
            >
              <ListItemIcon>
                <NotificationsIcon
                  fontSize="small"
                  color={n.read ? "disabled" : "primary"}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography fontWeight={700} variant="body2">
                    {n.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {n.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block", mt: 0.25 }}
                    >
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>

      {/* 🌐 Connection Toast */}
      <Snackbar
        open={showToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={2500}
        onClose={() => setShowToast(false)}
      >
        <Alert
          severity={
            connectionStatus === "connected"
              ? "success"
              : connectionStatus === "connecting"
              ? "info"
              : "error"
          }
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: "bold" }}
        >
          {connectionStatus === "connected"
            ? "✅ Connected to OneStop Hub"
            : connectionStatus === "connecting"
            ? "🔄 Reconnecting..."
            : "⚠️ Connection lost"}
        </Alert>
      </Snackbar>
    </>
  );
}

/* =====================================================
   🎨 Auth Button Styling
===================================================== */
const authButtonStyle = (from, to) => ({
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  py: 1,
  borderRadius: "25px",
  background: `linear-gradient(135deg, ${from}, ${to})`,
  color: "#fff",
  boxShadow: `0 4px 14px ${from}33`,
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: `0 6px 18px ${from}55`,
  },
});
