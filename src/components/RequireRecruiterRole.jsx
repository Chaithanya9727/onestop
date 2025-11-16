import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireRecruiterRole({ children }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a loader
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;

  const role = (user?.role || "").toLowerCase();
  if (role !== "recruiter") return <Navigate to="/" replace />;

  // Optional: enforce recruiter approval
  const status = (user?.status || "approved").toLowerCase();
  if (status !== "approved") return <Navigate to="/notifications" replace />;

  return children;
}
