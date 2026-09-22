import axios from "axios";

// Axios instance for future CI/CD API calls.
// Auth calls use /auth/* which are proxied to the backend.
export const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Returns true when the backend is simply unreachable (no server running).
const OFFLINE_CODES = new Set([
  "ERR_NETWORK",
  "ECONNREFUSED",
  "ERR_CONNECTION_REFUSED",
  "ETIMEDOUT",
  "ECONNABORTED",
  "ERR_EMPTY_RESPONSE",
]);

export function isNetworkError(error) {
  if (error?.response) return false;
  return (
    OFFLINE_CODES.has(error?.code) ||
    error?.message === "Network Error" ||
    OFFLINE_CODES.has(error?.original?.code) ||
    error?.original?.message === "Network Error"
  );
}

export default api;
