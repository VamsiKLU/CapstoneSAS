import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import Loader from "../components/Loader";
import "../styles/dashboard.css";

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Developer",
  });

  if (authLoading) return <Loader fullScreen message="Loading session…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(form);
      success("Account created successfully. Welcome to PipelineHub.");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.message || "Registration failed.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ph-auth-form-wrap" style={{ minHeight: "100vh", backgroundColor: "#0d1117" }}>
      <form className="ph-auth-card" onSubmit={submit} style={{ maxWidth: 440 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
          <div className="ph-logo-mark" style={{ width: 28, height: 28 }}>
            <ViewInArOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f0f6fc" }}>
            Pipeline<span style={{ color: "#58a6ff" }}>Hub</span>
          </Typography>
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
          Create your developer account
        </Typography>
        <Typography variant="body2" sx={{ color: "#8b949e", mb: 2.5 }}>
          Access reusable CI components and manage pipeline dependencies.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Full name"
            fullWidth
            required
            size="small"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Work email"
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
          <TextField
            select
            label="Role in Organization"
            fullWidth
            size="small"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <MenuItem value="Developer">Developer (Author & Run Pipelines)</MenuItem>
            <MenuItem value="Admin">Admin (Platform Governance)</MenuItem>
          </TextField>

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
            {loading ? "Creating account…" : "Create account"}
          </Button>

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="caption" sx={{ color: "#8b949e", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#58a6ff", fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>
        </Stack>
      </form>
    </div>
  );
}
