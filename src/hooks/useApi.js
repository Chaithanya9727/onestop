import { useAuth } from "../context/AuthContext";
import { useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function useApi() {
  const { token, logout, refreshUser } = useAuth();

  const baseHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // 🔒 Token expired → force logout
      if (res.status === 401) {
        console.warn("🔒 Token expired or invalid — logging out");
        logout?.();
      }
      throw new Error(data.message || "Request failed");
    }

    // 🔁 If user data changed (mentor approval, etc.), auto-refresh context
    if (data?.user && refreshUser) refreshUser();

    if (import.meta.env.DEV) {
      console.log(`✅ [${res.status}] ${res.url}`, data);
    }

    return data;
  };

  const handleError = (fn) => async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("❌ API Error:", error.message);
      throw error;
    }
  };

  const get = useCallback(
    handleError(async (url) => {
      const res = await fetch(`${API_BASE}${url}`, { headers: baseHeaders });
      return handleResponse(res);
    }),
    [token]
  );

  const post = useCallback(
    handleError(async (url, body, isFormData = false) => {
      const res = await fetch(`${API_BASE}${url}`, {
        method: "POST",
        headers: isFormData
          ? baseHeaders
          : { ...baseHeaders, "Content-Type": "application/json" },
        body: isFormData ? body : JSON.stringify(body),
      });
      return handleResponse(res);
    }),
    [token]
  );

  const put = useCallback(
    handleError(async (url, body, isFormData = false) => {
      const res = await fetch(`${API_BASE}${url}`, {
        method: "PUT",
        headers: isFormData
          ? baseHeaders
          : { ...baseHeaders, "Content-Type": "application/json" },
        body: isFormData ? body : JSON.stringify(body),
      });
      return handleResponse(res);
    }),
    [token]
  );

  const patch = useCallback(
    handleError(async (url, body) => {
      const res = await fetch(`${API_BASE}${url}`, {
        method: "PATCH",
        headers: { ...baseHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return handleResponse(res);
    }),
    [token]
  );

  const del = useCallback(
    handleError(async (url, body = null) => {
      const res = await fetch(`${API_BASE}${url}`, {
        method: "DELETE",
        headers: body
          ? { ...baseHeaders, "Content-Type": "application/json" }
          : baseHeaders,
        body: body ? JSON.stringify(body) : null,
      });
      return handleResponse(res);
    }),
    [token]
  );

  return { get, post, put, patch, del };
}
