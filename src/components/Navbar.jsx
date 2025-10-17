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
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../socket.jsx";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import SchoolIcon from "@mui/icons-material/School";
import VerifiedIcon from "@mui/icons-material/Verified";
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
  const { connectionStatus } = useSocket();
  const { mode, toggleTheme } = useThemeMode();

  const [avatarMenu, setAvatarMenu] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const avatarOpen = Boolean(avatarMenu);

  // 🔄 Load notices/events
  useEffect(() => {
    const loadData = async () => {
      try {
        await get("/notices");
        await get("/events");
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    if (user) loadData();
  }, [user, get]);

  // 🌐 Connection Toast
  useEffect(() => {
    if (["connected", "connecting"].includes(connectionStatus)) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  const handleAvatarClick = (event) => setAvatarMenu(event.currentTarget);
  const handleAvatarClose = () => setAvatarMenu(null);

  /* =====================================================
     🎯 Dynamic Menu Items based on Role
  ====================================================== */
  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Notices", path: "/notices" },
    { label: "Resources", path: "/resources" },
    { label: "Contact", path: "/contact" },
  ];

  // Candidate extras
  if (role === "candidate") {
    menuItems.push({ label: "Become a Mentor", path: "/become-mentor" });
  }

  // Mentor extras
  if (role === "mentor") {
    menuItems.push({ label: "Mentor Dashboard", path: "/mentor-dashboard" });
  }

  // Admin/SuperAdmin extras
  if (role === "admin" || role === "superadmin") {
    menuItems.push({ label: "Admin Panel", path: "/admin" });
    menuItems.push({
      label: "Mentor Approvals",
      path: "/admin/mentor-approvals",
    });
  }

  const isActive = (path) => location.pathname === path;
  const roleColor =
    role === "superadmin"
      ? "success"
      : role === "admin"
      ? "warning"
      : role === "mentor"
      ? "secondary"
      : "primary";

  /* =====================================================
     🧠 Determine Dashboard Destination
  ====================================================== */
  const getDashboardPath = () => {
    if (role === "mentor") return "/mentor-dashboard";
    return "/dashboard"; // candidate, admin, superadmin
  };

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
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: "75px",
            px: { xs: 2, md: 4 },
          }}
        >
          {/* 🌟 Logo */}
          <Typography
            variant="h6"
            fontWeight="bold"
            onClick={() => navigate(user ? getDashboardPath() : "/")}
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
            <span style={{ color: mode === "dark" ? "#ffb6ec" : "#f50057" }}>
              Hub
            </span>
          </Typography>

          {/* 🖥️ Desktop Navigation */}
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
                  whileHover={{ scale: 1.05 }}
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

            {/* 🌗 Theme Toggle */}
            <Tooltip
              title={
                mode === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
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
                  "&:hover": { transform: "scale(1.1)" },
                  transition: "all 0.3s ease",
                }}
              >
                {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </IconButton>
            </Tooltip>

            {/* 👤 User Controls */}
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
                <IconButton color="inherit" onClick={() => navigate("/chat")}>
                  <Badge badgeContent={unreadMessages} color="error" max={99}>
                    <ChatIcon
                      sx={{ color: mode === "dark" ? "#fff" : "#333" }}
                    />
                  </Badge>
                </IconButton>

                <Box>
                  <Tooltip title="Account Menu">
                    <IconButton onClick={handleAvatarClick}>
                      <Avatar
                        src={user.avatar || ""}
                        alt={user.name}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "2px solid #fff",
                        }}
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
                        navigate(getDashboardPath());
                      }}
                    >
                      <DashboardIcon fontSize="small" sx={{ mr: 1 }} /> Dashboard
                    </MenuItem>

                    {role === "candidate" && (
                      <MenuItem
                        onClick={() => {
                          handleAvatarClose();
                          navigate("/become-mentor");
                        }}
                      >
                        <VerifiedIcon fontSize="small" sx={{ mr: 1 }} /> Become a
                        Mentor
                      </MenuItem>
                    )}

                    {role === "mentor" && (
                      <MenuItem
                        onClick={() => {
                          handleAvatarClose();
                          navigate("/mentor-dashboard");
                        }}
                      >
                        <SchoolIcon fontSize="small" sx={{ mr: 1 }} /> Mentor Dashboard
                      </MenuItem>
                    )}

                    {(role === "admin" || role === "superadmin") && (
                      <>
                        <MenuItem
                          onClick={() => {
                            handleAvatarClose();
                            navigate("/admin");
                          }}
                        >
                          🧭 Admin Panel
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleAvatarClose();
                            navigate("/admin/mentor-approvals");
                          }}
                        >
                          <VerifiedIcon fontSize="small" sx={{ mr: 1 }} /> Mentor
                          Approvals
                        </MenuItem>
                      </>
                    )}

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
                  sx={{
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                />
              </>
            )}
          </Stack>

          {/* 📱 Mobile Menu Icon */}
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

/* 🌈 Auth Buttons */
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
