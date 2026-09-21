import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import Loader from "../components/Loader";
import "../styles/dashboard.css";

const CAPSTONE_HIGHLIGHTS = [
  {
    icon: LayersOutlinedIcon,
    title: "Reusable CI Step Contracts",
    desc: "Decouple pipeline steps with explicit inputs, outputs, and interface contracts.",
  },
  {
    icon: HubOutlinedIcon,
    title: "Hidden Coupling Detection",
    desc: "Detect undeclared dependencies between pipeline steps before merge.",
  },
  {
    icon: SecurityOutlinedIcon,
    title: "Independent Step Versioning",
    desc: "Independent semantic versions allowing downstream services to upgrade on demand.",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "admin@pipelinehub.io",
    password: "admin123",
    remember: true,
  });

  if (authLoading) return <Loader fullScreen message="Checking session credentials…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      success("Authenticated to PipelineHub Developer Platform.");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      const msg = err.message || "Login failed. Please verify credentials.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubMockLogin = async () => {
    setLoading(true);
    try {
      await login({ email: "dev@pipelinehub.io", password: "mock-github-oauth" });
      success("Signed in via GitHub (Mock Session).");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch {
      notifyError("GitHub mock login failed.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email) => {
    setForm({ ...form, email, password: "password123" });
  };

  return (
    <div className="ph-auth">
      {/* Left Column: Project Identity & Research Problem */}
      <div className="ph-auth-art">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <div className="ph-logo-mark" style={{ width: 34, height: 34 }}>
            <ViewInArOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#f0f6fc", letterSpacing: "-0.01em" }}>
              Pipeline<span style={{ color: "#58a6ff" }}>Hub</span>
            </Typography>
            <Typography variant="caption" sx={{ color: "#8b949e", fontFamily: "var(--ph-font-mono)", fontSize: "11px" }}>
              Project ID: CLOUD-240
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ maxWidth: 520 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#f0f6fc", lineHeight: 1.3, mb: 1.5 }}>
            Continuous Integration Pipeline Step Reuse Without Hidden Coupling
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", lineHeight: 1.6 }}>
            An engineering platform for composing independently versioned, reusable CI/CD pipeline steps
            with explicit interface verification and undeclared coupling detection.
          </Typography>
        </Box>

        {/* Feature Highlights */}
        <Stack spacing={2} sx={{ maxWidth: 500, my: 1 }}>
          {CAPSTONE_HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <Stack key={item.title} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "6px",
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    display: "grid",
                    placeItems: "center",
                    color: "#58a6ff",
                    flexShrink: 0,
                    mt: 0.2,
                  }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", fontSize: "12.5px" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#8b949e", lineHeight: 1.4, display: "block" }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>

        {/* Flow visual */}
        <Box sx={{ pt: 2, borderTop: "1px solid #21262d" }}>
          <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 1 }}>
            Verified Pipeline Step Execution Sequence
          </Typography>
          <div className="ph-pipeline-viz">
            {["Checkout", "Install", "Compile", "Test", "Scan", "Docker", "Deploy"].map((step, i, arr) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div className="ph-viz-node">
                  <CheckCircleOutlineIcon sx={{ fontSize: 12, color: "#3fb950" }} />
                  {step}
                </div>
                {i < arr.length - 1 && <div className="ph-viz-link" />}
              </div>
            ))}
          </div>
        </Box>
      </div>

      {/* Right Column: Sign in Form */}
      <div className="ph-auth-form-wrap">
        <form className="ph-auth-card" onSubmit={submit}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f0f6fc", mb: 0.5 }}>
            Sign in to PipelineHub
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", mb: 2 }}>
            Developer platform access with role-based governance.
          </Typography>

          {/* Quick Demo Credential Pills */}
          <div className="ph-demo-box">
            <div className="label">QUICK DEMO CREDENTIALS:</div>
            <div className="pill" onClick={() => fillCredentials("admin@pipelinehub.io", "Admin")}>
              Admin: admin@pipelinehub.io
            </div>
            <div className="pill" onClick={() => fillCredentials("dev@pipelinehub.io", "Developer")}>
              Developer: dev@pipelinehub.io
            </div>
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              required
              size="small"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <TextField
              label="Password"
              fullWidth
              required
              size="small"
              type={show ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)} edge="end" size="small">
                        {show ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                    size="small"
                    sx={{ color: "#6e7681", "&.Mui-checked": { color: "#1f6feb" } }}
                  />
                }
                label={<Typography variant="caption" sx={{ color: "#c9d1d9" }}>Remember me</Typography>}
              />
              <Typography variant="caption" sx={{ color: "#58a6ff", cursor: "pointer" }}>
                Forgot password?
              </Typography>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1,
                fontWeight: 600,
                backgroundColor: "#238636",
                "&:hover": { backgroundColor: "#2ea043" },
              }}
            >
              {loading ? "Authenticating…" : "Sign in"}
            </Button>

            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" sx={{ color: "#6e7681" }}>
                or
              </Typography>
            </Divider>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GitHubIcon sx={{ fontSize: 16 }} />}
              onClick={handleGitHubMockLogin}
              disabled={loading}
              sx={{
                py: 1,
                borderColor: "#30363d",
                color: "#c9d1d9",
                backgroundColor: "#21262d",
                "&:hover": { backgroundColor: "#30363d", borderColor: "#8b949e" },
              }}
            >
              Continue with GitHub (Mock)
            </Button>

            <Typography variant="caption" sx={{ color: "#8b949e", textAlign: "center", mt: 1 }}>
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
