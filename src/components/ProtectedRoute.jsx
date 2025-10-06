import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import '../styles.css'

export default function ProtectedRoute({ children, roles }) {
  const { user, role, loading } = useAuth()

  // ⏳ Show loading while checking auth (avoid flicker)
  if (loading) {
    return <div>Loading...</div>
  }

  // 🚫 Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 🔒 Role-based protection (accepts array of roles)
  if (roles && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  // ✅ Access granted
  return children
}
