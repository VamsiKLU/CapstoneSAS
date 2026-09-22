import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import "../styles/landing.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, isAuthenticated, loading, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <Loader fullScreen message="Checking session..." />;
  if (isAuthenticated) {
    if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Enter your admin email and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await adminLogin({ email: form.email, password: form.password });
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Invalid credentials. Please check your admin email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0d1117",
        p: 3,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        {/* Back link */}
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 14 }} />}
          size="small"
          sx={{ color: "#8b949e", mb: 3, pl: 0, "&:hover": { color: "#f0f6fc" } }}
        >
          Back to sign in
        </Button>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              background: "rgba(188, 140, 255, 0.12)",
              color: "#bc8cff",
              border: "1px solid rgba(188, 140, 255, 0.3)",
            }}
          >
            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#f0f6fc", lineHeight: 1.2 }}>
              Admin Login
            </Typography>
            <Typography variant="caption" sx={{ color: "#6e7681", fontFamily: "var(--ph-font-mono)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Platform Administration
            </Typography>
          </Box>
        </Box>

        <form onSubmit={submit}>
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error" sx={{ fontSize: "13px" }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Admin email"
              type="email"
              fullWidth
              required
              autoFocus
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <TextField
              label="Password"
              fullWidth
              required
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
                backgroundColor: "#8957e5",
                "&:hover": { backgroundColor: "#a371f7" },
              }}
            >
              {submitting ? "Authenticating..." : "Sign in as Admin"}
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
