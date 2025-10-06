import { useState, useEffect } from "react"
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Link,
} from "@mui/material"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import useApi from "../hooks/useApi"
import { useAuth } from "../context/AuthContext"
import '../styles.css'

export default function Login() {
  const navigate = useNavigate()
  const { user, setUser, setRole, setToken } = useAuth()
  const { post } = useApi()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔒 If already logged in → redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      const data = await post("/auth/login", { email, password })

      // ✅ Save auth info
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data))

      setUser(data)
      setRole(data.role)
      setToken(data.token)

      navigate("/dashboard")
    } catch (error) {
      setErr(error.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        {err && <Alert severity="error">{err}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Box>

        {/* Forgot Password Link */}
        <Typography sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/forgot-password">
            Forgot Password?
          </Link>
        </Typography>

        {/* Register link */}
        <Typography sx={{ mt: 2 }}>
          Don’t have an account?{" "}
          <Link component={RouterLink} to="/register">
            Register here
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}
