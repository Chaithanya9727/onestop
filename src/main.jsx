import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import App from "./App";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeModeProvider } from "./context/ThemeContext.jsx";

import "./App.css";

function AppWrapper() {
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <App />
      </AnimatePresence>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeModeProvider>
        <AppWrapper />
      </ThemeModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
