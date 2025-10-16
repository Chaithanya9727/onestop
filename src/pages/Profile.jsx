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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Google, GitHub, Email as EmailIcon, Delete, Visibility } from "@mui/icons-material";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { UAParser } from "ua-parser-js";

export default function Profile() {
  const { user, setUser, role, refreshUser } = useAuth();
  const { get, put, post } = useApi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState(role);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // View avatar modal
  const [viewAvatarOpen, setViewAvatarOpen] = useState(false);

  // Login activity
  const [lastLogin, setLastLogin] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  // Verification
  const [openEmailVerify, setOpenEmailVerify] = useState(false);
  const [openPasswordVerify, setOpenPasswordVerify] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Load profile & activity
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
  }, [get]);

  // ✅ Detect Auth Method Badge
  const getAuthMethod = () => {
    if (user?.googleId)
      return { label: "Google", color: "error", icon: <Google fontSize="small" /> };
    if (user?.githubId)
      return { label: "GitHub", color: "default", icon: <GitHub fontSize="small" /> };
    return { label: "Email", color: "primary", icon: <EmailIcon fontSize="small" /> };
  };
  const authMethod = getAuthMethod();

  // ✅ Email OTP
  const sendEmailVerification = async () => {
    setOtpStatus("");
    setOtpLoading(true);
    try {
      const res = await post("/auth/send-verification-otp", { email });
      setOtpStatus(res.message);
      setOpenEmailVerify(true);
    } catch {
      setOtpStatus("Failed to send verification OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    try {
      const res = await post("/auth/verify-verification-otp", { email, otp });
      if (res.success) {
        setOtpStatus("✅ Email verified successfully!");
        setOpenEmailVerify(false);
        handleProfileSave(true);
      } else {
        setOtpStatus("Invalid or expired OTP.");
      }
    } catch {
      setOtpStatus("Verification failed.");
    }
  };

  // ✅ Update Profile
  const handleProfileSave = async (skipVerify = false) => {
    setErr("");
    setSuccess("");
    try {
      if (!skipVerify && email !== user.email) {
        await sendEmailVerification();
        return;
      }

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    handleProfileSave();
  };

  // ✅ Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassErr("");
    setPassMsg("");
    setOpenPasswordVerify(true);
  };

  const handlePasswordVerification = async () => {
    setOtpLoading(true);
    setPassErr("");
    setPassMsg("");
    try {
      const res = await put("/users/me/password", {
        oldPassword,
        newPassword,
      });
      setPassMsg(res.message || "Password updated successfully ✅");
      setOpenPasswordVerify(false);
      setOldPassword("");
      setNewPassword("");
    } catch {
      setPassErr("Password update failed. Please verify credentials.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Avatar Upload
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setErr("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);
      const updated = await put("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(updated);
      await refreshUser();
      setSuccess("Avatar updated ✅");
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch {
      setErr("Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  // ✅ Remove Avatar (from DB)
  const handleRemoveAvatar = async () => {
    try {
      await put("/users/me/avatar", { remove: true });
      setUser({ ...user, avatar: "" });
      setSuccess("Avatar removed successfully ✅");
    } catch {
      setErr("Failed to remove avatar");
    }
  };

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
          <IconButton onClick={() => setViewAvatarOpen(true)}>
            <Avatar
              src={user?.avatar || ""}
              alt={user?.name}
              sx={{ width: 80, height: 80, cursor: "pointer" }}
            />
          </IconButton>

          <Stack spacing={1}>
            <Button
              variant="outlined"
              component="label"
              disabled={avatarUploading}
            >
              {avatarUploading ? "Uploading..." : "Change Avatar"}
              <input type="file" hidden accept="image/*" onChange={handleAvatarSelect} />
            </Button>

            {avatarPreview && (
              <Stack direction="row" spacing={1} alignItems="center">
                <img
                  src={avatarPreview}
                  alt="preview"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ddd",
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAvatarUpload}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? <CircularProgress size={20} /> : "Upload"}
                </Button>
                <IconButton color="error" onClick={handleRemoveAvatar}>
                  <Delete />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Stack>

        {/* Auth Method Badge */}
        <Chip
          icon={authMethod.icon}
          label={`Signed in via ${authMethod.label}`}
          color={authMethod.color}
          variant="outlined"
          sx={{ mb: 3, fontWeight: 500 }}
        />

        {/* Profile form */}
        <Box
          component="form"
          onSubmit={handleUpdateProfile}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
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
              <MenuItem value="candidate">candidate</MenuItem>
              <MenuItem value="guest">Guest</MenuItem>
            </TextField>
          )}

          <Button type="submit" variant="contained">
            Save Changes
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Password Change */}
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

        {/* Login Activity */}
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

      {/* View Avatar Dialog */}
      <Dialog open={viewAvatarOpen} onClose={() => setViewAvatarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Profile Picture</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <img
            src={user?.avatar || ""}
            alt="profile"
            style={{
              width: "100%",
              borderRadius: "10px",
              objectFit: "cover",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewAvatarOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Email Verification */}
      <Dialog open={openEmailVerify} onClose={() => setOpenEmailVerify(false)}>
        <DialogTitle>Email Verification</DialogTitle>
        <DialogContent>
          <Typography>Enter OTP sent to your new email:</Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{ mt: 2 }}
          />
          {otpStatus && (
            <Typography sx={{ mt: 1 }} color={otpStatus.includes("✅") ? "green" : "error"}>
              {otpStatus}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={verifyEmailOtp} disabled={otpLoading}>
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Password Dialog */}
      <Dialog open={openPasswordVerify} onClose={() => setOpenPasswordVerify(false)}>
        <DialogTitle>Confirm Password Change</DialogTitle>
        <DialogContent>
          <Typography>Confirm to change your password securely.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordVerification} color="secondary" disabled={otpLoading}>
            {otpLoading ? <CircularProgress size={20} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
