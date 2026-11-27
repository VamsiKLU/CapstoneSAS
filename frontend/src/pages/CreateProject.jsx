import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import LinkOffOutlinedIcon from "@mui/icons-material/LinkOffOutlined";
import AppShell from "../components/AppShell";
import { useNotification } from "../components/Notification";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage, initiateGitHubConnect } from "../services/authService";
import * as githubService from "../services/githubService";
import * as projectService from "../services/projectService";
import {
  initialRepoSelectionState,
  applyRepositoriesLoading,
  applyRepositoriesLoaded,
  applyRepositoriesError,
  applyBranchesLoading,
  applyBranchesLoaded,
  applyBranchesError,
  getRepositoryViewMode,
} from "../utils/repoSelectionState";
import "../styles/forms.css";

const STACKS = ["Node.js", "Java", "Python", "Go", "React", ".NET", "Ruby"];

function getReconnectPromptCopy(reconnectError) {
  if (reconnectError?.code === "GITHUB_SCOPE_INSUFFICIENT") {
    return {
      title: "GitHub repository permission required",
      description:
        "Your GitHub account is connected, but Pipeline Hub needs the public_repo permission to browse your public repositories and branches.",
      buttonLabel: "Reconnect GitHub",
    };
  }
  if (reconnectError?.code === "GITHUB_REAUTH_REQUIRED") {
    return {
      title: "GitHub authorization expired",
      description:
        reconnectError.message ||
        "Your GitHub authorization has expired or been revoked. Reconnect your GitHub account to continue.",
      buttonLabel: "Reconnect GitHub",
    };
  }
  return {
    title: "GitHub connection required",
    description:
      reconnectError?.message ||
      "Connect your GitHub account to browse your public repositories and branches.",
    buttonLabel: reconnectError?.requiresReconnect ? "Reconnect GitHub" : "Connect GitHub",
  };
}

