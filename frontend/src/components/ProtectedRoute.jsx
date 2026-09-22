import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen message="Verifying session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // Admin trying to access developer routes -> send to admin panel
    if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
    // Developer trying to access admin routes -> send to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
