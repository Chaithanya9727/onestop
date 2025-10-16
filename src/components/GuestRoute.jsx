import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function GuestRoute({ children }) {
  const { user } = useAuth();

  // If already logged in → redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}