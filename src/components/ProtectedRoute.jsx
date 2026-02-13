import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StunningLoader from "./StunningLoader";

export default function ProtectedRoute({
  children,
  roles = [],
  redirectPath = "/dashboard",
}) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <StunningLoader message="Verifying security Clearance..." fullPage={true} />;
  }

  if (!user) return <Navigate to="/login" replace />;

  const normalizedRole = (role || "").toLowerCase();

  if (normalizedRole === "superadmin") return children;

  if (normalizedRole === "recruiter" && location.pathname === "/dashboard") {
    return <Navigate to="/rpanel/overview" replace />;
  }

  if (normalizedRole === "mentor" && location.pathname === "/dashboard") {
    return <Navigate to="/mentor-dashboard" replace />;
  }

  if (roles.length > 0 && !roles.includes(normalizedRole)) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
