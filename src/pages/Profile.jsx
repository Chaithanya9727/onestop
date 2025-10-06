import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  MenuItem,
  Divider,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { UAParser } from "ua-parser-js";
import '../styles.css'


export default function Profile() {
  const { user, setUser, role, refreshUser } = useAuth();
  const { get, put } = useApi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState(role);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  // avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);

  // activity tracking
  const [lastLogin, setLastLogin] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  // Load current profile + login activity
  useEffect(() => {
    const load = async () => {
      try {
        const data = await get("/auth/me");
        setName(data.name || "");
        setEmail(data.email || "");
        setNewRole(data.role || "guest");
      } catch {
        setErr("Failed to load profile");
      }

      try {
        const act = await get("/useractivity/me/logins");
        setLastLogin(act.lastLogin);
        setLoginHistory(act.loginHistory || []);
      } catch (err) {
        console.error("Failed to load login history", err);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    try {
      const body = { name, email };
      if (role === "admin" && newRole) body.role = newRole;

      const updated = await put("/users/me", body);
      setUser(updated);
      setSuccess("Profile updated successfully ✅");

      await refreshUser();
    } catch {
      setErr("Update failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassErr("");
    setPassMsg("");
    try {
      const res = await put("/users/me/password", {
        oldPassword,
        newPassword,
      });
      setPassMsg(res.message);
      setOldPassword("");
      setNewPassword("");
    } catch (e) {
      setPassErr(
        "Password update failed: " +
          (e.response?.data?.message || "Unknown error")
      );
    }
  };

  // ✅ Upload avatar and instantly update Navbar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarUploading(true);
    setErr("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const updated = await put("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(updated); // 🔥 updates AuthContext → Navbar re-renders
      await refreshUser();
      setSuccess("Avatar updated ✅");
    } catch (err) {
      console.error("Avatar upload failed", err);
      setErr("Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  // ✅ Helper: Format User Agent
  const formatUserAgent = (uaString) => {
    if (!uaString) return "Unknown device";
    const parser = new UAParser(uaString);
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";
    return `${browser} on ${os}`;
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Paper sx={{ p: 4, width: 600 }}>
        <Typography variant="h5" gutterBottom>
          My Profile
        </Typography>

        {err && <Alert severity="error">{err}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* Avatar Section */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar
            src={user?.avatar || ""}
            alt={user?.name}
            sx={{ width: 70, height: 70 }}
          />
          <Button
            variant="outlined"
            component="label"
            disabled={avatarUploading}
          >
            {avatarUploading ? "Uploading..." : "Change Avatar"}
            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
          </Button>
        </Stack>

        {/* Profile update form */}
        <Box
          component="form"
          onSubmit={handleUpdateProfile}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {role === "admin" && (
            <TextField
              select
              label="Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="guest">Guest</MenuItem>
            </TextField>
          )}

          <Button type="submit" variant="contained">
            Save Changes
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Change Password section */}
        <Typography variant="h6">Change Password</Typography>
        {passErr && <Alert severity="error">{passErr}</Alert>}
        {passMsg && <Alert severity="success">{passMsg}</Alert>}

        <Box
          component="form"
          onSubmit={handleChangePassword}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            label="Old Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="secondary">
            Update Password
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* ✅ Login Activity Section */}
        <Typography variant="h6" gutterBottom>
          Login Activity
        </Typography>
        {lastLogin && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Last Login: {new Date(lastLogin).toLocaleString()}
          </Typography>
        )}
        {loginHistory.length > 0 ? (
          <List dense>
            {loginHistory.map((log, idx) => (
              <ListItem key={idx} divider>
                <ListItemText
                  primary={`${new Date(log.at).toLocaleString()} ${
                    log.location ? ` — ${log.location}` : ""
                  }`}
                  secondary={`IP: ${log.ip || "unknown"} | Device: ${formatUserAgent(
                    log.userAgent
                  )}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No login history available.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
