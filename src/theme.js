// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6c63ff",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ff3366",
      contrastText: "#fff",
    },
    background: {
      default: "#f4f6ff",
      paper: "rgba(255,255,255,0.75)",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#4b4b4b",
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
      letterSpacing: "0.3px",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: "10px 24px",
          background: "linear-gradient(135deg, #6c63ff, #9a6aff)",
          color: "#fff",
          boxShadow: "0 4px 12px rgba(108,99,255,0.35)",
          transition:
            "transform 0.25s ease, box-shadow 0.25s ease, background 0.4s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #7a6eff, #b191ff)",
            boxShadow: "0 8px 20px rgba(108,99,255,0.45)",
            transform: "translateY(-3px)",
          },
          "&:active": {
            transform: "scale(0.97)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #ff4081, #f50057)",
          boxShadow: "0 4px 12px rgba(255,64,129,0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #f50057, #c51162)",
            boxShadow: "0 8px 22px rgba(255,64,129,0.4)",
          },
        },
        outlined: {
          border: "1px solid rgba(108,99,255,0.5)",
          color: "#6c63ff",
          background: "rgba(108,99,255,0.05)",
          "&:hover": {
            background: "rgba(108,99,255,0.1)",
            boxShadow: "0 0 10px rgba(108,99,255,0.25)",
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "0 6px 20px rgba(108,99,255,0.1)",
        },
      },
    },
  },
});

export default theme;
