// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  SupervisorAccount,
  People,
  School,
  Assignment,
  Mail,
  Dashboard,
  Logout,
  WarningAmber,
  LockReset,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";

export default function AdminPanel() {
  const { role, logout } = useAuth();
  const { get, put, del, post } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [openDialog, setOpenDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });
  const [msg, setMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // ✅ Load users
  const loadUsers = async () => {
    try {
      const data = await get("/users");
      setUsers(data);
    } catch {
      setError("Failed to load users");
    }
  };

  // ✅ Load logs
  const loadLogs = async () => {
    try {
      const data = await get("/users/audit");
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    }
  };

  // Initial load
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([loadUsers(), loadLogs()]);
      } catch (err) {
        console.error("Admin data fetch failed", err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    if (role === "admin" || role === "superadmin") load();
  }, [role]);

  // ✅ Create Admin
  const handleCreateAdmin = async () => {
    setMsg("");
    setErrMsg("");
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password)
      return setErrMsg("All fields are required");

    if (role !== "superadmin")
      return setErrMsg("🚫 Only SuperAdmin can create new admins");

    try {
      await post("/users/create-admin", newAdmin);
      setMsg("✅ Admin created successfully!");
      await loadUsers();
      setNewAdmin({ name: "", email: "", password: "", mobile: "" });
      document.activeElement?.blur();
      setOpenDialog(false);
    } catch (err) {
      console.error("Create admin failed:", err);
      setErrMsg("Failed to create admin ❌");
    }
  };

  // ✅ Role Change
  const handleRoleChange = async (id, newRole) => {
    if (role !== "superadmin")
      return showToast("Only SuperAdmin can change roles 🚫", "error");
    try {
      await put(`/users/${id}/role`, { role: newRole });
      await loadUsers();
      showToast("Role updated successfully ✅", "success");
    } catch {
      showToast("Failed to update role ❌", "error");
    }
  };

  // ✅ Reset Password (Auto-generated + Email sent)
  const handleResetPassword = async (id, email) => {
    if (role !== "superadmin")
      return showToast("Only SuperAdmin can reset passwords 🚫", "error");

    if (!window.confirm(`Reset password for ${email}?`)) return;

    try {
      const res = await put(`/users/${id}/reset-password`);
      await loadUsers();
      showToast(res.message || "Temporary password emailed to user ✅", "success");
    } catch (err) {
      console.error("Reset password failed:", err);
      showToast("Failed to reset password ❌", "error");
    }
  };

  // ✅ Delete User
  const handleDeleteUser = async (id) => {
    if (role !== "superadmin")
      return showToast("Only SuperAdmin can delete users 🚫", "error");
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await del(`/users/${id}`);
      await loadUsers();
      showToast("User deleted successfully ❌", "success");
    } catch {
      showToast("Failed to delete user ❌", "error");
    }
  };

  // 📊 Stats
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalCandidates = users.filter((u) => u.role === "candidate").length;
  const totalLogs = logs.length;

  // 🥧 Pie Chart
  const logSummary = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.keys(logSummary).map((key) => ({
    name: key.replace("_", " "),
    value: logSummary[key],
  }));
  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#22c55e",
    "#facc15",
    "#8b5cf6",
    "#ec4899",
  ];

  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Admin Panel...</Typography>
      </Box>
    );

  if (role !== "admin" && role !== "superadmin")
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          🚫 Access Denied — Admins Only
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* 🧭 Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            backgroundColor: "#0d1b2a",
            color: "white",
            borderRight: "none",
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{ p: 2, textAlign: "center", fontWeight: "bold" }}
        >
          🏫 OneStop Admin
        </Typography>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedMenu === "dashboard"}
              onClick={() => setSelectedMenu("dashboard")}
            >
              <ListItemIcon>
                <Dashboard sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={selectedMenu === "users"}
              onClick={() => setSelectedMenu("users")}
            >
              <ListItemIcon>
                <People sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/admin/messages")}>
              <ListItemIcon>
                <Mail sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Messages" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/admin/logs")}>
              <ListItemIcon>
                <Assignment sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Audit Logs" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon>
                <Logout sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* 🧾 Main Dashboard */}
      <Box
        sx={{
          flexGrow: 1,
          p: 4,
          backgroundColor: "#f5f6fa",
          overflowY: "auto",
        }}
      >
        <Typography variant="h4" gutterBottom>
          👑 {role === "superadmin" ? "SuperAdmin Control Panel" : "Admin Panel"}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {msg && <Alert severity="success">{msg}</Alert>}
        {errMsg && <Alert severity="error">{errMsg}</Alert>}

        {role !== "superadmin" && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <WarningAmber sx={{ mr: 1 }} /> Only SuperAdmin can create or delete
            admins. You have limited privileges.
          </Alert>
        )}

        {/* ================= Dashboard ================= */}
        {selectedMenu === "dashboard" && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { title: "Total Users", count: totalUsers, color: "#007bff", icon: <People /> },
                { title: "Admins", count: totalAdmins, color: "#ff7b00", icon: <SupervisorAccount /> },
                { title: "Candidates", count: totalCandidates, color: "#22c55e", icon: <School /> },
                { title: "Audit Logs", count: totalLogs, color: "#8b5cf6", icon: <Assignment /> },
              ].map((stat, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card
                    sx={{
                      borderRadius: "18px",
                      background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}60)`,
                      boxShadow: `0 8px 25px ${stat.color}40`,
                      textAlign: "center",
                    }}
                  >
                    <CardContent>
                      <Box sx={{ fontSize: 40, color: stat.color }}>{stat.icon}</Box>
                      <Typography variant="h5" fontWeight="bold">
                        {stat.count}
                      </Typography>
                      <Typography variant="subtitle1">{stat.title}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* 🥧 Pie Chart */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                🪶 Audit Log Activity Overview
              </Typography>
              {chartData.length === 0 ? (
                <Typography color="text.secondary">
                  No audit data available yet.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(1)}%`
                      }
                      outerRadius={120}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </>
        )}

        {/* ================= Manage Users ================= */}
        {selectedMenu === "users" && (
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            {role === "superadmin" && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenDialog(true)}
                sx={{ mb: 2 }}
              >
                ➕ Create New Admin
              </Button>
            )}

            {users.length === 0 ? (
              <Typography>No users found.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Name</b></TableCell>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>Role</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          color={
                            u.role === "superadmin"
                              ? "success"
                              : u.role === "admin"
                              ? "warning"
                              : "primary"
                          }
                          size="small"
                        />
                        {role === "superadmin" && (
                          <Select
                            size="small"
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u._id, e.target.value)
                            }
                            sx={{ ml: 1 }}
                          >
                            <MenuItem value="superadmin">SuperAdmin</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="candidate">Candidate</MenuItem>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LockReset />}
                            onClick={() => handleResetPassword(u._id, u.email)}
                          >
                            Reset Password
                          </Button>
                          {role === "superadmin" && (
                            <Button
                              variant="contained"
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(u._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        )}

        {/* ================= Create Admin Dialog ================= */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>➕ Create New Admin</DialogTitle>
          <DialogContent>
            <TextField
              label="Full Name"
              fullWidth
              margin="dense"
              value={newAdmin.name}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, name: e.target.value })
              }
            />
            <TextField
              label="Email"
              fullWidth
              margin="dense"
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, email: e.target.value })
              }
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="dense"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
            />
            <TextField
              label="Mobile Number"
              fullWidth
              margin="dense"
              value={newAdmin.mobile}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, mobile: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateAdmin}
              variant="contained"
              color="primary"
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
