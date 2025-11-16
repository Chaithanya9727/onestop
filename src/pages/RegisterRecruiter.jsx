import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Stack,
  Box,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Business, Phone } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import BackgroundGlow from "../components/BackgroundGlow";

export default function RegisterRecruiter() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orgName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (form.password !== form.confirmPassword)
      return setErr("Passwords do not match!");
    if (!form.agree)
      return setErr("Please accept the Terms & Privacy Policy.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setMsg("✅ Recruiter registration successful! Awaiting Superadmin approval.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f4ff, #fafaff)",
        padding: "40px",
      }}
    >
      <BackgroundGlow />
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight={700}
            sx={{
              background: "linear-gradient(90deg,#667eea,#764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            🏢 Recruiter Registration
          </Typography>
          <Typography textAlign="center" color="text.secondary" mb={3}>
            Host events, hire talent, and access candidate community.
          </Typography>

          {msg && <Typography color="green" textAlign="center">{msg}</Typography>}
          {err && <Typography color="red" textAlign="center">{err}</Typography>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Organization Name"
              name="orgName"
              value={form.orgName}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Business color="disabled" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Official Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Email color="disabled" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Phone color="disabled" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              margin="normal"
              required
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
              margin="normal"
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                />
              }
              label="I agree to the Terms & Privacy Policy"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                py: 1.3,
                fontWeight: 600,
                mt: 1,
                background: "linear-gradient(135deg, #6c63ff, #ff3366)",
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Register as Recruiter"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Box textAlign="center">
            <Typography variant="body2">
              Want to apply as a candidate?{" "}
              <Link to="/register" style={{ color: "#6c63ff", fontWeight: 600 }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.section>
  );
}
