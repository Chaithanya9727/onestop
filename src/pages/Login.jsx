import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Google, GitHub } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles.css";

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("https://server-hv9f.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setToken(data.token);
      setMsg("✅ Login successful! Redirecting...");
      if (form.remember) localStorage.setItem("email", form.email);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <Paper className="auth">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🔐 Welcome Back
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
          Login to continue your journey with OneStop Hub 🚀
        </Typography>

        {msg && <Alert severity="success">{msg}</Alert>}
        {err && <Alert severity="error">{err}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            margin="normal"
          />

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
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              control={<Checkbox name="remember" checked={form.remember} onChange={handleChange} />}
              label="Remember Me"
            />
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </Stack>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Divider className="auth-divider">OR</Divider>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" startIcon={<Google />} fullWidth>
            Google Login
          </Button>
          <Button variant="outlined" startIcon={<GitHub />} fullWidth>
            GitHub Login
          </Button>
        </Stack>

        <Stack spacing={1} mt={3} textAlign="center">
          <Typography variant="body2">
            Don’t have an account?{" "}
            <Link to="/register" className="auth-link">
              Create one
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </div>
  );
}
