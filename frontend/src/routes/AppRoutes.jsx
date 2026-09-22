import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ProtectedRoute from "../components/ProtectedRoute";

// Public pages
import Landing from "../pages/Landing";
import AdminLogin from "../pages/AdminLogin";
import AuthCallback from "../pages/AuthCallback";
import AuthError from "../pages/AuthError";
import NotFound from "../pages/NotFound";

// Developer pages
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import CreateProject from "../pages/CreateProject";
import Pipelines from "../pages/Pipelines";
import PipelineVersions from "../pages/PipelineVersions";
import DependencyTracking from "../pages/DependencyTracking";
import BuildHistory from "../pages/BuildHistory";
import Deployments from "../pages/Deployments";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSystem from "../pages/admin/AdminSystem";
import AdminAudit from "../pages/admin/AdminAudit";
import AdminSettings from "../pages/admin/AdminSettings";

// Root component: shows Landing for unauthenticated, redirects authenticated users by role
function RootRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Loader fullScreen message="Checking session..." />;
  if (!isAuthenticated) return <Landing />;
  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<AuthError />} />

      {/* Developer routes -- DEVELOPER role only */}
      <Route path="/dashboard"        element={<ProtectedRoute roles={["DEVELOPER"]}><Dashboard /></ProtectedRoute>} />
      <Route path="/projects"         element={<ProtectedRoute roles={["DEVELOPER"]}><Projects /></ProtectedRoute>} />
      <Route path="/projects/create"  element={<ProtectedRoute roles={["DEVELOPER"]}><CreateProject /></ProtectedRoute>} />
      <Route path="/pipelines"        element={<ProtectedRoute roles={["DEVELOPER"]}><Pipelines /></ProtectedRoute>} />
      <Route path="/pipeline-versions" element={<ProtectedRoute roles={["DEVELOPER"]}><PipelineVersions /></ProtectedRoute>} />
      <Route path="/dependencies"     element={<ProtectedRoute roles={["DEVELOPER"]}><DependencyTracking /></ProtectedRoute>} />
      <Route path="/build-history"    element={<ProtectedRoute roles={["DEVELOPER"]}><BuildHistory /></ProtectedRoute>} />
      <Route path="/deployments"      element={<ProtectedRoute roles={["DEVELOPER"]}><Deployments /></ProtectedRoute>} />
      <Route path="/profile"          element={<ProtectedRoute roles={["DEVELOPER"]}><Profile /></ProtectedRoute>} />
      <Route path="/settings"         element={<ProtectedRoute roles={["DEVELOPER"]}><Settings /></ProtectedRoute>} />

      {/* Admin routes -- ADMIN role only */}
      <Route path="/admin"          element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"    element={<ProtectedRoute roles={["ADMIN"]}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/system"   element={<ProtectedRoute roles={["ADMIN"]}><AdminSystem /></ProtectedRoute>} />
      <Route path="/admin/audit"    element={<ProtectedRoute roles={["ADMIN"]}><AdminAudit /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={["ADMIN"]}><AdminSettings /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
