import axios from "axios";

// Axios instance for future CI/CD API calls.
// Auth calls use /auth/* which are proxied to the backend.
export const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { "Content-Type": "application/json" },
});

/**
 * Explicit development-only demo mode flag.
 * Mock data fallback is only allowed when VITE_DEMO_MODE=true in dev
 * and the backend is unreachable (network error), never on 401/403/404/5xx.
 */
export function isDemoModeEnabled() {
  return Boolean(import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === "true");
}

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

export function shouldUseDemoFallback(error) {
  return isDemoModeEnabled() && isNetworkError(error?.original || error);
}

export default api;
