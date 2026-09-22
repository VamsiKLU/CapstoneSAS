import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import AppShell from "../components/AppShell";
import { useNotification } from "../components/Notification";
import * as projectService from "../services/projectService";
import "../styles/forms.css";

const STACKS = ["Node.js", "Java", "Python", "Go", "React", ".NET", "Ruby"];

export default function CreateProject() {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    repositoryUrl: "",
    branch: "main",
    stack: "Node.js",
    version: "v1",
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.repositoryUrl) {
      error("Project name and repository URL are required.");
      return;
    }
    setLoading(true);
    try {
      await projectService.createProject({
        ...form,
        repo: form.repositoryUrl,
        status: "Queued",
        lastBuild: "—",
      });
      success(`Project ${form.name} registered. Ready for pipeline execution.`);
      navigate("/projects");
    } catch (err) {
      error(err.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Register Project" subtitle="Delivery / Projects / Register">
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Connect Repository
            </Typography>
            <span className="gh-badge purple">CLOUD-240</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Register a repository, bind an independently versioned reusable CI pipeline, and begin builds.
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
        <form onSubmit={submit}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
                Repository Identifiers
              </Typography>
              <Typography variant="caption" sx={{ color: "#8b949e" }}>
                Target Git repository to trigger reusable CI pipeline step workflows.
              </Typography>
            </Box>

            <TextField
              label="Project Name"
              required
              fullWidth
              size="small"
              placeholder="e.g. payments-service"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <TextField
              label="Repository URL"
              required
              fullWidth
              size="small"
              placeholder="github.com/acme/payments-service"
              value={form.repositoryUrl}
              onChange={(e) => setForm({ ...form, repositoryUrl: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: <GitHubIcon sx={{ fontSize: 16, color: "#8b949e", mr: 1 }} />,
                },
              }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Target Branch"
                fullWidth
                size="small"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              />
              <TextField
                select
                label="Primary Technology Stack"
                fullWidth
                size="small"
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
              <MenuItem value="v1">v1 — Minimal (Install → Compile → Test)</MenuItem>
              <MenuItem value="v2">v2 — Standard (Install → Compile → Test → Docker Build/Push)</MenuItem>
              <MenuItem value="v3">v3 — Enterprise (Install → Compile → Test → Security Scan → Docker → K8s Deploy)</MenuItem>
            </TextField>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2, borderTop: "1px solid #21262d" }}>
              <Button onClick={() => navigate("/projects")}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
              >
                {loading ? "Registering…" : "Register Project"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </div>
    </AppShell>
  );
}
