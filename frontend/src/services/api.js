import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";
const TOKEN_KEY = "ph_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    if (status === 401 && !error.config?.url?.includes("/auth/login")) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("ph_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ status, message, original: error });
  },
);

// Returns true when the backend is simply unreachable (no server running).
// Covers all codes Axios / browsers emit for connection-refused / network-down:
//   ERR_NETWORK         — browser fetch / XHR when host is unreachable
//   ECONNREFUSED        — Node.js / Vite dev-server proxy
//   ERR_CONNECTION_REFUSED — Chrome when connecting to localhost with no server
//   ETIMEDOUT / ECONNABORTED — request timeout (backend starting up or hung)
const OFFLINE_CODES = new Set([
  "ERR_NETWORK",
  "ECONNREFUSED",
  "ERR_CONNECTION_REFUSED",
  "ETIMEDOUT",
  "ECONNABORTED",
  "ERR_EMPTY_RESPONSE",
]);

export function isNetworkError(error) {
  if (error?.response) return false; // got an HTTP response → not a network error
  return (
    OFFLINE_CODES.has(error?.code) ||
    error?.message === "Network Error" ||
    OFFLINE_CODES.has(error?.original?.code) ||
    error?.original?.message === "Network Error"
  );
}

export default api;
