import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import { Google, GitHub } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    college: "",
    year: "",
    branch: "",
    mobile: "",
    internship: "No",
    agree: false,
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!form.agree) return setErr("You must agree to the terms.");
    if (form.password !== form.confirm)
      return setErr("Passwords do not match.");

    try {
      const res = await fetch("https://server-hv9f.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      setMsg("Account created successfully ✅");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="auth-page">
      <Paper className="auth-form" elevation={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🧾 Create Account
        </Typography>

        {err && <Alert severity="error">{err}</Alert>}
        {msg && <Alert severity="success">{msg}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required margin="normal" />
          <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} required margin="normal" />
          <TextField select fullWidth label="College / University" name="college" value={form.college} onChange={handleChange} required margin="normal">
            <MenuItem value="NIT Warangal">NIT Warangal</MenuItem>
            <MenuItem value="IIT Hyderabad">IIT Hyderabad</MenuItem>
            <MenuItem value="SR University">SR University</MenuItem>
          </TextField>
          <TextField select fullWidth label="Year of Study" name="year" value={form.year} onChange={handleChange} required margin="normal">
            <MenuItem value="1st Year">1st Year</MenuItem>
            <MenuItem value="2nd Year">2nd Year</MenuItem>
            <MenuItem value="3rd Year">3rd Year</MenuItem>
            <MenuItem value="4th Year">4th Year</MenuItem>
          </TextField>
          <TextField select fullWidth label="Branch" name="branch" value={form.branch} onChange={handleChange} required margin="normal">
            <MenuItem value="CSE">CSE</MenuItem>
            <MenuItem value="ECE">ECE</MenuItem>
            <MenuItem value="EEE">EEE</MenuItem>
            <MenuItem value="Mechanical">Mechanical</MenuItem>
          </TextField>
          <TextField fullWidth label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} required margin="normal" />
          <TextField select fullWidth label="Internship Status" name="internship" value={form.internship} onChange={handleChange} required margin="normal">
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </TextField>
          <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} required margin="normal" />
          <TextField fullWidth label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handleChange} required margin="normal" />

          <FormControlLabel
            control={<Checkbox name="agree" checked={form.agree} onChange={handleChange} />}
            label="I Agree to the Terms & Conditions"
          />

          <Button fullWidth variant="contained" type="submit" sx={{ mt: 1 }}>
            Create Account
          </Button>
        </form>

        <Divider className="auth-divider">OR</Divider>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            startIcon={<Google />}
            fullWidth
            onClick={() => (window.location.href = "https://server-hv9f.onrender.com/api/auth/google")}
          >
            Google Sign Up
          </Button>
          <Button
            variant="outlined"
            startIcon={<GitHub />}
            fullWidth
            onClick={() => (window.location.href = "https://server-hv9f.onrender.com/api/auth/github")}
          >
            GitHub Sign Up
          </Button>
        </Stack>

        <Stack spacing={1} mt={3} textAlign="center">
          <Typography variant="body2">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </div>
  );
}
