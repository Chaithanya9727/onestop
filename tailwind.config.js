/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', 'body.dark-mode'], 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. FONTS
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      // 2. COLORS
      colors: {
        surface: {
          glow: 'rgba(255, 255, 255, 0.65)',
          'glow-dark': 'rgba(15, 23, 42, 0.75)',
        },
        border: {
          soft: 'rgba(99, 102, 241, 0.25)',
          'soft-dark': 'rgba(148, 163, 184, 0.25)',
        },
        text: {
          primary: '#0f172a',
          secondary: 'rgba(15, 23, 42, 0.7)',
          'dark-primary': '#e2e8f0',
        },
        // Unstop Brand Colors
        unstop: {
          primary: '#1C4980', // Dark Navy
          lighter: '#2B5F9E', // Hover state
          accent: '#0056D2',  // Bright Blue
          gold: '#FFC107',    // Accents
        }
      },
      // 3. BACKGROUND IMAGES (This fixes the error)
      backgroundImage: {
        'light-gradient': 'radial-gradient(circle at top, #e0e7ff, #fdf2ff 45%, #f5f5ff)',
        'dark-gradient': 'radial-gradient(circle at 20% 20%, #1f2937, #0f172a 55%, #020617)',
        'accent-gradient': 'linear-gradient(120deg, #6366f1, #ec4899)',
      },
      // 4. SHADOWS & BLUR
      boxShadow: {
        'soft': '0 20px 60px rgba(15, 23, 42, 0.15)',
        'soft-dark': '0 25px 60px rgba(15, 15, 35, 0.55)',
        'glow': '0 12px 30px rgba(99, 102, 241, 0.25)',
      },
      backdropBlur: {
        'xs': '20px',
        'xl': '28px',
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
}