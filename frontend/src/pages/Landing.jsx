import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initiateGithubLogin } from "../services/authService";
import Loader from "../components/Loader";
import "../styles/landing.css";

const FEATURES = [
  {
    Icon: LayersOutlinedIcon,
    title: "Reusable CI Step Contracts",
    desc: "Decouple pipeline steps with explicit inputs, outputs, and interface contracts.",
  },
  {
    Icon: HubOutlinedIcon,
    title: "Hidden Coupling Detection",
    desc: "Detect undeclared dependencies between pipeline steps before merge.",
  },
  {
    Icon: SecurityOutlinedIcon,
    title: "Independent Step Versioning",
    desc: "Semantic versioning for pipeline steps allows downstream services to upgrade on demand.",
  },
];

const PIPELINE_STEPS = ["Checkout", "Install", "Compile", "Test", "Scan", "Docker", "Deploy"];

export default function Landing() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <Loader fullScreen message="Checking session..." />;

  // Redirect authenticated users to their role-appropriate destination
  if (isAuthenticated) {
    if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="ph-landing">
      {/* Left: Project Identity */}
      <div className="ph-landing-left">
        {/* Brand */}
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
            <Typography
              variant="caption"
              sx={{ color: "#6e7681", fontFamily: "var(--ph-font-mono)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              CLOUD-240
            </Typography>
          </Box>
        </div>

        {/* Headline */}
        <Box sx={{ maxWidth: 560, mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#f0f6fc", lineHeight: 1.25, mb: 2, letterSpacing: "-0.02em" }}
          >
            Continuous Integration Pipeline Step Reuse Without Hidden Coupling
          </Typography>
          <Typography variant="body1" sx={{ color: "#8b949e", lineHeight: 1.7, fontSize: "15px" }}>
            Build, reuse, version and analyze CI pipeline components without hidden dependencies.
            An engineering platform for composing independently versioned pipeline steps with
            explicit interface contracts.
          </Typography>
        </Box>

        {/* Feature list */}
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

        {/* Pipeline step visualization */}
        <div className="ph-landing-pipeline-steps">
          {PIPELINE_STEPS.map((step, i, arr) => (
            <Box key={step} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="ph-pipeline-step-badge">
                <span className="dot" />
                {step}
              </span>
              {i < arr.length - 1 && <span className="ph-pipeline-arrow">&#8594;</span>}
            </Box>
          ))}
        </div>
      </div>

      {/* Right: Authentication */}
      <div className="ph-landing-right">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f0f6fc", mb: 1 }}>
            Sign in to PipelineHub
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", lineHeight: 1.6 }}>
            Developer platform access with role-based governance.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* GitHub login */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#6e7681", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, display: "block", mb: 1.5 }}
            >
              For Developers
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<GitHubIcon />}
              onClick={initiateGithubLogin}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: "14px",
                backgroundColor: "#238636",
                "&:hover": { backgroundColor: "#2ea043" },
                justifyContent: "center",
                gap: 1,
              }}
            >
              Continue with GitHub
            </Button>
            <Typography variant="caption" sx={{ color: "#6e7681", display: "block", mt: 1, textAlign: "center" }}>
              Authorizes read access to your GitHub identity only.
            </Typography>
          </Box>

          <div className="ph-landing-divider">or</div>

          {/* Admin login */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#6e7681", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, display: "block", mb: 1.5 }}
            >
              Platform Administration
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              component={Link}
              to="/admin/login"
              startIcon={<AdminPanelSettingsOutlinedIcon />}
              sx={{
                py: 1.4,
                fontWeight: 500,
                fontSize: "14px",
                borderColor: "#30363d",
                color: "#c9d1d9",
                backgroundColor: "transparent",
                "&:hover": { borderColor: "#8b949e", backgroundColor: "rgba(177, 186, 196, 0.06)" },
              }}
            >
              Admin Login
            </Button>
            <Typography variant="caption" sx={{ color: "#6e7681", display: "block", mt: 1, textAlign: "center" }}>
              Platform administration console access.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: 6, pt: 4, borderTop: "1px solid #21262d" }}>
          <Typography variant="caption" sx={{ color: "#6e7681", lineHeight: 1.6, display: "block" }}>
            Project CLOUD-240. Capstone: Continuous Integration Pipeline Step Reuse Without Hidden Coupling.
          </Typography>
        </Box>
      </div>
    </div>
  );
}
