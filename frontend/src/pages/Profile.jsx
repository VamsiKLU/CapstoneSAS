import { Avatar, Box, Button, Divider, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
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
            GitHub identity, role authorization, and account scope.
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
              src={user?.avatar_url || undefined}
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
              {!user?.avatar_url ? initials : null}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.3 }}>
                {user?.name || "Developer User"}
              </Typography>
              {user?.github_username && (
                <Typography
                  variant="body2"
                  sx={{ color: "#8b949e", fontFamily: "var(--ph-font-mono)", fontSize: "13px", mb: 1 }}
                >
                  @{user.github_username}
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
                {user?.github_profile_url && (
                  <Button
                    component="a"
                    href={user.github_profile_url}
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

        {/* Identity details table */}
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
                <Typography variant="body2" sx={{ color: "#f0f6fc", fontFamily: "var(--ph-font-mono)", fontSize: "13px" }}>
                  {user?.github_username ? `@${user.github_username}` : "Not connected"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, px: 3, py: 2.5 }}>
              <EmailOutlinedIcon sx={{ fontSize: 17, color: "#8b949e", mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 0.3 }}>
                  Primary Email
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
                  Developer (Pipeline Author and Execution Privileges)
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, px: 3, py: 2.5 }}>
              <BusinessOutlinedIcon sx={{ fontSize: 17, color: "#8b949e", mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 0.3 }}>
                  Authentication Provider
                </Typography>
                <Typography variant="body2" sx={{ color: "#58a6ff", fontFamily: "var(--ph-font-mono)", fontSize: "12px" }}>
                  GitHub OAuth
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppShell>
  );
}
