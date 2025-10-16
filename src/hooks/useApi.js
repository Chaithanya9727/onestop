import { useAuth } from "../context/AuthContext";
import { useCallback } from "react";

const API_BASE = "http://localhost:5000/api";

export default function useApi() {
  const { token } = useAuth();

  const baseHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  // GET
  const get = useCallback(
    async (url) => {
      const res = await fetch(`${API_BASE}${url}`, { headers: baseHeaders });
      return handleResponse(res);
    },
    [token]
  );

  // POST
  const post = useCallback(
    async (url, body, isFormData = false) => {
      const res = await fetch(`${API_BASE}${url}`, {
        method: "POST",
        headers: isFormData
          ? baseHeaders
          : { ...baseHeaders, "Content-Type": "application/json" },
        body: isFormData ? body : JSON.stringify(body),
      });
      return handleResponse(res);
    },
    [token]
  );

  // PUT
  const put = useCallback(
    async (url, body, isFormData = false) => {
      const res = await fetch(`${API_BASE}${url}`, {
        method: "PUT",
        headers: isFormData
          ? baseHeaders
          : { ...baseHeaders, "Content-Type": "application/json" },
        body: isFormData ? body : JSON.stringify(body),
      });
      return handleResponse(res);
    },
    [token]
  );

  // DELETE  ✅ now supports optional JSON body
  const del = useCallback(
    async (url, body = null) => {
      const res = await fetch(`${API_BASE}${url}`, {
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
