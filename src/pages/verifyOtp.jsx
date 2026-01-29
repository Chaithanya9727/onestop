import { useState } from "react";
import { TextField, Button, Paper, Typography, Alert } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
// import "../styles.css";

export default function VerifyOtp() {
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg("Password reset successful ✅");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Verify OTP
      </Typography>
      {msg && <Alert severity="success">{msg}</Alert>}
      {err && <Alert severity="error">{err}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
          Reset Password
        </Button>
      </form>
    </Paper>
  );
}
