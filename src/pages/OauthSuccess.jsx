// src/pages/OauthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function OauthSuccess() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);
      localStorage.setItem("token", token);
      setTimeout(() => navigate("/dashboard"), 1200);
    } else {
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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <CircularProgress color="primary" size={48} />
        </motion.div>

        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
          Authenticating your account...
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          Please wait, redirecting to your dashboard securely.
        </Typography>
      </motion.div>
    </Box>
  );
}
