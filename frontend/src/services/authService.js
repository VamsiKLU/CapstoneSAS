import axios from "axios";

// Auth requests go directly to /auth/* (proxied to backend :3001 in dev).
// withCredentials ensures the session cookie is sent/received.
const authAxios = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * Fetch the currently authenticated user from the backend session.
 * Returns the user object or throws if not authenticated.
 */
export async function getCurrentUser() {
  const { data } = await authAxios.get("/auth/me");
  return data.user;
}

/**
 * Submit admin credentials to the backend.
 * Returns the authenticated admin user object.
 */
export async function adminLogin({ email, password }) {
  const { data } = await authAxios.post("/auth/admin/login", { email, password });
  return data.user;
}

/**
 * Initiate GitHub OAuth flow.
 * Redirects the browser to the backend which then redirects to GitHub.
 */
export function initiateGithubLogin() {
  window.location.href = "/auth/github";
}

/**
 * Sign out the current user by destroying the server-side session.
 */
export async function logout() {
  await authAxios.post("/auth/logout");
}
