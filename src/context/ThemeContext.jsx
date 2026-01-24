import React, { createContext, useEffect, useState, useMemo } from "react";

export const ThemeModeContext = createContext();

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const body = document.body;
    // Tailwind usually looks for 'dark' on the html or body tag if darkMode is 'class'
    // Our tailwind config has darkMode: ['class', 'body.dark-mode']
    if (mode === "dark") {
      body.classList.add("dark-mode", "dark");
    } else {
      body.classList.remove("dark-mode", "dark");
    }
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};
