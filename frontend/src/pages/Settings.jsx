import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import LinkOffOutlinedIcon from "@mui/icons-material/LinkOffOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import { disconnectGitHub, deleteAccount, initiateGitHubConnect, extractErrorMessage } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "../styles/forms.css";

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { success, error: notifyError, warning } = useNotification();
  const navigate = useNavigate();

  // Disconnect dialog
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Delete account dialogs (two-step)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  // GitHub connect
  const [connecting, setConnecting] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectGitHub();
      await refreshUser();
      setDisconnectOpen(false);
      success("GitHub account disconnected.");
    } catch (err) {
      notifyError(extractErrorMessage(err));
    } finally {
      setDisconnecting(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await initiateGitHubConnect();
    } catch (err) {
      notifyError(extractErrorMessage(err));
      setConnecting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") {
      warning("Type DELETE to confirm account deletion.");
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      notifyError(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell title="Settings">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
            Settings
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Manage your account and GitHub connection.
          </Typography>
        </Box>
      </div>

      <Stack spacing={4} sx={{ maxWidth: 640 }}>
        {/* Section: Account */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}
          >
            Account
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 600, display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Name
              </Typography>
              <Typography variant="body2" sx={{ color: "#f0f6fc" }}>
                {user?.name || "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 600, display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Email
              </Typography>
              <Typography variant="body2" sx={{ color: "#f0f6fc", fontFamily: "var(--ph-font-mono)" }}>
                {user?.email || "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 600, display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Role
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  px: "8px",
                  py: "2px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontFamily: "var(--ph-font-mono)",
                  fontWeight: 600,
                  backgroundColor: "rgba(56, 139, 253, 0.12)",
                  color: "#58a6ff",
                  border: "1px solid rgba(56, 139, 253, 0.3)",
                  textTransform: "uppercase",
                }}
              >
                {user?.role || "-"}
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Section: GitHub Connection */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}
          >
            GitHub Connection
          </Typography>
          <Divider sx={{ mb: 2.5 }} />

          {user?.githubConnected ? (
            <Stack spacing={2.5}>
              {/* Connected status */}
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16, color: "#3fb950" }} />
                <Typography variant="body2" sx={{ color: "#3fb950", fontWeight: 600 }}>
                  Connected
                </Typography>
              </Stack>

              {/* GitHub identity */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={user.github?.avatarUrl}
                  alt={user.github?.name}
                  sx={{ width: 40, height: 40, border: "1px solid #30363d" }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
                    {user.github?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#8b949e", fontFamily: "var(--ph-font-mono)" }}>
                    @{user.github?.username}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1}>
                {user.github?.email && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 600, display: "block", mb: 0.3, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      GitHub Email
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#c9d1d9", fontFamily: "var(--ph-font-mono)" }}>
                      {user.github.email}
                    </Typography>
                  </Box>
                )}
                {user.github?.profileUrl && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 600, display: "block", mb: 0.3, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Profile
                    </Typography>
                    <Typography
                      component="a"
                      href={user.github.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      sx={{ color: "#58a6ff", fontFamily: "var(--ph-font-mono)", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                    >
                      {user.github.profileUrl}
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LinkOffOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setDisconnectOpen(true)}
                  sx={{
                    borderColor: "#f85149",
                    color: "#f85149",
                    "&:hover": { borderColor: "#ff7b72", backgroundColor: "rgba(248, 81, 73, 0.06)" },
                  }}
                >
                  Disconnect GitHub
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LinkOffOutlinedIcon sx={{ fontSize: 16, color: "#8b949e" }} />
                <Typography variant="body2" sx={{ color: "#8b949e" }}>
                  No GitHub account connected
                </Typography>
              </Stack>
              <Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<GitHubIcon sx={{ fontSize: 15 }} />}
                  onClick={handleConnect}
                  disabled={connecting}
                  sx={{
                    backgroundColor: "#238636",
                    "&:hover": { backgroundColor: "#2ea043" },
                  }}
                >
                  {connecting ? "Connecting..." : "Connect GitHub"}
                </Button>
              </Box>
            </Stack>
          )}
        </Box>

        {/* Section: Danger Zone */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#f85149", mb: 0.5 }}
          >
            Danger Zone
          </Typography>
          <Divider sx={{ borderColor: "#f8514933", mb: 2.5 }} />
          <Box
            sx={{
              border: "1px solid #f8514933",
              borderRadius: "8px",
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.3 }}>
                Delete Account
              </Typography>
              <Typography variant="caption" sx={{ color: "#8b949e" }}>
                Permanently delete your Pipeline Hub account and all associated data.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteOutlinedIcon sx={{ fontSize: 15 }} />}
              onClick={() => setDeleteOpen(true)}
              sx={{
                borderColor: "#f85149",
                color: "#f85149",
                flexShrink: 0,
                "&:hover": { borderColor: "#ff7b72", backgroundColor: "rgba(248, 81, 73, 0.06)" },
              }}
            >
              Delete Account
            </Button>
          </Box>
        </Box>
      </Stack>

      {/* Disconnect GitHub Dialog */}
      <Dialog
        open={disconnectOpen}
        onClose={() => !disconnecting && setDisconnectOpen(false)}
        PaperProps={{ sx: { backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "12px", minWidth: 420 } }}
      >
        <DialogTitle sx={{ color: "#f0f6fc", fontWeight: 700, pb: 1 }}>
          Disconnect GitHub?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#c9d1d9", lineHeight: 1.7 }}>
            Disconnecting your GitHub account will disable Pipeline Hub operations that require
            GitHub authorization.
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 1.5, lineHeight: 1.6 }}>
            Your Pipeline Hub account and existing data will remain available.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setDisconnectOpen(false)}
            disabled={disconnecting}
            sx={{ borderColor: "#30363d", color: "#8b949e" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleDisconnect}
            disabled={disconnecting}
            sx={{ backgroundColor: "#da3633", "&:hover": { backgroundColor: "#f85149" } }}
          >
            {disconnecting ? "Disconnecting..." : "Disconnect GitHub"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account -- Step 1: Warning */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        PaperProps={{ sx: { backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "12px", minWidth: 440 } }}
      >
        <DialogTitle sx={{ color: "#f0f6fc", fontWeight: 700, pb: 1 }}>
          Delete account?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#c9d1d9", lineHeight: 1.7 }}>
            This action permanently deletes your Pipeline Hub account and associated data.
            This action cannot be undone.
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 1.5, lineHeight: 1.6 }}>
            Your account information, GitHub connection information, and associated Pipeline Hub
            data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setDeleteOpen(false)}
            sx={{ borderColor: "#30363d", color: "#8b949e" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => { setDeleteOpen(false); setDeleteConfirmOpen(true); }}
            sx={{ backgroundColor: "#da3633", "&:hover": { backgroundColor: "#f85149" } }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account -- Step 2: Explicit confirmation */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleting && setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "12px", minWidth: 440 } }}
      >
        <DialogTitle sx={{ color: "#f0f6fc", fontWeight: 700, pb: 1 }}>
          Confirm permanent deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#8b949e", mb: 2, lineHeight: 1.6 }}>
            Type <strong style={{ color: "#f0f6fc", fontFamily: "monospace" }}>DELETE</strong> to confirm.
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="DELETE"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => { setDeleteConfirmOpen(false); setDeleteInput(""); }}
            disabled={deleting}
            sx={{ borderColor: "#30363d", color: "#8b949e" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleDeleteAccount}
            disabled={deleting || deleteInput !== "DELETE"}
            sx={{ backgroundColor: "#da3633", "&:hover": { backgroundColor: "#f85149" } }}
          >
            {deleting ? "Deleting..." : "Permanently Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