function getErrorHeading(code) {
  if (code === "GITHUB_RATE_LIMIT") return "GitHub rate limit reached";
  if (code === "GITHUB_TIMEOUT") return "GitHub request timed out";
  if (code === "BACKEND_UNAVAILABLE") return "Backend unavailable";
  if (code === "AUTH_REQUIRED") return "Session expired";
  return "Unable to load GitHub repositories";
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const { isGithubConnected, refreshUser } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [repoState, setRepoState] = useState(initialRepoSelectionState);
  const [nameEdited, setNameEdited] = useState(false);

  const [selectedRepoFullName, setSelectedRepoFullName] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [selectedRepoName, setSelectedRepoName] = useState("");

  const [form, setForm] = useState({
    name: "",
    repositoryUrl: "",
    branch: "",
    stack: "Node.js",
    version: "v1",
  });

  const loadRepositories = useCallback(
    async (targetPage = 1) => {
      if (!isGithubConnected) {
        setRepoState((prev) =>
          prev.repoError?.requiresReconnect || prev.branchError?.requiresReconnect
            ? prev
            : initialRepoSelectionState,
        );
        return;
      }
      setRepoState((prev) => applyRepositoriesLoading(prev));
      try {
        const result = await githubService.getRepositories({ page: targetPage, perPage: 30 });
        setRepoState((prev) => applyRepositoriesLoaded(prev, result));
      } catch (err) {
        setRepoState((prev) => applyRepositoriesError(prev, err));
        if (err?.requiresReconnect) {
          await refreshUser();
        }
      }
    },
    [isGithubConnected, refreshUser],
  );

  const loadBranchesForRepo = useCallback(
    async (owner, repoName, defaultBranch) => {
      if (!owner || !repoName) return;
      setRepoState((prev) => applyBranchesLoading(prev));
      try {
        const result = await githubService.getAllBranches(owner, repoName, { perPage: 100 });
        setRepoState((prev) => applyBranchesLoaded(prev, result, defaultBranch));
        const preferred =
          result.branches.find((b) => b.name === defaultBranch || b.default)?.name ||
          result.branches[0]?.name ||
          "";
        setForm((prev) => ({ ...prev, branch: preferred }));
      } catch (err) {
        setForm((prev) => ({ ...prev, branch: "" }));
        setRepoState((prev) => applyBranchesError(prev, err));
        if (err?.requiresReconnect) {
          await refreshUser();
        }
      }
    },
    [refreshUser],
  );

  useEffect(() => {
    loadRepositories(1);
  }, [loadRepositories]);

  const handleSelectRepo = async (fullName) => {
    setSelectedRepoFullName(fullName);
    const chosen = repoState.repos.find((r) => r.fullName === fullName);
    if (!chosen) {
      setSelectedOwner("");
      setSelectedRepoName("");
      setRepoState((prev) => ({ ...prev, branches: [], branchError: null, selectedBranch: "" }));
      setForm((prev) => ({ ...prev, repositoryUrl: "", branch: "" }));
      return;
    }

    setSelectedOwner(chosen.ownerLogin);
    setSelectedRepoName(chosen.name);
    setForm((prev) => ({
      ...prev,
      name: nameEdited && prev.name ? prev.name : chosen.name,
      repositoryUrl: chosen.htmlUrl || `https://github.com/${chosen.fullName}`,
      branch: "",
    }));
    await loadBranchesForRepo(chosen.ownerLogin, chosen.name, chosen.defaultBranch);
  };

  const handleReconnect = async () => {
    try {
      await initiateGitHubConnect();
    } catch (err) {
      error(extractErrorMessage(err));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isGithubConnected) {
      error("Connect your GitHub account to continue.");
      return;
    }
    if (!form.name.trim() || !selectedRepoFullName || !form.repositoryUrl || !form.branch) {
      error("Project name, repository, and branch are required.");
      return;
    }
    setSubmitting(true);
    try {
      await projectService.createProject({
        name: form.name.trim(),
        repositoryFullName: selectedRepoFullName,
        repositoryUrl: form.repositoryUrl,
        branch: form.branch,
        stack: form.stack,
        pipelineVersion: form.version,
      });
      success(`Project ${form.name.trim()} registered. Ready for pipeline execution.`);
      navigate("/projects");
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const {
    reposLoading,
    repos,
    repoError,
    repoPage,
    branchesLoading,
    branches,
    branchError,
  } = repoState;
  const viewMode = getRepositoryViewMode(repoState, isGithubConnected);
  const showDisconnected = viewMode === "disconnected";
  const reconnectError = repoError?.requiresReconnect
    ? repoError
    : branchError?.requiresReconnect
      ? branchError
      : repoError;
  const reconnectCopy = getReconnectPromptCopy(reconnectError);

  return (
    <AppShell title="Register Project" subtitle="Delivery / Projects / Register">
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Connect Repository
            </Typography>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Select a public GitHub repository and branch, bind an independently versioned reusable CI pipeline, and prepare builds.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 15 }} />}
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
      </div>

      <div className="ph-form-card">
        {showDisconnected ? (
          <Box sx={{ py: 2 }}>
            <Alert
              severity="warning"
              icon={<LinkOffOutlinedIcon sx={{ color: "#e3b341" }} />}
              sx={{
                mb: 2.5,
                backgroundColor: "#0d1117",
                border: "1px solid rgba(210, 153, 34, 0.4)",
                color: "#c9d1d9",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
                {reconnectCopy.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }}>
                {reconnectCopy.description}
              </Typography>
            </Alert>
            <Button
              variant="contained"
              startIcon={<GitHubIcon sx={{ fontSize: 16 }} />}
              onClick={handleReconnect}
              sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
            >
              {reconnectCopy.buttonLabel}
            </Button>
          </Box>
        ) : (
          <form onSubmit={submit}>
            <Stack spacing={2.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
                    GitHub Repository Selection
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>
                    Showing public repositories accessible to your connected GitHub account.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => loadRepositories(repoPage.page)}
                  disabled={reposLoading}
                  sx={{ flexShrink: 0 }}
                >
                  Refresh
                </Button>
              </Stack>

              {reposLoading && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" sx={{ color: "#8b949e" }}>
                    Loading GitHub repositories...
                  </Typography>
                </Stack>
              )}

              {!reposLoading && repoError && (
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={() => loadRepositories(repoPage.page)}>
                      Retry
                    </Button>
                  }
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
                    {getErrorHeading(repoError.code)}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    {repoError.message}
                  </Typography>
                </Alert>
              )}

              {!reposLoading && !repoError && repos.length === 0 && (
                <Alert severity="info" sx={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#c9d1d9" }}>
                  No public GitHub repositories were found for your connected account.
                </Alert>
              )}

              {!reposLoading && !repoError && repos.length > 0 && (
                <>
                  <TextField
                    select
                    label="GitHub Repository"
                    required
                    fullWidth
                    size="small"
                    value={selectedRepoFullName}
                    onChange={(e) => handleSelectRepo(e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      Select a public GitHub repository
                    </MenuItem>
                    {repos.map((r) => (
                      <MenuItem key={r.id || r.fullName} value={r.fullName}>
                        {r.fullName}
                        {r.language ? ` · ${r.language}` : ""}
                        {r.archived ? " (archived)" : ""}
                      </MenuItem>
                    ))}
                  </TextField>

                  {(repoPage.hasPrevPage || repoPage.hasNextPage) && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ color: "#8b949e" }}>
                        Page {repoPage.page}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!repoPage.hasPrevPage || reposLoading}
                          onClick={() => loadRepositories(repoPage.prevPage || Math.max(1, repoPage.page - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!repoPage.hasNextPage || reposLoading}
                          onClick={() => loadRepositories(repoPage.nextPage || repoPage.page + 1)}
                        >
                          Next
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </>
              )}

              <TextField
                label="Project Name"
                required
                fullWidth
                size="small"
                placeholder="e.g. payments-service"
                value={form.name}
                onChange={(e) => {
                  setNameEdited(true);
                  setForm({ ...form, name: e.target.value });
                }}
              />

              <TextField
                label="Repository URL"
                required
                fullWidth
                size="small"
                value={form.repositoryUrl}
                placeholder="Select a GitHub repository above"
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: <GitHubIcon sx={{ fontSize: 16, color: "#8b949e", mr: 1 }} />,
                  },
                }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  {branchesLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" sx={{ color: "#8b949e" }}>
                        Loading branches...
                      </Typography>
                    </Stack>
                  ) : branchError ? (
                    <Alert
                      severity="error"
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => loadBranchesForRepo(selectedOwner, selectedRepoName, form.branch)}
                        >
                          Retry
                        </Button>
                      }
                    >
                      {branchError.message}
                    </Alert>
                  ) : (
                    <TextField
                      select
                      label="Target Branch"
                      required
                      fullWidth
                      size="small"
                      disabled={!selectedRepoFullName || branches.length === 0}
                      value={form.branch}
                      onChange={(e) => setForm({ ...form, branch: e.target.value })}
                      helperText={
                        selectedRepoFullName && branches.length === 0
                          ? "No branches available for the selected repository."
                          : ""
                      }
                    >
                      {branches.map((b) => (
                        <MenuItem key={b.name} value={b.name}>
                          {b.name}
                          {b.default ? " (default)" : ""}
                          {b.protected ? " (protected)" : ""}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Box>

                <TextField
                  select
                  label="Primary Technology Stack"
                  fullWidth
                  size="small"
                  sx={{ flex: 1 }}
                  value={form.stack}
                  onChange={(e) => setForm({ ...form, stack: e.target.value })}
                >
                  {STACKS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
                  Reusable Pipeline Step Binding
                </Typography>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>
                  Projects explicitly pin a pipeline version to prevent breaking changes from upstream step modifications.
                </Typography>
              </Box>

              <TextField
                select
                label="Pipeline Version Contract"
                fullWidth
                size="small"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
              >
                <MenuItem value="v1">v1 — Minimal (Install -&gt; Compile -&gt; Test)</MenuItem>
                <MenuItem value="v2">v2 — Standard (Install -&gt; Compile -&gt; Test -&gt; Docker Build/Push)</MenuItem>
                <MenuItem value="v3">v3 — Enterprise (Install -&gt; Compile -&gt; Test -&gt; Security Scan -&gt; Docker -&gt; K8s Deploy)</MenuItem>
              </TextField>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2, borderTop: "1px solid #21262d" }}>
                <Button onClick={() => navigate("/projects")}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || reposLoading || branchesLoading || !selectedRepoFullName || !form.branch}
                  startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
                >
                  {submitting ? "Registering..." : "Register Project"}
                </Button>
              </Stack>
            </Stack>
          </form>
        )}
      </div>
    </AppShell>
  );
}
