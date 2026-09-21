import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "ph_token";
const USER_KEY = "ph_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((session) => {
    if (session?.token) localStorage.setItem(TOKEN_KEY, session.token);
    if (session?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      setUser(session.user);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getProfile()
      .then((profile) => setUser(profile))
      .catch((err) => {
        // Only clear the session when the backend explicitly rejects the token
        // (i.e. a real HTTP error like 401/403). When the backend is simply
        // unreachable (network down / not started) we keep the locally-stored
        // user so that the mock-only flow keeps working across page navigations.
        const isRealAuthError =
          err?.status === 401 || err?.status === 403;
        if (isRealAuthError) clearSession();
        // else: leave user/token intact — getProfile already fell back to
        // localStorage in authService; if it still threw, just swallow it.
      })
      .finally(() => setLoading(false));
  }, [clearSession]);

  const login = async (credentials) => {
    const session = await authService.login(credentials);
    persistSession(session);
    return session.user;
  };

  const register = async (payload) => {
    const session = await authService.register(payload);
    persistSession(session);
    return session.user;
  };

  const logout = () => clearSession();

  const isAuthenticated = Boolean(user && localStorage.getItem(TOKEN_KEY));
  const isAdmin = user?.role === "Admin";

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin,
      hasRole: (role) => user?.role === role,
    }),
    [user, loading, isAuthenticated, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
