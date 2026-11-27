import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

/**
 * Guards routes based on authentication state, role, and GitHub connection.
 *
 * State model:
 *   - Unauthenticated -> /
 *   - ADMIN accessing developer routes -> /admin
 *   - DEVELOPER with no GitHub connection -> /connect-github
 *   - DEVELOPER with GitHub connected -> children
 *   - ADMIN accessing admin routes -> children
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user, needsGitHub } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen message="Verifying session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // Role mismatch handling
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Developer must connect GitHub before accessing developer pages
  // (except the connect-github page itself)
  if (user?.role === "DEVELOPER" && needsGitHub && location.pathname !== "/connect-github") {
    return <Navigate to="/connect-github" replace />;
  }

  return children;
}
