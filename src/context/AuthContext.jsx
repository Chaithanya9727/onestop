import { createContext, useContext, useState, useEffect } from "react"
import './styles.css'

const AuthContext = createContext()

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState("guest")
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [loading, setLoading] = useState(true)

  // Keep token in localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token)
    else localStorage.removeItem("token")
  }, [token])

  // Load user info from backend
  const loadUser = async () => {
    if (!token) {
      setUser(null)
      setRole("guest")
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await fetch("https://server-hv9f.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Auth check failed")
      const data = await res.json()
      setUser(data)
      setRole(data.role || "guest") // ✅ always use role from backend
    } catch (err) {
      console.error("Auth check failed", err)
      setUser(null)
      setRole("guest")
      setToken("")
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [token])

  // ✅ Logout
  const logout = () => {
    setUser(null)
    setRole("guest")
    setToken("")
    localStorage.clear()
  }

  return (
    <AuthContext.Provider value={{ user, setUser, role, setRole, token, setToken, logout, loading, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => useContext(AuthContext)

// ✅ named exports only
export { AuthProvider, useAuth }
