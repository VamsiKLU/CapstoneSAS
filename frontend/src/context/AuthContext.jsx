import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

/**
 * Authentication state model:
 *   UNAUTHENTICATED
 *   AUTHENTICATED_ADMIN
 *   AUTHENTICATED_DEVELOPER_GITHUB_CONNECTED
 *   AUTHENTICATED_DEVELOPER_GITHUB_DISCONNECTED
 *   AUTHENTICATED_DEVELOPER_GITHUB_REQUIRED  (never connected)
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      // 401 = no active session
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await authService.register(data);
    setUser(u);
    return u;
  }, []);

  // Legacy alias used in AdminLogin -- maps to the unified login endpoint
  const adminLogin = useCallback(async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort logout
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // Derived state
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "ADMIN";
  const isDeveloper = user?.role === "DEVELOPER";
  const isGithubConnected = isDeveloper && user?.githubConnected === true;
  const needsGitHub = isDeveloper && !isGithubConnected;

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isDeveloper,
      isGithubConnected,
      needsGitHub,
      login,
      register,
      adminLogin,
      logout,
      checkSession,
      refreshUser,
    }),
    [
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isDeveloper,
      isGithubConnected,
      needsGitHub,
      login,
      register,
      adminLogin,
      logout,
      checkSession,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
