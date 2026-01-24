import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "lucide-react";

export default function ProtectedRoute({
  children,
  roles = [],
  redirectPath = "/dashboard",
}) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <Loader size={36} className="animate-spin text-indigo-500 mb-4" />
        <p className="font-medium animate-pulse">Verifying access...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const normalizedRole = (role || "").toLowerCase();

  if (normalizedRole === "superadmin") return children;

  if (normalizedRole === "recruiter" && location.pathname === "/dashboard") {
    return <Navigate to="/rpanel/overview" replace />;
  }

  if (roles.length > 0 && !roles.includes(normalizedRole)) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
