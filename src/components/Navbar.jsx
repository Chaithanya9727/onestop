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
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import "../styles.css";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { get, del } = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const open = Boolean(anchorEl);

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

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const clearAll = async () => {
    try {
      await del("/notifications/clear");
      setNotices([]);
      setEvents([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
    handleClose();
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Notices", path: "/notices" },
    { label: "Contact", path: "/contact" },
  ];

  const toggleDrawer = (state) => setDrawerOpen(state);

  const handleNavClick = (path) => {
    navigate(path);
    toggleDrawer(false); // ✅ Auto-close menu on mobile
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(90deg, #1e3c72, #2a5298)",
          px: { xs: 2, md: 3 },
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* 🎓 Logo / Brand */}
          <Typography
            variant="h6"
            fontWeight="bold"
            component="button"
            onClick={() => navigate(user ? "/dashboard" : "/")}
            style={{
              textDecoration: "none",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            🎓 OneStop
          </Typography>

          {/* ☰ Mobile Toggle Button */}
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, color: "white" }}
            onClick={() => toggleDrawer(true)}
          >
            <MenuIcon fontSize="large" />
          </IconButton>

          {/* 🖥️ Desktop Menu */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {menuItems.map((item) => (
              <Box key={item.path} sx={{ position: "relative" }}>
                <Button
                  color="inherit"
                  component={Link}
                  to={item.path}
                  sx={{
                    textTransform: "none",
                    fontWeight: isActive(item.path) ? "bold" : "normal",
                  }}
                >
                  {item.label}
                </Button>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeNav"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: "#ffeb3b",
                      borderRadius: "2px",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Box>
            ))}

            {/* 🧍 Authenticated User Section */}
            {user ? (
              <>
                <Button color="inherit" component={Link} to="/dashboard">
                  Dashboard
                </Button>
                <Button color="inherit" component={Link} to="/resources">
                  Resources
                </Button>

                {/* 💬 Chat */}
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/chat"
                  sx={{
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Badge badgeContent={unreadMessages} color="error" max={99}>
                    <ChatIcon />
                  </Badge>
                </IconButton>

                <Button color="inherit" component={Link} to="/profile">
                  Profile
                </Button>

                {role === "admin" && (
                  <Button
                    color="warning"
                    variant="contained"
                    component={Link}
                    to="/admin"
                    sx={{
                      borderRadius: "20px",
                      fontWeight: "bold",
                      textTransform: "none",
                    }}
                  >
                    Manage Users
                  </Button>
                )}

                {/* 🔔 Notifications */}
                <IconButton color="inherit" onClick={handleOpen}>
                  <Badge
                    badgeContent={(notices.length + events.length) || 0}
                    color="error"
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ px: 2, py: 1 }}
                  >
                    <Typography fontWeight="bold">🔔 Notifications</Typography>
                    <Button size="small" color="error" onClick={clearAll}>
                      Clear All
                    </Button>
                  </Stack>
                  <Divider />
                  {notices.length === 0 && events.length === 0 ? (
                    <MenuItem disabled>No new updates</MenuItem>
                  ) : (
                    <>
                      {notices.map((n) => (
                        <MenuItem
                          key={n._id}
                          onClick={() => {
                            handleClose();
                            navigate("/notices");
                          }}
                        >
                          📢 {n.title}
                        </MenuItem>
                      ))}
                      {events.map((ev) => (
                        <MenuItem
                          key={ev._id}
                          onClick={() => {
                            handleClose();
                            navigate("/events");
                          }}
                        >
                          📅 {ev.title} (
                          {new Date(ev.date).toLocaleDateString()})
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Menu>

                {/* 🧍 User Info */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={user.avatar || ""}
                    alt={user.name}
                    sx={{
                      width: 35,
                      height: 35,
                      border: "2px solid white",
                    }}
                  >
                    {!user.avatar && user.name?.charAt(0)}
                  </Avatar>
                  <Chip
                    label={role}
                    size="small"
                    color={
                      role === "admin"
                        ? "error"
                        : role === "student"
                        ? "primary"
                        : "default"
                    }
                    sx={{
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  />
                </Box>

                <Button
                  color="error"
                  variant="outlined"
                  onClick={logout}
                  sx={{ borderRadius: "20px", fontWeight: "bold" }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button
                  color="secondary"
                  variant="contained"
                  component={Link}
                  to="/register"
                  sx={{
                    borderRadius: "20px",
                    fontWeight: "bold",
                    background: "linear-gradient(90deg, #ff4081, #f50057)",
                    "&:hover": {
                      background: "linear-gradient(90deg, #f50057, #c51162)",
                    },
                  }}
                >
                  Register
                </Button>
                <Button color="inherit" component={Link} to="/forgot-password">
                  Forgot Password?
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* 📱 MOBILE DRAWER MENU */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Box sx={{ width: 250 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 2, py: 1 }}
          >
            <Typography variant="h6" fontWeight="bold">
              OneStop Menu
            </Typography>
            <IconButton onClick={() => toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNavClick(item.path)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}

            {user ? (
              <>
                <ListItemButton onClick={() => handleNavClick("/dashboard")}>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton onClick={() => handleNavClick("/resources")}>
                  <ListItemText primary="Resources" />
                </ListItemButton>
                <ListItemButton onClick={() => handleNavClick("/chat")}>
                  <ListItemText primary="Chat" />
                </ListItemButton>
                <ListItemButton onClick={() => handleNavClick("/profile")}>
                  <ListItemText primary="Profile" />
                </ListItemButton>
                {role === "admin" && (
                  <ListItemButton onClick={() => handleNavClick("/admin")}>
                    <ListItemText primary="Manage Users" />
                  </ListItemButton>
                )}
                <Divider />
                <ListItemButton onClick={logout}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton onClick={() => handleNavClick("/login")}>
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton onClick={() => handleNavClick("/register")}>
                  <ListItemText primary="Register" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleNavClick("/forgot-password")}
                >
                  <ListItemText primary="Forgot Password?" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
