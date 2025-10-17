// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function ProtectedRoute({
  children,
  roles = [],
  redirectPath = "/dashboard",
}) {
  const { user, role, loading } = useAuth();

  // ⏳ Wait for auth to finish
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #1e1e2f, #292946)",
          color: "white",
        }}
      >
        <CircularProgress size={36} sx={{ color: "#6c63ff", mb: 2 }} />
        <Typography variant="body1">Verifying access...</Typography>
      </Box>
    );
  }

  // 🚫 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🧠 Normalize role
  const normalizedRole = (role || "").toLowerCase();

  // ✅ Superadmin override (can access everything)
  if (normalizedRole === "superadmin") {
    return children;
  }

  // 🔒 Role-based access control
  if (roles.length > 0 && !roles.includes(normalizedRole)) {
    console.warn(`Access denied for ${normalizedRole}`);
    return <Navigate to={redirectPath} replace />;
  }

  // ✅ Authorized
  return children;
}
