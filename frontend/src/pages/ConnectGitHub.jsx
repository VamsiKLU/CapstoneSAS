import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography, CircularProgress } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import LinkOffOutlinedIcon from "@mui/icons-material/LinkOffOutlined";
import { useAuth } from "../context/AuthContext";
import { initiateGitHubConnect, extractErrorMessage, ERROR_MESSAGES } from "../services/authService";
import { useNotification } from "../components/Notification";

/**
 * GitHub connection page.
 * Shown to developers who have not yet connected a GitHub account,
 * or who need to reconnect after a disconnect.
 */
export default function ConnectGitHub() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { error: notifyError, success } = useNotification();
  const [connecting, setConnecting] = useState(false);

  // Handle error params from GitHub callback redirect
  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode === "EMAIL_MISMATCH") {
      notifyError(ERROR_MESSAGES.GITHUB_EMAIL_MISMATCH);
    } else if (errorCode === "GITHUB_AUTH_FAILED") {
      notifyError(ERROR_MESSAGES.GITHUB_AUTH_FAILED);
    } else if (errorCode) {
      notifyError(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }, [searchParams, notifyError]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await initiateGitHubConnect();
      // Browser will redirect to GitHub, so this code may not run
    } catch (err) {
      notifyError(extractErrorMessage(err));
      setConnecting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
        {/* Brand */}
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 6 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              display: "grid",
              placeItems: "center",
              color: "#58a6ff",
            }}
          >
            <ViewInArOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f0f6fc" }}>
            Pipeline<span style={{ color: "#58a6ff" }}>Hub</span>
          </Typography>
        </Stack>

        {/* GitHub icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "16px",
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 24px",
            color: "#c9d1d9",
          }}
        >
          <GitHubIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#f0f6fc", mb: 1.5 }}>
          Connect your GitHub account
        </Typography>
        <Typography variant="body2" sx={{ color: "#8b949e", lineHeight: 1.7, mb: 4, maxWidth: 380, mx: "auto" }}>
          Connect your GitHub account to continue using Pipeline Hub.
          Your GitHub email must match the email registered for this account.
        </Typography>

        {user?.email && (
          <Box
            sx={{
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "8px",
              p: 2,
              mb: 4,
              textAlign: "left",
            }}
          >
            <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 0.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Account
            </Typography>
            <Typography variant="body2" sx={{ color: "#f0f6fc", fontFamily: "var(--ph-font-mono)" }}>
              {user.email}
            </Typography>
          </Box>
        )}

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={
              connecting ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <GitHubIcon />
              )
            }
            onClick={handleConnect}
            disabled={connecting}
            fullWidth
            sx={{
              py: 1.5,
              fontWeight: 600,
              fontSize: "14px",
              backgroundColor: "#238636",
              "&:hover": { backgroundColor: "#2ea043" },
            }}
          >
            {connecting ? "Connecting..." : "Connect with GitHub"}
          </Button>

          <Button
            variant="text"
            size="small"
            startIcon={<LinkOffOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={handleSignOut}
            sx={{ color: "#8b949e", "&:hover": { color: "#c9d1d9" } }}
          >
            Sign out
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
