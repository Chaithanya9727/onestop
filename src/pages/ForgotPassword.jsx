import { useState } from "react"
import { TextField, Button, Paper, Typography, Alert } from "@mui/material"
import '../styles.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg("")
    setErr("")
    try {
      const res = await fetch("https://server-hv9f.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMsg(data.message)
    } catch (error) {
      setErr(error.message)
    }
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" gutterBottom>Forgot Password</Typography>
      {msg && <Alert severity="success">{msg}</Alert>}
      {err && <Alert severity="error">{err}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
          Send Reset Link
        </Button>
      </form>
    </Paper>
  )
}
