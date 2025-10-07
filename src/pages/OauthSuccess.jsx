import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function OauthSuccess() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    // Extract ?token=xxxx from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Save to context + localStorage
      setToken(token);
      localStorage.setItem("token", token);

      // ✅ Auto redirect to dashboard/home
      setTimeout(() => navigate("/dashboard"), 1200);
    } else {
      // If token missing → go to login
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [navigate, setToken]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Authenticating your account securely...
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
        Please wait, redirecting to your dashboard.
      </Typography>
    </Box>
  );
}
