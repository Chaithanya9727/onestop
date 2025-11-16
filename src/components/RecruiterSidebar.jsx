import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import WorkIcon from "@mui/icons-material/Work";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/rpanel", label: "Overview", icon: <SpaceDashboardIcon />, exact: true },
  { to: "/rpanel/post-job", label: "Post Job", icon: <PostAddIcon /> },
  { to: "/rpanel/jobs", label: "My Jobs", icon: <WorkIcon /> },
  { to: "/rpanel/applications", label: "Applications", icon: <AssignmentIndIcon /> },
  { to: "/rpanel/analytics", label: "Analytics", icon: <InsightsIcon /> },
  { to: "/rpanel/settings", label: "Settings", icon: <SettingsIcon /> },
];

export default function RecruiterSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onToggleMobile,
  widthExpanded = 260,
  widthCollapsed = 80,
}) {
  const { user } = useAuth();
  const isMdUp = useMediaQuery("(min-width:900px)");

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minHeight: 72,
        }}
      >
        <Avatar src={user?.avatar} sx={{ width: 40, height: 40 }}>
          {(user?.name || "R")[0]}
        </Avatar>
        {!collapsed && (
          <Box>
            <Box sx={{ fontWeight: 700 }}>{user?.name || "Recruiter"}</Box>
            <Box sx={{ fontSize: 12, color: "text.secondary" }}>
              {user?.orgName || "Organization"}
            </Box>
          </Box>
        )}
        {isMdUp && (
          <Tooltip title={collapsed ? "Expand" : "Collapse"}>
            <IconButton onClick={onToggleCollapse} sx={{ ml: "auto" }} size="small">
              {collapsed ? <MenuOpenIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Divider />

      <List sx={{ px: 1, flex: 1 }}>
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.exact}
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => onToggleMobile?.()}
          >
            {({ isActive }) => (
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  ...(isActive && {
                    bgcolor: "rgba(108,99,255,0.12)",
                    "& .MuiListItemIcon-root": { color: "#6c63ff" },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{n.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={n.label} />}
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>

      <Box sx={{ p: 2, fontSize: 12, color: "text.secondary" }}>
        © {new Date().getFullYear()} OneStop Hub
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onToggleMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: widthExpanded },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? widthCollapsed : widthExpanded,
          "& .MuiDrawer-paper": {
            width: collapsed ? widthCollapsed : widthExpanded,
            transition: "width .2s ease",
            borderRight: "1px solid rgba(0,0,0,0.06)",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
