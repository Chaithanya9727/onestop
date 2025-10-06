import { useAuth } from "../context/AuthContext";
import { useCallback } from "react";

const API_BASE = "https://server-hv9f.onrender.com/api";

export default function useApi() {
  const { token } = useAuth();

  const baseHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({})); // parse JSON safely
    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  // GET
  const get = useCallback(
    async (url) => {
      const res = await fetch(API_BASE + url, { headers: baseHeaders });
      return handleResponse(res);
    },
    [token]
  );

  // POST (JSON or FormData)
  const post = useCallback(
    async (url, body, isFormData = false) => {
      const res = await fetch(API_BASE + url, {
        method: "POST",
        headers: isFormData
          ? baseHeaders // ✅ Let browser set multipart boundary automatically
          : { ...baseHeaders, "Content-Type": "application/json" },
        body: isFormData ? body : JSON.stringify(body),
      });
      return handleResponse(res);
    },
    [token]
  );

  // PUT (JSON or FormData)
  const put = useCallback(
    async (url, body, isFormData = false) => {
      const res = await fetch(API_BASE + url, {
        method: "PUT",
        headers: isFormData
          ? baseHeaders // ✅ works with FormData
          : { ...baseHeaders, "Content-Type": "application/json" },
        body: isFormData ? body : JSON.stringify(body),
      });
      return handleResponse(res);
    },
    [token]
  );

  // DELETE (supports body if needed)
  const del = useCallback(
    async (url, body = null) => {
      const res = await fetch(API_BASE + url, {
        method: "DELETE",
        headers: body
          ? { ...baseHeaders, "Content-Type": "application/json" }
          : baseHeaders,
        body: body ? JSON.stringify(body) : null,
      });
      return handleResponse(res);
    },
    [token]
  );

  return { get, post, put, del };
}
