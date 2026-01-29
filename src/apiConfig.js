export const IS_PROD = window.location.hostname.includes("vercel.app") || window.location.hostname.includes("netlify.app");

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (IS_PROD ? "https://server-qm14.onrender.com/api" : "http://localhost:5000/api");

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (IS_PROD ? "https://server-qm14.onrender.com" : "http://localhost:5000");
