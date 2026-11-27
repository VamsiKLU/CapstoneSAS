import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import { extractErrorMessage } from "../services/authService";
import Loader from "../components/Loader";
import "../styles/landing.css";

const FEATURES = [
  {
    Icon: LayersOutlinedIcon,
    title: "Reusable CI Step Library",
    desc: "Build independently versioned pipeline steps with explicit input and output contracts.",
  },
  {
    Icon: HubOutlinedIcon,
    title: "Dependency Tracking",
    desc: "Visualize and monitor dependencies between pipeline components.",
  },
  {
    Icon: SecurityOutlinedIcon,
    title: "Security Scanning",
    desc: "Integrated vulnerability detection across all pipeline executions.",
  },
  {
    Icon: AccountTreeOutlinedIcon,
    title: "Pipeline Governance",
    desc: "Manage pipeline versions, approvals, and rollback across environments.",
  },
];

export default function Landing() {
  const { isAuthenticated, loading, user, needsGitHub, login } = useAuth();
  const { error: notifyError, success } = useNotification();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (loading) return <Loader fullScreen message="Checking session..." />;

  // Redirect authenticated users
  if (isAuthenticated) {
    if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (needsGitHub) return <Navigate to="/connect-github" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setFormError("Enter your email and password to continue.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await login({ email: form.email, password: form.password });
      success("Signed in to PipelineHub.");
      // Navigation handled by the auth state change above
    } catch (err) {
      const msg = extractErrorMessage(err);
      setFormError(msg);
      notifyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ph-landing">
      {/* Left: Product identity */}
      <div className="ph-landing-left">
        <div className="ph-landing-brand">
          <div className="ph-landing-logo">
            <ViewInArOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#f0f6fc", letterSpacing: "-0.01em", lineHeight: 1.2 }}
            >
              Pipeline<span style={{ color: "#58a6ff" }}>Hub</span>
            </Typography>
          </Box>
        </div>

        <Box sx={{ maxWidth: 520, mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#f0f6fc", lineHeight: 1.25, mb: 2, letterSpacing: "-0.02em" }}
          >
            Unified CI/CD pipeline management and governance
          </Typography>
          <Typography variant="body1" sx={{ color: "#8b949e", lineHeight: 1.7, fontSize: "15px" }}>
            Build, version, and monitor CI/CD pipeline components with full dependency
            visibility and integrated security scanning.
          </Typography>
        </Box>

        <ul className="ph-landing-step-list">
          {FEATURES.map((f) => (
            <li key={f.title} className="ph-landing-step">
              <div className="ph-landing-step-icon">
                <f.Icon sx={{ fontSize: 17 }} />
              </div>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#e6edf3", mb: 0.3 }}>
                  {f.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8b949e", lineHeight: 1.5, display: "block" }}>
                  {f.desc}
                </Typography>
              </Box>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Login form */}
      <div className="ph-landing-right">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f0f6fc", mb: 1 }}>
            Sign in to PipelineHub
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", lineHeight: 1.6 }}>
            Access the platform with your email and password.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {formError && (
              <Alert severity="error" sx={{ fontSize: "13px" }}>
                {formError}
              </Alert>
            )}

            <TextField
              label="Email address"
              type="email"
              fullWidth
              required
              autoFocus
              size="small"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <TextField
              label="Password"
              fullWidth
              required
              size="small"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw((s) => !s)} edge="end" size="small">
                        {showPw
                          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
                          : <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
              sx={{
                py: 1.4,
                fontWeight: 600,
                fontSize: "14px",
                backgroundColor: "#238636",
                "&:hover": { backgroundColor: "#2ea043" },
              }}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>

            <Typography variant="caption" sx={{ color: "#8b949e", textAlign: "center" }}>
              New to PipelineHub?{" "}
              <Link to="/register" style={{ color: "#58a6ff", fontWeight: 600 }}>
                Create an account
              </Link>
            </Typography>
          </Stack>
        </form>
      </div>
    </div>
  );
}
