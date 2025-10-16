// src/hooks/useThemeMode.js
import { useContext } from "react";
import { ThemeModeContext } from "../context/ThemeContext.jsx";

/**
 * 🎨 useThemeMode Hook
 * Safely accesses current theme mode + toggle function
 * HMR-safe and reusable across the app
 */
export const useThemeMode = () => useContext(ThemeModeContext);
