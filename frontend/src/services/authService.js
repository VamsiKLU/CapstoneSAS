import axios from "axios";

/**
 * Centralized error codes mapped to professional user-facing messages.
 */
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "Your session has expired. Please sign in again.",
  GITHUB_NOT_CONNECTED: "Connect your GitHub account to continue.",
  GITHUB_EMAIL_MISMATCH:
    "GitHub authorization could not be completed because the email addresses do not match.",
  GITHUB_AUTH_FAILED:
    "Unable to complete GitHub authorization. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  ACCOUNT_DELETION_FAILED: "Unable to delete your account. Please try again.",
  NETWORK_ERROR: "Unable to complete this action. Please try again.",
  FORBIDDEN: "You do not have permission to access this area.",
  REGISTRATION_FAILED: "Unable to create account. Please try again.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

/**
 * Axios instance for API requests.
 * withCredentials ensures the session cookie is sent on every request.
 */
const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * Extracts a professional error message from an Axios error response.
 */
export function extractErrorMessage(err) {
  const code = err?.response?.data?.code;
  const serverMsg = err?.response?.data?.message;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (serverMsg) return serverMsg;
  if (err?.message) return err.message;
  return ERROR_MESSAGES.NETWORK_ERROR;
}

/**
 * Register a new Developer account.
 * Role is always assigned by the backend as DEVELOPER.
 */
export async function register({ name, email, password, confirmPassword }) {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    password,
    confirmPassword,
  });
  return data.user;
}

/**
 * Login with email and password.
 * Works for both DEVELOPER and ADMIN accounts.
 * The backend determines the role.
 */
export async function login({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data.user;
}

/**
 * Fetch the currently authenticated user from the backend session.
 * Returns the user object or throws if not authenticated.
 */
export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

/**
 * Initiate GitHub OAuth flow.
 * Gets the GitHub authorization URL from the backend, then redirects the browser.
 * Never exposes GitHub client secret to the frontend.
 */
export async function initiateGitHubConnect() {
  const { data } = await api.get("/auth/github");
  if (data.authUrl) {
    window.location.href = data.authUrl;
  }
}

/**
 * Disconnect the GitHub account for the current user.
 */
export async function disconnectGitHub() {
  const { data } = await api.post("/auth/github/disconnect");
  return data.user;
}

/**
 * Sign out the current user by destroying the server-side session.
 */
export async function logout() {
  await api.post("/auth/logout");
}

/**
 * Permanently delete the current user's account.
 * The backend uses the session to identify the user -- no user ID sent from frontend.
 */
export async function deleteAccount() {
  await api.delete("/account");
}
