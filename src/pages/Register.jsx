import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BackgroundGlow from "../components/BackgroundGlow.jsx";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Divider,
  Stack,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, GitHub, Google, Email } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // ✅ Auto-login after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      setToken(token);
      navigate("/dashboard");
    }
  }, [location.search]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (name === "email") {
      setEmailValid(validateEmail(value));
      setEmailVerified(false);
      setOtpSent(false);
    }
  };

  const handleSendOtp = async () => {
    if (!emailValid) return setErr("Please enter a valid email address.");
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setMsg("✅ Verification OTP sent to your email. Please check your inbox.");
      setOtpSent(true);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setErr("Please enter the OTP sent to your email.");
    setVerifying(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");
      setMsg("✅ Email verified successfully!");
      setOtpSent(false);
      setEmailVerified(true);
    } catch (error) {
      setErr(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (form.password !== form.confirmPassword)
      return setErr("Passwords do not match!");
    if (!form.agree) return setErr("Please accept the terms and conditions.");
    if (!emailValid) return setErr("Please enter a valid email address.");
    if (!emailVerified)
      return setErr("Please verify your email before creating an account.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setMsg("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef2ff, #f7f8ff)",
        padding: "30px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackgroundGlow />
      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        <CardContent>
          <Typography variant="h4" textAlign="center" fontWeight={700} gutterBottom>
            ✨ Create Your Account
          </Typography>
          <Typography textAlign="center" color="text.secondary" mb={3}>
            Join the <b>OneStop Hub</b> community 🌟
          </Typography>

          {msg && <Typography color="green" textAlign="center">{msg}</Typography>}
          {err && <Typography color="red" textAlign="center">{err}</Typography>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              margin="normal"
              required
            />

            {/* Email + OTP */}
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                margin="normal"
                required
                error={form.email && !emailValid}
                helperText={
                  form.email && !emailValid
                    ? "Enter a valid email"
                    : emailVerified
                    ? "✅ Verified"
                    : ""
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Email color={emailVerified ? "success" : "disabled"} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendOtp}
                disabled={!emailValid || loading || emailVerified}
                sx={{ whiteSpace: "nowrap", mt: 1 }}
              >
                {emailVerified ? "Verified" : "Send OTP"}
              </Button>
            </Box>

            {otpSent && (
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                />
                <Button variant="outlined" onClick={handleVerifyOtp} disabled={verifying}>
                  {verifying ? "Verifying..." : "Verify"}
                </Button>
              </Box>
            )}

            {/* Password Fields */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
            />

            <FormControlLabel
              control={
                <Checkbox name="agree" checked={form.agree} onChange={handleChange} />
              }
              label="I agree to the Terms & Privacy Policy"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1.3,
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea, #764ba2)",
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={() => handleOAuth("google")}
            >
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHub />}
              onClick={() => handleOAuth("github")}
            >
              Sign up with GitHub
            </Button>
          </Stack>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#667eea", fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.section>
  );
}
