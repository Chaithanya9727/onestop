import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  // 🔁 Keep token synced with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // 🔑 Load current user data
  const loadUser = async () => {
    if (!token) {
      setUser(null);
      setRole("guest");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Auth check failed");

      const data = await res.json();
      const userData = data.user || data;

      setUser(userData);
      setRole(userData.role?.toLowerCase() || "guest");
      console.log("✅ Auth Loaded:", userData.role);
    } catch (err) {
      console.error("⚠️ Auth load error:", err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  // 🚪 Logout
  const logout = () => {
    setUser(null);
    setRole("guest");
    setToken("");
    localStorage.removeItem("token");
  };

  const isMentorApproved = user?.role === "mentor" && user?.mentorApproved;

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
        isMentorApproved,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
