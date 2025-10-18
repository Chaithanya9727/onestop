import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard,
  People,
  Chat,
  ListAlt,
  Logout,
  MailOutline,
  Send,
  Menu,
  ChevronLeft,
} from "@mui/icons-material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 250;
const collapsedWidth = 80;

export default function AdminLayout() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    setCollapsed(isSmallScreen);
  }, [isSmallScreen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const menuItems = [
    { label: "Dashboard", icon: <Dashboard />, path: "/admin" },
    { label: "Users", icon: <People />, path: "/admin/users" },
    { label: "Messages", icon: <Chat />, path: "/admin/messages" },
    { label: "Audit Logs", icon: <ListAlt />, path: "/admin/logs" },
    { label: "Mailbox", icon: <MailOutline />, path: "/admin/mailbox" },
    { label: "Send Mail", icon: <Send />, path: "/admin/send-mail" },
  ];

  const isActive = (path) => location.pathname === path;
  const expanded = hovered || !collapsed;

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <motion.div
        animate={{ width: expanded ? drawerWidth : collapsedWidth }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: "100vh",
          background:
            "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(31,41,55,0.9))",
          backdropFilter: "blur(18px)",
          color: "#fff",
          boxShadow: "6px 0 25px rgba(0,0,0,0.25)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "fixed",
          zIndex: 1200,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: expanded ? "space-between" : "center",
              px: 1,
            }}
          >
            {expanded && (
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  background:
                    "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                OneStop Hub
              </Typography>
            )}
            <Tooltip title="Toggle Sidebar (Ctrl+B)">
              <IconButton onClick={toggleSidebar} sx={{ color: "#fff" }}>
                {expanded ? <ChevronLeft /> : <Menu />}
              </IconButton>
            </Tooltip>
          </Box>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Avatar
                  src={user?.avatar || ""}
                  alt={user?.name}
                  sx={{
                    width: 70,
                    height: 70,
                    mx: "auto",
                    mt: 1,
                    border: "2px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 4px 20px rgba(255,255,255,0.15)",
                  }}
                >
                  {!user?.avatar && user?.name?.charAt(0)}
                </Avatar>
                <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "capitalize",
                  }}
                >
                  {role}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          <Divider
            sx={{
              mt: 2,
              mx: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />
        </Box>

        {/* Menu */}
        <Box sx={{ flexGrow: 1, px: 1 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <Tooltip title={!expanded ? item.label : ""} placement="right">
                  <ListItemButton
                    selected={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                    sx={{
                      my: 0.5,
                      borderRadius: "12px",
                      background: isActive(item.path)
                        ? "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)"
                        : "transparent",
                      boxShadow: isActive(item.path)
                        ? "0 0 15px rgba(236,72,153,0.35)"
                        : "none",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(236,72,153,0.25))",
                        transform: "scale(1.03)",
                        transition: "all 0.25s ease",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "#fff",
                        minWidth: expanded ? "40px" : "0",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {expanded && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: "0.93rem",
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Logout */}
        <Box
          sx={{
            py: 2,
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Tooltip title="Logout" arrow placement="right">
            <IconButton
              onClick={logout}
              sx={{
                color: "#ff4d6d",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                "&:hover": {
                  background: "rgba(255,255,255,0.25)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.25s ease",
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        </Box>
      </motion.div>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          background: "linear-gradient(135deg, #f9f9ff 0%, #eef1ff 100%)",
          minHeight: "100vh",
          ml: expanded ? `${drawerWidth}px` : `${collapsedWidth}px`,
          transition: "margin 0.4s ease",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
