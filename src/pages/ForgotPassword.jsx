import { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
// import "../styles.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // ✅ Local backend URL
  // ✅ Local backend URL
  const API_BASE = `${API_BASE_URL}/auth`;

  // Countdown timer for "Resend OTP"
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // --- SEND OTP ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setMsg(data.message);
      setStep(2);
      setTimer(30);
    } catch (error) {
      setErr(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFY OTP & RESET PASSWORD ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (newPassword !== confirm) {
      return setErr("Passwords do not match ❌");
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyRes = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message);

      // Step 2: Reset Password
      const resetRes = await fetch(`${API_BASE}/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });
      const resetData = await resetRes.json();
      if (!resetRes.ok) throw new Error(resetData.message);

      setMsg("✅ Password reset successful! Redirecting...");
      setTimeout(() => (window.location.href = "/login"), 2500);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RESEND OTP ---
  const handleResend = async () => {
    setMsg("");
    setErr("");
    setTimer(30);
    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg("OTP resent successfully ✅");
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="auth-wrap">
      <Paper className="auth">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🔐 Forgot Password
        </Typography>

        {msg && <Alert severity="success">{msg}</Alert>}
        {err && <Alert severity="error">{err}</Alert>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <TextField
              fullWidth
              label="Enter your registered Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <TextField
              fullWidth
              label="Enter the 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              margin="normal"
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <Button type="button" onClick={handleResend} disabled={timer > 0}>
                {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </Button>
            </Stack>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                "Verify & Reset Password"
              )}
            </Button>
          </form>
        )}
      </Paper>
    </div>
  );
}
