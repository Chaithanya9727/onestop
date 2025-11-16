import React, { useEffect, useState } from "react";
import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Tooltip,
  Fab,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { motion, AnimatePresence } from "framer-motion";
import RecruiterTopbar from "../components/RecruiterTopbar.jsx";
import RecruiterNotifications from "../components/RecruiterNotifications.jsx";
import { useToast } from "../components/ToastProvider.jsx";

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 78;

const navItems = [
  { to: "/rpanel/overview", label: "Overview", icon: <DashboardIcon /> },
  { to: "/rpanel/jobs", label: "Jobs", icon: <WorkOutlineIcon /> },
  { to: "/rpanel/applications", label: "Applications", icon: <AssignmentIndIcon /> },
  { to: "/rpanel/analytics", label: "Analytics", icon: <BarChartIcon /> },
  { to: "/rpanel/settings", label: "Settings", icon: <SettingsIcon /> },
];

export default function RecruiterLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const toggleCollapse = () => setCollapsed((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const drawerWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  // 🔔 Toast notifications from socket events
  useEffect(() => {
    const handleNotification = (e) => {
      const { title, message } = e.detail || {};
      showToast(`${title || "New Notification"} — ${message || ""}`, "info");
    };
    window.addEventListener("socket:notification", handleNotification);
    return () => window.removeEventListener("socket:notification", handleNotification);
  }, [showToast]);

  // 🧭 Sidebar
  const SidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, rgba(108,99,255,0.1) 0%, rgba(255,64,129,0.08) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          px: collapsed ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            fontSize: collapsed ? "1rem" : "1.25rem",
            background: "linear-gradient(90deg,#6c63ff,#ff4081)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: "all 0.25s ease",
          }}
        >
          {collapsed ? "RP" : "Recruiter Panel"}
        </Typography>

        <Tooltip title={collapsed ? "Expand" : "Collapse"}>
          <IconButton size="small" onClick={toggleCollapse} sx={{ color: "#6c63ff" }}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Links */}
      <List sx={{ flexGrow: 1, mt: 1 }}>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to);
          return (
            <motion.div
              key={item.to}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
            >
              <ListItemButton
                component={NavLink}
                to={item.to}
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.6,
                  py: 1.3,
                  px: collapsed ? 1.5 : 2,
                  color: isActive ? theme.palette.primary.main : "text.secondary",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(108,99,255,0.15), rgba(255,64,129,0.15))"
                    : "transparent",
                  "&:hover": {
                    background: "rgba(108,99,255,0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: "center",
                    color: isActive ? theme.palette.primary.main : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.95rem",
                    }}
                  />
                )}
              </ListItemButton>
            </motion.div>
          );
        })}
      </List>

      <Divider sx={{ my: 1, opacity: 0.4 }} />
      <Box
        sx={{
          textAlign: "center",
          py: 1.5,
          color: "text.secondary",
          fontSize: "0.75rem",
        }}
      >
        © {new Date().getFullYear()} Recruiter Panel
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f8fc" }}>
      {/* ===== AppBar ===== */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          color: "text.primary",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleMobile}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              background: "linear-gradient(90deg,#6c63ff,#ff4081)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Recruiter Dashboard
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications + Profile */}
          <RecruiterNotifications />
          <RecruiterTopbar />
        </Toolbar>
      </AppBar>

      {/* ===== Sidebar ===== */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          transition: "width 0.25s ease",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0,0,0,0.05)",
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(16px)",
            overflowX: "hidden",
          },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* ===== Mobile Sidebar ===== */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_EXPANDED,
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(18px)",
          },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* ===== Main Content ===== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: { xs: 0, md: `${drawerWidth}px` },
          pt: "72px",
          transition: "padding-left .25s ease",
          minHeight: "100vh",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Outlet />
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* 🌟 Floating Add Job Button */}
        <Tooltip title="Post New Job">
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => navigate("/rpanel/post-job")}
            sx={{
              position: "fixed",
              bottom: 30,
              right: 30,
              boxShadow: "0 6px 18px rgba(108,99,255,0.3)",
              background: "linear-gradient(135deg, #6c63ff, #ff4081)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a52e0, #e23370)",
              },
              zIndex: 1200,
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );
}
