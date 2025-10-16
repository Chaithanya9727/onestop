import { createContext, useContext, useState, useEffect } from "react";


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  // 🧠 Sync token with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // 🔑 Load user info (with flexible response handling)
  const loadUser = async () => {
    if (!token) {
      setUser(null);
      setRole("guest");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Auth check failed");
      const data = await res.json();

      // Handle possible nested user object
      const userData = data.user || data;
      setUser(userData);
      setRole(userData.role?.toLowerCase() || "guest");
    } catch (err) {
      console.error("⚠️ Auth check failed:", err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  // 🚪 Logout (clear session)
  const logout = () => {
    setUser(null);
    setRole("guest");
    setToken("");
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        token,
        setToken,
        logout,
        loading,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
