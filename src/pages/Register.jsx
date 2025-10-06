import { useState } from "react"
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  MenuItem,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import useApi from "../hooks/useApi"
import { useAuth } from "../context/AuthContext"
import '../styles.css'

export default function Register() {
  const navigate = useNavigate()
  const { setUser, setRole, setToken } = useAuth()
  const { post } = useApi()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRegisterRole] = useState("student")
  const [err, setErr] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr("")
    setSuccess("")

    // ✅ Frontend password validation
    if (password.length < 6) {
      setErr("Password must be at least 6 characters long.")
      return
    }

    try {
      const data = await post("/auth/register", {
        name,
        email,
        password,
        role,
      })

      // Update AuthContext
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      })
      setRole(data.role)
      setToken(data.token)

      setSuccess("Registration successful 🎉 Redirecting...")
      setTimeout(() => navigate("/dashboard"), 1500)
    } catch (error) {
      setErr("Registration failed. Try again.")
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Create Account
        </Typography>

        {err && <Alert severity="error">{err}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            helperText="Must be at least 6 characters"
          />

          <TextField
            select
            label="Role"
            value={role}
            onChange={(e) => setRegisterRole(e.target.value)}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="guest">Guest</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          <Button type="submit" variant="contained">
            Register
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
