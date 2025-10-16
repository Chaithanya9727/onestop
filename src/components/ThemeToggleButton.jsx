// src/components/ThemeToggleButton.jsx
import React from "react";
import { motion } from "framer-motion";
import { Tooltip, IconButton } from "@mui/material";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "../hooks/useThemeMode.js"; // ✅ Correct import

/**
 * 🌗 Floating Theme Toggle Button
 * - Cinematic switch between light/dark mode
 * - Glowing aura + Framer Motion animation
 * - Integrated with ThemeContext (sound + glow + persistence)
 */
export default function ThemeToggleButton() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 999,
      }}
    >
      <Tooltip
        title={mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        arrow
        placement="left"
      >
        <IconButton
          onClick={toggleTheme}
          sx={{
            background:
              mode === "light"
                ? "linear-gradient(135deg, #6c63ff, #ff3366)"
                : "linear-gradient(135deg, #b094ff, #ff5c8a)",
            color: "#fff",
            boxShadow:
              mode === "light"
                ? "0 0 15px rgba(108, 99, 255, 0.45)"
                : "0 0 18px rgba(176, 148, 255, 0.6)",
            borderRadius: "50%",
            padding: "12px",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow:
                mode === "light"
                  ? "0 0 25px rgba(108, 99, 255, 0.6)"
                  : "0 0 28px rgba(176, 148, 255, 0.8)",
            },
          }}
        >
          <motion.div
            key={mode}
            initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {mode === "light" ? (
              <Moon size={22} strokeWidth={2.3} />
            ) : (
              <Sun size={22} strokeWidth={2.3} />
            )}
          </motion.div>
        </IconButton>
      </Tooltip>
    </motion.div>
  );
}
