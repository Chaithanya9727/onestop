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
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Fade,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket.jsx";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { useThemeMode } from "../hooks/useThemeMode.js";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { get } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, connectionStatus } = useSocket();
  const { mode, toggleTheme } = useThemeMode();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarMenu, setAvatarMenu] = useState(null);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const avatarOpen = Boolean(avatarMenu);

  // Load notices/events
  useEffect(() => {
    const loadData = async () => {
      try {
        const n = await get("/notices");
        const e = await get("/events");
        setNotices(Array.isArray(n) ? n.slice(0, 3) : n.notices?.slice(0, 3) || []);
        setEvents(Array.isArray(e) ? e.slice(0, 3) : e.events?.slice(0, 3) || []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    if (user) loadData();
  }, [user, get]);

  // Real-time new messages
  useEffect(() => {
    if (!isConnected) return;
    const handleNewMessage = (data) => {
      setUnreadMessages((prev) => prev + 1);
      if (Notification.permission === "granted") {
        new Notification("📩 New Message", {
          body: `From: ${data?.from?.name || "Someone"}`,
          icon: "/favicon.ico",
        });
      }
    };
    window.addEventListener("socket:newMessage", handleNewMessage);
    return () => window.removeEventListener("socket:newMessage", handleNewMessage);
  }, [isConnected]);

  // Reset unread on chat visit
  useEffect(() => {
    if (location.pathname.includes("/chat") || location.pathname.includes("/admin/messages")) {
      setUnreadMessages(0);
    }
  }, [location.pathname]);

  // Connection toast
  useEffect(() => {
    if (connectionStatus === "connected" || connectionStatus === "connecting") {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  // Avatar Menu handlers
  const handleAvatarClick = (event) => setAvatarMenu(event.currentTarget);
  const handleAvatarClose = () => setAvatarMenu(null);

  const toggleDrawer = (state) => setDrawerOpen(state);
  const handleNavClick = (path) => {
    navigate(path);
    toggleDrawer(false);
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Notices", path: "/notices" },
    { label: "Contact", path: "/contact" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Resources", path: "/resources" },
  ];

  const showManageUsers = role === "admin" || role === "superadmin";
  const roleColor =
    role === "superadmin"
      ? "success"
      : role === "admin"
      ? "warning"
      : role === "candidate"
      ? "primary"
      : "default";

  useEffect(() => {
    if (Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            mode === "dark"
              ? "rgba(20, 20, 40, 0.8)"
              : "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(18px)",
          boxShadow:
            mode === "dark"
              ? "0 6px 25px rgba(120, 90, 255, 0.25)"
              : "0 6px 25px rgba(50, 50, 150, 0.15)",
          borderBottom:
            mode === "dark"
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.08)",
          transition: "all 0.4s ease",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "75px", px: { xs: 2, md: 4 } }}>
          {/* 🌟 Logo */}
          <Typography
            variant="h6"
            fontWeight="bold"
            onClick={() => navigate(user ? "/dashboard" : "/")}
            sx={{
              cursor: "pointer",
              color: mode === "dark" ? "#fff" : "#1e1e2f",
              letterSpacing: 0.4,
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              "&:hover": { textShadow: "0 0 10px rgba(176,148,255,0.6)" },
            }}
          >
            🎓 <span style={{ color: "#6c63ff" }}>OneStop</span>{" "}
            <span style={{ color: mode === "dark" ? "#ffb6ec" : "#f50057" }}>Hub</span>
          </Typography>

          {/* 🖥️ Desktop Navigation */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
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
                      transition: "all 0.3s ease",
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

            {/* 🌗 Theme Toggle */}
            <Tooltip
              title={mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              arrow
            >
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: "#fff",
                  background:
                    mode === "light"
                      ? "linear-gradient(135deg, #6c63ff, #ff3366)"
                      : "linear-gradient(135deg, #b094ff, #ff5c8a)",
                  boxShadow:
                    mode === "light"
                      ? "0 0 10px rgba(108,99,255,0.5)"
                      : "0 0 16px rgba(176,148,255,0.5)",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow:
                      mode === "light"
                        ? "0 0 20px rgba(108,99,255,0.7)"
                        : "0 0 25px rgba(176,148,255,0.7)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </IconButton>
            </Tooltip>

            {user && (
              <>
                {showManageUsers && (
                  <Button
                    variant="contained"
                    onClick={() => navigate("/admin")}
                    sx={{
                      textTransform: "none",
                      borderRadius: "25px",
                      fontWeight: 600,
                      px: 2.5,
                      background: "linear-gradient(135deg, #ffb300, #ff9100)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #ff9100, #ff6f00)",
                      },
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(255,193,7,0.4)",
                    }}
                  >
                    Manage Users
                  </Button>
                )}

                <IconButton color="inherit" onClick={() => navigate("/chat")}>
                  <Badge badgeContent={unreadMessages} color="error" max={99}>
                    <ChatIcon sx={{ color: mode === "dark" ? "#fff" : "#333" }} />
                  </Badge>
                </IconButton>

                <IconButton color="inherit">
                  <Badge
                    badgeContent={(notices.length + events.length) || 0}
                    color="error"
                  >
                    <NotificationsIcon sx={{ color: mode === "dark" ? "#fff" : "#333" }} />
                  </Badge>
                </IconButton>

                {/* 👤 Avatar + Dropdown */}
                <Box sx={{ position: "relative" }}>
                  <Tooltip title={isConnected ? "Online" : "Offline"}>
                    <IconButton onClick={handleAvatarClick}>
                      <Avatar
                        src={user.avatar || ""}
                        alt={user.name}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "2px solid #fff",
                          boxShadow:
                            mode === "dark"
                              ? "0 0 8px rgba(176,148,255,0.6)"
                              : "0 0 6px rgba(108,99,255,0.4)",
                        }}
                      >
                        {!user.avatar && user.name?.charAt(0)}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  {/* ✅ Avatar Dropdown Menu */}
                  <Menu
                    anchorEl={avatarMenu}
                    open={avatarOpen}
                    onClose={handleAvatarClose}
                    TransitionComponent={Fade}
                    PaperProps={{
                      sx: {
                        borderRadius: 2,
                        width: 200,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                        backdropFilter: "blur(12px)",
                        background:
                          mode === "dark"
                            ? "rgba(25,25,35,0.9)"
                            : "rgba(255,255,255,0.95)",
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleAvatarClose();
                        navigate("/profile");
                      }}
                    >
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleAvatarClose();
                        navigate("/dashboard");
                      }}
                    >
                      <DashboardIcon fontSize="small" sx={{ mr: 1 }} /> Dashboard
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleAvatarClose();
                        logout();
                      }}
                    >
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

          {/* 📱 Mobile Drawer */}
          <IconButton
            sx={{
              display: { xs: "flex", md: "none" },
              color: mode === "dark" ? "#fff" : "#333",
            }}
            onClick={() => toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

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
