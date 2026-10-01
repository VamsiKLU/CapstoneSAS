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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import { extractErrorMessage } from "../services/authService";
import Loader from "../components/Loader";
import "../styles/auth.css";

export default function Register() {
  const { register, isAuthenticated, loading: authLoading, needsGitHub } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  if (authLoading) return <Loader fullScreen message="Loading session..." />;
  if (isAuthenticated) {
    if (needsGitHub) return <Navigate to="/connect-github" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setFormError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await register(form);
      success("Account created. Connect your GitHub account to continue.");
      // Navigation handled by auth state change
    } catch (err) {
      const msg = extractErrorMessage(err);
      setFormError(msg);
      notifyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ph-auth-form-wrap" style={{ minHeight: "100vh", backgroundColor: "#0d1117" }}>
      <form className="ph-auth-card" onSubmit={submit} style={{ maxWidth: 440 }}>
        {/* Brand */}
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "7px",
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              display: "grid",
              placeItems: "center",
              color: "#58a6ff",
            }}
          >
            <ViewInArOutlinedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f0f6fc" }}>
            Pipeline<span style={{ color: "#58a6ff" }}>Hub</span>
          </Typography>
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
          Create your account
        </Typography>
        <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
          Join Pipeline Hub to manage CI/CD pipelines and deployments.
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "13px" }}>
            {formError}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <TextField
            label="Full name"
            fullWidth
            required
            size="small"
            autoFocus
            value={form.name}
            onChange={handleChange("name")}
          />

          <Box>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              required
              size="small"
              value={form.email}
              onChange={handleChange("email")}
            />
            <Typography
              variant="caption"
              sx={{ color: "#8b949e", display: "block", mt: 0.5, fontSize: "11.5px" }}
            >
              Use the email address associated with your GitHub account.
            </Typography>
          </Box>

          <TextField
            label="Password"
            fullWidth
            required
            size="small"
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={handleChange("password")}
            helperText="Minimum 8 characters"
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

          <TextField
            label="Confirm password"
            fullWidth
            required
            size="small"
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" size="small">
                      {showConfirm
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
            disabled={submitting}
            sx={{
              py: 1.2,
              fontWeight: 600,
              backgroundColor: "#238636",
              "&:hover": { backgroundColor: "#2ea043" },
            }}
          >
            {submitting ? "Creating account..." : "Create account"}
          </Button>

          <Typography variant="caption" sx={{ color: "#8b949e", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/" style={{ color: "#58a6ff", fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>
        </Stack>
      </form>
    </div>
  );
}
