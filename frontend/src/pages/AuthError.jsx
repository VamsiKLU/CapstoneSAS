import { useSearchParams, Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import { initiateGithubLogin } from "../services/authService";

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "GitHub authorization could not be completed.";

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
      <Box
        sx={{
          maxWidth: 460,
          width: "100%",
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          p: 4,
          textAlign: "center",
        }}
      >
        <ErrorOutlineOutlinedIcon sx={{ fontSize: 40, color: "#e3b341", mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 1 }}>
          GitHub Sign-In Failed
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#8b949e",
            mb: 3,
            lineHeight: 1.6,
            fontFamily: "var(--ph-font-mono)",
            fontSize: "12px",
            wordBreak: "break-word",
          }}
        >
          {reason}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<GitHubIcon />}
            onClick={initiateGithubLogin}
            sx={{
              backgroundColor: "#238636",
              "&:hover": { backgroundColor: "#2ea043" },
              fontWeight: 600,
            }}
          >
            Try Again with GitHub
          </Button>
          <Button
            variant="text"
            fullWidth
            component={Link}
            to="/"
            sx={{ color: "#8b949e", "&:hover": { color: "#f0f6fc" } }}
          >
            Return to sign in
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
