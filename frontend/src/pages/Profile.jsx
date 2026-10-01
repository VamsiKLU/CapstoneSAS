import { Avatar, Box, Button, Divider, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import LinkOffOutlinedIcon from "@mui/icons-material/LinkOffOutlined";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PH";

  // Nested GitHub info from new Spring Boot API shape
  const gh = user?.github || null;
  const avatarUrl = gh?.avatarUrl || null;

  return (
    <AppShell title="Profile">
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Developer Profile
            </Typography>
            <span className="gh-badge neutral">Developer</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Account information, GitHub identity, and role authorization.
          </Typography>
        </Box>
      </div>

      <Box sx={{ maxWidth: 640 }}>
        {/* Identity card */}
        <Box
          sx={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            p: 3,
            mb: 3,
          }}
        >
          <Stack direction="row" spacing={2.5} alignItems="flex-start">
            <Avatar
              src={avatarUrl || undefined}
              alt={user?.name || "Developer"}
              sx={{
                width: 64,
                height: 64,
                bgcolor: "#21262d",
                color: "#f0f6fc",
                fontSize: 22,
                fontWeight: 700,
                border: "2px solid #30363d",
              }}
            >
              {!avatarUrl ? initials : null}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.3 }}>
                {user?.name || "Developer User"}
              </Typography>
              {gh?.username && (
                <Typography
                  variant="body2"
                  sx={{ color: "#8b949e", fontFamily: "var(--ph-font-mono)", fontSize: "13px", mb: 1 }}
                >
                  @{gh.username}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    px: "8px",
                    py: "2px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontFamily: "var(--ph-font-mono)",
                    fontWeight: 600,
                    backgroundColor: "rgba(46, 160, 67, 0.15)",
                    color: "#3fb950",
                    border: "1px solid rgba(63, 185, 80, 0.3)",
                    textTransform: "uppercase",
                  }}
                >
                  {user?.role || "DEVELOPER"}
                </Box>
                {gh?.profileUrl && (
                  <Button
                    component="a"
                    href={gh.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<GitHubIcon sx={{ fontSize: 13 }} />}
                    endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 11 }} />}
                    sx={{
                      fontSize: "11px",
                      color: "#8b949e",
                      py: 0.3,
                      px: 1,
                      borderRadius: "12px",
                      border: "1px solid #30363d",
                      minHeight: 0,
                      "&:hover": { color: "#f0f6fc", borderColor: "#8b949e" },
                    }}
                  >
                    View on GitHub
                  </Button>
                )}
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Identity details */}
        <Box
          sx={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #30363d" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Identity Details
            </Typography>
          </Box>
          <Stack divider={<Divider sx={{ borderColor: "#21262d" }} />}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, px: 3, py: 2.5 }}>
              <GitHubIcon sx={{ fontSize: 17, color: "#8b949e", mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 0.3 }}>
                  GitHub Account
                </Typography>
                {gh?.username ? (
                  <Typography variant="body2" sx={{ color: "#f0f6fc", fontFamily: "var(--ph-font-mono)", fontSize: "13px" }}>
                    @{gh.username}
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LinkOffOutlinedIcon sx={{ fontSize: 14, color: "#8b949e" }} />
                    <Typography variant="body2" sx={{ color: "#8b949e", fontSize: "13px" }}>
                      Not connected
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate("/connect-github")}
                      sx={{ fontSize: "11px", color: "#58a6ff", minHeight: 0, py: 0, px: 0.5 }}
                    >
                      Connect
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, px: 3, py: 2.5 }}>
              <EmailOutlinedIcon sx={{ fontSize: 17, color: "#8b949e", mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 0.3 }}>
                  Email
                </Typography>
                <Typography variant="body2" sx={{ color: "#f0f6fc", fontFamily: "var(--ph-font-mono)", fontSize: "13px" }}>
                  {user?.email || "Not available"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, px: 3, py: 2.5 }}>
              <BadgeOutlinedIcon sx={{ fontSize: 17, color: "#8b949e", mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 0.3 }}>
                  Platform Role
                </Typography>
                <Typography variant="body2" sx={{ color: "#f0f6fc", fontSize: "13px" }}>
                  Developer
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, px: 3, py: 2.5 }}>
              <AccountCircleOutlinedIcon sx={{ fontSize: 17, color: "#8b949e", mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 0.3 }}>
                  Authentication
                </Typography>
                <Typography variant="body2" sx={{ color: "#58a6ff", fontFamily: "var(--ph-font-mono)", fontSize: "12px" }}>
                  Email and password + GitHub OAuth
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppShell>
  );
}
