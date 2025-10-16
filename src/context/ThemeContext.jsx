import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const ThemeModeContext = createContext();

/**
 * 🌗 ThemeModeProvider (Final Stable Version)
 * ✅ Persistent mode (localStorage)
 * ✅ Cinematic Glow Transition
 * ✅ Ambient Sound Feedback
 * ✅ Perfectly Timed Animation
 * ✅ HMR-safe (Vite fast refresh)
 */
export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    return saved ? saved : "light";
  });

  // 🎧 Preload sounds (stored in public/sounds)
  const soundLight = new Audio("/sounds/light-toggle.mp3");
  const soundDark = new Audio("/sounds/dark-toggle.mp3");

  const toggleTheme = () => {
    // 1️⃣ Add glow overlay (dynamic based on mode)
    const overlay = document.createElement("div");
    overlay.className = "theme-glow-overlay";

    if (mode === "light") {
      overlay.style.background = `
        radial-gradient(circle at center,
          rgba(108, 99, 255, 0.35) 0%,
          rgba(255, 51, 102, 0.25) 50%,
          transparent 100%)
      `;
    } else {
      overlay.style.background = `
        radial-gradient(circle at center,
          rgba(176, 148, 255, 0.35) 0%,
          rgba(255, 92, 138, 0.28) 50%,
          transparent 100%)
      `;
    }

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add("fade-out");
      setTimeout(() => overlay.remove(), 800);
    }, 300);

    // 2️⃣ Play sound immediately
    try {
      if (mode === "light") {
        soundDark.volume = 0.3;
        soundDark.play();
      } else {
        soundLight.volume = 0.35;
        soundLight.play();
      }
    } catch (err) {
      // Ignore autoplay block
    }

    // 3️⃣ Delay theme switch slightly for cinematic sync
    setTimeout(() => {
      setMode((prev) => {
        const next = prev === "light" ? "dark" : "light";
        localStorage.setItem("themeMode", next);

        if (next === "dark") {
          document.body.classList.add("dark-mode");
        } else {
          document.body.classList.remove("dark-mode");
        }

        return next;
      });
    }, 180);
  };

  // 🧠 Apply stored mode on mount
  useEffect(() => {
    if (mode === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};
