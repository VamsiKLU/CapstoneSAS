import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Checkbox, Divider, FormControlLabel, IconButton,
  InputAdornment, Stack, TextField, Typography,
} from "@mui/material";
import HexagonIcon from "@mui/icons-material/HexagonOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import BoltIcon from "@mui/icons-material/Bolt";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import Loader from "../components/Loader";
import "../styles/auth.css";

const STEPS = ["Commit", "Build", "Test", "Scan", "Deploy"];

function AuthArt({ heading, copy }) {
  return (
    <div className="ph-auth-art">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mb: 3 }}>
          <div className="ph-logo-mark"><HexagonIcon fontSize="small" /></div>
          <Typography variant="h6" fontWeight={800}>
            Pipeline<span style={{ color: "#60a5fa" }}>Hub</span>
          </Typography>
        </Stack>
        <Typography variant="h4" sx={{ maxWidth: 460, mb: 1.5 }}>{heading}</Typography>
        <Typography sx={{ maxWidth: 460, opacity: 0.75 }}>{copy}</Typography>
      </motion.div>

      <div className="ph-pipeline-viz">
        {STEPS.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.12 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div className="ph-viz-node"><BoltIcon sx={{ fontSize: 15, color: "#60a5fa" }} />{s}</div>
            {i < STEPS.length - 1 ? <div className="ph-viz-link" /> : null}
          </motion.div>
        ))}
      </div>

      <Stack direction="row" spacing={4} sx={{ mt: 5, opacity: 0.85 }}>
        {[["99.98%", "Pipeline uptime"], ["4.2M", "Builds executed"], ["1,200+", "Enterprise teams"]].map(([v, l]) => (
          <Box key={l}>
            <Typography variant="h6" fontWeight={800}>{v}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>{l}</Typography>
          </Box>
        ))}
      </Stack>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "admin@pipelinehub.io", password: "admin123", remember: true });

  if (authLoading) return <Loader fullScreen message="Loading session…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      success("Welcome back to Pipeline Hub.");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      const msg = err.message || "Login failed. Please try again.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ph-auth">
      <AuthArt
        heading="Ship faster with governed, reusable CI/CD pipelines."
        copy="PipelineHub gives platform teams a single control plane for pipeline templates, versioning, dependency impact and deployment health."
      />
      <div className="ph-auth-form-wrap">
        <motion.form
          className="ph-auth-card"
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Typography variant="h5" gutterBottom>Sign in</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use your corporate account to access the platform.
          </Typography>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          <Stack spacing={2}>
            <TextField
              label="Email" type="email" fullWidth required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Password" fullWidth required type={show ? "text" : "password"} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label="Toggle password">
                        {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormControlLabel
                control={<Checkbox checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Typography variant="body2" color="primary" sx={{ cursor: "pointer", fontWeight: 600 }}>
                Forgot password?
              </Typography>
            </Stack>
            <Button type="submit" size="large" variant="contained" disabled={loading}>
              {loading ? "Signing in…" : "Login"}
            </Button>
            <Divider><Typography variant="caption" color="text.secondary">or</Typography></Divider>
            <Button variant="outlined" size="large" startIcon={<GitHubIcon />}>Continue with GitHub</Button>
            <Typography variant="body2" color="text.secondary" align="center">
              New to PipelineHub?{" "}
              <Link to="/register" style={{ color: "#1976d2", fontWeight: 600 }}>Create an account</Link>
            </Typography>
          </Stack>
        </motion.form>
      </div>
    </div>
  );
}
