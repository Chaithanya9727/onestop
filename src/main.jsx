// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AnimatePresence } from "framer-motion";

import App from "./App";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeModeProvider } from "./context/ThemeContext.jsx";
import { useThemeMode } from "./hooks/useThemeMode.js";
import lightTheme from "./theme.js";
import darkTheme from "./themeDark.js";
import "./App.css";

// ✅ Componentized version for HMR compatibility
function ThemedApp() {
  const { mode } = useThemeMode();
  const activeTheme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <AuthProvider>
        <AnimatePresence mode="wait">
          <App />
        </AnimatePresence>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ✅ Ensure only a single ReactDOM.createRoot call
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeModeProvider>
        <ThemedApp />
      </ThemeModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
