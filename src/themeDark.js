// src/themeDark.js
import { createTheme } from "@mui/material/styles";

const themeDark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#b094ff",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ff5c8a",
      contrastText: "#fff",
    },
    background: {
      default: "#0e0e15",
      paper: "rgba(30,30,45,0.75)",
    },
    text: {
      primary: "#f5f5ff",
      secondary: "#c7c7d6",
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: [
      "Poppins",
      "Inter",
      "SF Pro Display",
      "system-ui",
      "sans-serif",
    ].join(","),
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: "10px 24px",
          background: "linear-gradient(135deg, #8c7bff, #b693ff)",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(176,148,255,0.35)",
          transition:
            "transform 0.25s ease, box-shadow 0.25s ease, background 0.4s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            background: "linear-gradient(135deg, #a08cff, #d1b6ff)",
            boxShadow: "0 8px 24px rgba(176,148,255,0.5)",
          },
          "&:active": {
            transform: "scale(0.97)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #ff5c8a, #ff7aa8)",
          boxShadow: "0 4px 14px rgba(255,92,138,0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #ff7aa8, #ffa3c5)",
            boxShadow: "0 8px 22px rgba(255,92,138,0.45)",
          },
        },
        outlined: {
          border: "1px solid rgba(176,148,255,0.4)",
          color: "#b094ff",
          background: "rgba(176,148,255,0.05)",
          "&:hover": {
            background: "rgba(176,148,255,0.1)",
            boxShadow: "0 0 10px rgba(176,148,255,0.25)",
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          background: "rgba(25,25,40,0.7)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
        },
      },
    },
  },
});

export default themeDark;
