import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if there is an active backend session.
  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      // 401 = no session; treat as unauthenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const adminLogin = useCallback(async (credentials) => {
    const u = await authService.adminLogin(credentials);
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

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "ADMIN";
  const isDeveloper = user?.role === "DEVELOPER";

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isDeveloper,
      adminLogin,
      logout,
      checkSession,
      // initiateGithubLogin is called directly from the Landing page
    }),
    [user, loading, isAuthenticated, isAdmin, isDeveloper, adminLogin, logout, checkSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
