import { Avatar, Box, Chip, Divider, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

export default function Profile() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PH";

  return (
    <AppShell title="Profile" subtitle="Account / Developer Profile">
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Developer Profile
            </Typography>
            <span className="gh-badge purple">CLOUD-240 User</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Account identity, role authorization, and departmental scope.
          </Typography>
        </Box>
      </div>

      <div className="ph-profile-card">
        <div className="ph-profile-header">
          <div className="ph-profile-avatar">
            {initials}
          </div>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              {user?.name || "Developer User"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#8b949e", fontFamily: "var(--ph-font-mono)", fontSize: "12px" }}>
              {user?.email || "dev@pipelinehub.io"}
            </Typography>
            <Box
              component="span"
              sx={{
                display: "inline-block",
                mt: 1,
                px: "8px",
                py: "2px",
                borderRadius: "12px",
                fontSize: "11px",
                fontFamily: "var(--ph-font-mono)",
                fontWeight: 600,
                backgroundColor: user?.role === "Admin" ? "rgba(31, 111, 235, 0.15)" : "rgba(46, 160, 67, 0.15)",
                color: user?.role === "Admin" ? "#58a6ff" : "#3fb950",
                border: user?.role === "Admin" ? "1px solid rgba(56, 139, 253, 0.3)" : "1px solid rgba(63, 185, 80, 0.3)",
              }}
            >
              Role: {user?.role || "Developer"}
            </Box>
          </Box>
        </div>

        <Stack spacing={1} sx={{ mt: 2.5 }}>
          <div className="ph-profile-row">
            <EmailOutlinedIcon sx={{ fontSize: 18, color: "#8b949e" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }}>
                Primary Email
              </Typography>
              <Typography variant="body2" sx={{ color: "#f0f6fc", fontFamily: "var(--ph-font-mono)", fontSize: "12.5px" }}>
                {user?.email || "—"}
              </Typography>
            </Box>
          </div>

          <div className="ph-profile-row">
            <BadgeOutlinedIcon sx={{ fontSize: 18, color: "#8b949e" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }}>
                Security Clearance / Role
              </Typography>
              <Typography variant="body2" sx={{ color: "#f0f6fc", fontSize: "12.5px" }}>
                {user?.role || "Developer"} (Pipeline Author & Execution Privileges)
              </Typography>
            </Box>
          </div>

          <div className="ph-profile-row">
            <BusinessOutlinedIcon sx={{ fontSize: 18, color: "#8b949e" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }}>
                Department / Team
              </Typography>
              <Typography variant="body2" sx={{ color: "#f0f6fc", fontSize: "12.5px" }}>
                {user?.department || "Platform Engineering"}
              </Typography>
            </Box>
          </div>

          <div className="ph-profile-row">
            <SecurityOutlinedIcon sx={{ fontSize: 18, color: "#8b949e" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }}>
                Authentication Provider
              </Typography>
              <Typography variant="body2" sx={{ color: "#58a6ff", fontFamily: "var(--ph-font-mono)", fontSize: "12px" }}>
                PipelineHub Mock JWT Session (Local Mock Mode)
              </Typography>
            </Box>
          </div>
        </Stack>
      </div>
    </AppShell>
  );
}
