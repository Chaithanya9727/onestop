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
  ListSubheader,
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
  Dashboard,
  Logout,
  WarningAmber,
  LockReset,
  Inbox,
  Send,
  MarkunreadMailbox,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
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

  // ✅ Reset Password
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
  const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#facc15", "#8b5cf6", "#ec4899"];

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
    <Box sx={{ display: "flex", height: "100%" }}>
      <Box sx={{ flexGrow: 1, p: 4, backgroundColor: "#f5f6fa" }}>
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

        {/* 🧾 Dashboard Content */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[{ title: "Total Users", count: totalUsers, color: "#007bff", icon: <People /> },
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

        {/* ✉️ Quick Access */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6">📥 Mailbox</Typography>
              <Typography color="text.secondary">
                View internal mails sent by admins/superadmins.
              </Typography>
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={() => navigate("mailbox")} // ✅ relative
              >
                Open Mailbox
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6">✉️ Compose Internal Mail</Typography>
              <Typography color="text.secondary">
                Send internal mail to other admins/superadmins.
              </Typography>
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                color="secondary"
                onClick={() => navigate("send-mail")} // ✅ relative
              >
                Compose
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
