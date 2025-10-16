import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
} from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"


const drawerWidth = 220

export default function DashboardLayout({ children }) {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const menu = [
    { label: "Resources", path: "/resources", roles: ["candidate", "admin", "guest"] },
    { label: "Profile", path: "/profile", roles: ["candidate", "admin"] },
    { label: "Admin Panel", path: "/admin", roles: ["admin"] },
  ]

  const filteredMenu = menu.filter((m) => !m.roles || m.roles.includes(role))

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            🎓 OneStop
          </Typography>
          {user && (
            <Typography
              variant="body1"
              sx={{ cursor: "pointer" }}
              onClick={() => {
                logout()
                navigate("/login")
              }}
            >
              Logout
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            mt: 8,
          },
        }}
      >
        <Toolbar />
        <List>
          {filteredMenu.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Page Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          mt: 8,
          ml: `${drawerWidth}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
