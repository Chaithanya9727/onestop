import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// 🌈 Pages
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Resources from "./pages/Resources.jsx";
import Profile from "./pages/Profile.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Users from "./pages/Users.jsx";
import Messages from "./pages/Messages.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Notices from "./pages/Notices.jsx";
import AdminLogs from "./pages/AdminLogs.jsx";
import Contact from "./pages/Contact.jsx";
import Events from "./pages/Events.jsx";
import Chat from "./pages/Chat.jsx";
import VerifyOtp from "./pages/verifyOtp.jsx";
import OauthSuccess from "./pages/OauthSuccess.jsx";
import AdminMessages from "./pages/AdminMessages.jsx";

// 🧩 Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import PageTransition from "./components/PageTransition.jsx";
import BackgroundGlow from "./components/BackgroundGlow.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";

// ⚙️ WebSocket Provider
import { SocketProvider } from "./socket.jsx";

// 🎨 Theme + Context
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useThemeMode } from "./hooks/useThemeMode.js"; // ✅ dynamic mode hook
import lightTheme from "./theme.js";
import darkTheme from "./themeDark.js";

export default function App() {
  const location = useLocation();
  const { mode } = useThemeMode();

  // 🎨 Apply light/dark MUI theme
  const activeTheme = mode === "dark" ? darkTheme : lightTheme;

  // 💡 Background glow only on aesthetic routes
  const showBackgroundGlow = [
    "/",
    "/login",
    "/register",
    "/verify-otp",
    "/oauth-success",
  ].includes(location.pathname);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <ToastProvider>
        <SocketProvider>
          {/* 🧭 Persistent Navbar with Theme Toggle Inside */}
          <Navbar />

          {/* 🌈 Soft Glow for Auth & Landing Routes */}
          {showBackgroundGlow && <BackgroundGlow />}

          {/* 🎬 Animated Page Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{
                position: "relative",
                zIndex: 2,
                minHeight: "calc(100vh - 64px)",
                paddingBottom: "40px",
              }}
            >
              <PageTransition>
                <Routes location={location} key={location.pathname}>
                  {/* 🌍 Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <Register />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    }
                  />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/oauth-success" element={<OauthSuccess />} />
                  <Route path="/messages" element={<Messages />} />

                  {/* 🔐 Forgot & Reset Password */}
                  <Route
                    path="/forgot-password"
                    element={
                      <GuestRoute>
                        <ForgotPassword />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/reset-password/:token"
                    element={
                      <GuestRoute>
                        <ResetPassword />
                      </GuestRoute>
                    }
                  />

                  {/* 📞 Contact */}
                  <Route path="/contact" element={<Contact />} />

                  {/* 🔒 Authenticated User Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resources"
                    element={
                      <ProtectedRoute>
                        <Resources />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notices"
                    element={
                      <ProtectedRoute>
                        <Notices />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <ProtectedRoute>
                        <Events />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />

                  {/* ⚙️ Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute roleRequired={["admin", "superadmin"]}>
                        <AdminPanel />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute roleRequired={["admin", "superadmin"]}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/messages"
                    element={
                      <ProtectedRoute roleRequired={["admin", "superadmin"]}>
                        <AdminMessages />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/logs"
                    element={
                      <ProtectedRoute roleRequired={["admin", "superadmin"]}>
                        <AdminLogs />
                      </ProtectedRoute>
                    }
                  />

                  {/* 🚫 404 Fallback */}
                  <Route
                    path="*"
                    element={
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "80px",
                          fontSize: "1.4rem",
                          color: "#555",
                        }}
                      >
                        404 — Page Not Found 🚧
                      </div>
                    }
                  />
                </Routes>
              </PageTransition>

              {/* 🌍 Persistent Footer */}
              <Footer />
            </motion.div>
          </AnimatePresence>
        </SocketProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
