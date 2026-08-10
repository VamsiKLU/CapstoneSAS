import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Divider, IconButton, InputAdornment, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import Loader from "../components/Loader";
import "../styles/auth.css";

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

  if (authLoading) return <Loader fullScreen />;
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
      success("Account created successfully.");
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
    <div className="ph-auth ph-auth-register">
      <div className="ph-auth-form-wrap ph-auth-form-wrap-full">
        <motion.form
          className="ph-auth-card"
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Typography variant="h5" gutterBottom>Create account</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Join your team on the enterprise CI/CD platform.
          </Typography>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          <Stack spacing={2}>
            <TextField label="Full name" fullWidth required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Email" type="email" fullWidth required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField
              label="Password" fullWidth required type={show ? "text" : "password"} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)} edge="end">
                        {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField select label="Role" fullWidth value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <MenuItem value="Developer">Developer</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
            <Button type="submit" size="large" variant="contained" disabled={loading}>
              {loading ? "Creating account…" : "Register"}
            </Button>
            <Divider />
            <Typography variant="body2" color="text.secondary" align="center">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#1976d2", fontWeight: 600 }}>Sign in</Link>
            </Typography>
          </Stack>
        </motion.form>
      </div>
    </div>
  );
}
