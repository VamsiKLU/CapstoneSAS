import axios from "axios";

/**
 * Centralized error codes mapped to professional user-facing messages.
 */
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "Your session has expired. Please sign in again.",
  GITHUB_NOT_CONNECTED: "Connect your GitHub account to continue.",
  GITHUB_REAUTH_REQUIRED:
    "Your GitHub authorization has expired or been revoked. Reconnect your GitHub account to continue.",
  GITHUB_SCOPE_INSUFFICIENT:
    "Reconnect your GitHub account to grant public repository access.",
  GITHUB_PRIVATE_REPO_FORBIDDEN:
    "Only public GitHub repositories are supported.",
  GITHUB_RATE_LIMIT: "GitHub API rate limit exceeded. Please try again later.",
  GITHUB_FORBIDDEN:
    "GitHub denied access to the requested resource. Verify repository permissions or reconnect GitHub.",
  GITHUB_NOT_FOUND: "The requested GitHub repository was not found.",
  GITHUB_TIMEOUT: "GitHub took too long to respond. Please try again.",
  GITHUB_UNAVAILABLE: "Unable to reach GitHub right now. Please try again.",
  GITHUB_INVALID_RESPONSE: "Received an unexpected response from GitHub.",
  GITHUB_EMAIL_MISMATCH:
    "GitHub authorization could not be completed because the email addresses do not match.",
  GITHUB_AUTH_FAILED:
    "Unable to complete GitHub authorization. Please try again.",
  BACKEND_UNAVAILABLE:
    "Unable to reach the Pipeline Hub backend. Verify the server is running and try again.",
  INTERNAL_ERROR: "An unexpected server error occurred. Please try again.",
  PROJECT_CONFLICT: "A project with this repository and branch already exists.",
  PROJECT_NOT_FOUND: "Project not found.",
  PROJECT_LIST_FAILED: "Unable to load projects. Please try again.",
  PROJECT_CREATE_FAILED: "Unable to create project. Please try again.",
  PROJECT_UPDATE_FAILED: "Unable to update project. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  ACCOUNT_DELETION_FAILED: "Unable to delete your account. Please try again.",
  NETWORK_ERROR: "Unable to reach the Pipeline Hub server. Please try again.",
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
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { "Content-Type": "application/json" },
});

/**
 * Extracts a professional error message from an Axios error response.
 * Preserves server-supplied messages and codes when present.
 */
export function extractErrorMessage(err) {
  const code = err?.response?.data?.code;
  const serverMsg = err?.response?.data?.message;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (serverMsg) return serverMsg;
  if (!err?.response && err?.message === "Network Error") {
    return ERROR_MESSAGES.BACKEND_UNAVAILABLE;
  }
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
