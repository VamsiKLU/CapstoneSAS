import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Register from "../pages/Register";
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
import NotFound from "../pages/NotFound";

function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
      <Route path="/pipelines" element={<ProtectedRoute><Pipelines /></ProtectedRoute>} />
      <Route path="/pipeline-versions" element={<ProtectedRoute><PipelineVersions /></ProtectedRoute>} />
      <Route path="/dependencies" element={<ProtectedRoute><DependencyTracking /></ProtectedRoute>} />
      <Route path="/build-history" element={<ProtectedRoute><BuildHistory /></ProtectedRoute>} />
      <Route path="/deployments" element={<ProtectedRoute><Deployments /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
