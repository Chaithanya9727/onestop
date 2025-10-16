import { useState } from "react"
import { TextField, Button, Paper, Typography, Alert } from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"


export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg("")
    setErr("")
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMsg(data.message)
      setTimeout(() => navigate("/login"), 2000)
    } catch (error) {
      setErr(error.message)
    }
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" gutterBottom>Reset Password</Typography>
      {msg && <Alert severity="success">{msg}</Alert>}
      {err && <Alert severity="error">{err}</Alert>}
      <form onSubmit={handleSubmit}>
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
  )
}
