import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ForkRightOutlinedIcon from "@mui/icons-material/ForkRightOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import AppShell from "../components/AppShell";
import StatusChip from "../components/StatusChip";
import VersionBadge from "../components/VersionBadge";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useNotification } from "../components/Notification";
import * as projectService from "../services/projectService";
import * as buildService from "../services/buildService";
import "../styles/dashboard.css";

export default function Projects() {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({});
  const [building, setBuilding] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await projectService.getProjects());
    } catch (err) {
      error(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === "All" || r.status === filter) &&
          (r.name?.toLowerCase().includes(query.toLowerCase()) ||
            (r.repo || r.repositoryUrl || "").toLowerCase().includes(query.toLowerCase())),
      ),
    [rows, query, filter],
  );

  const save = async () => {
    try {
      if (draft.id) {
        await projectService.updateProject(draft.id, draft);
        success("Project updated successfully.");
      } else {
        await projectService.createProject(draft);
        success("Project registered successfully.");
      }
      setOpen(false);
      setDraft({});
      load();
    } catch (err) {
      error(err.message || "Save failed.");
    }
  };

  const remove = async (id) => {
    try {
      await projectService.deleteProject(id);
      success("Project deleted from platform.");
      load();
    } catch (err) {
      error(err.message || "Delete failed.");
    }
  };

  const triggerBuild = async (project) => {
    setBuilding(project.id);
    try {
      await buildService.startBuild({ projectId: project.id, pipelineVersion: project.version || "v1" });
      success(`Build queued for ${project.name} on ${project.version || "v1"}.`);
    } catch (err) {
      error(err.message || "Build failed to trigger.");
    } finally {
      setBuilding(null);
    }
  };

  return (
    <AppShell title="Projects" subtitle="Manage projects and their reusable CI pipeline configuration">
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Projects
            </Typography>
            <span className="gh-badge neutral">{rows.length} repositories</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Manage projects and their reusable CI pipeline configuration.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          component={Link}
          to="/projects/create"
          sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
        >
          Add Project
        </Button>
      </div>

      <div className="ph-surface">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search projects by name or repository…"
            value={query}
            sx={{ flex: 1 }}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: "#8b949e" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            label="Build Status"
            value={filter}
            sx={{ minWidth: 160 }}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All", "Passing", "Failed", "Running", "Queued"].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <Loader message="Loading registered projects…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="No repositories matched your filters. Register a project or reset filters."
            actionLabel="Add Project"
            onAction={() => navigate("/projects/create")}
          />
        ) : (
          <TableContainer className="ph-scroll-x" sx={{ border: "1px solid #30363d", borderRadius: "6px" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#161b22" }}>
                  <TableCell>Project</TableCell>
                  <TableCell>Repository</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Stack</TableCell>
                  <TableCell>Pipeline Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Build</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} hover sx={{ "&:hover": { backgroundColor: "rgba(110, 118, 129, 0.08)" } }}>
                    <TableCell sx={{ fontWeight: 600, color: "#f0f6fc" }}>
                      {p.name}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontSize: "12px", color: "#58a6ff" }}>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <GitHubIcon sx={{ fontSize: 14, color: "#8b949e" }} />
                        <span>{p.repo || p.repositoryUrl}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontSize: "12px", color: "#c9d1d9" }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <ForkRightOutlinedIcon sx={{ fontSize: 14, color: "#8b949e" }} />
                        <span>{p.branch || "main"}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          px: "6px",
                          py: "1px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#21262d",
                          border: "1px solid #30363d",
                          color: "#c9d1d9",
                        }}
                      >
                        {p.stack || "Node.js"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <VersionBadge version={p.version} />
                    </TableCell>
                    <TableCell>
                      <StatusChip value={p.status} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontSize: "11.5px", color: "#8b949e" }}>
                      {p.lastBuild}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Trigger CI Build">
                          <IconButton
                            size="small"
                            disabled={building === p.id}
                            onClick={() => triggerBuild(p)}
                            sx={{ color: "#3fb950" }}
                          >
                            <PlayArrowOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit project settings">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDraft(p);
                              setOpen(true);
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete project">
                          <IconButton
                            size="small"
                            sx={{ color: "#f85149" }}
                            onClick={() => remove(p.id)}
                          >
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: "#f0f6fc", fontWeight: 600, fontSize: "15px", borderBottom: "1px solid #30363d" }}>
          Edit Project Configuration
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Project name"
              size="small"
              value={draft.name || ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Repository URL"
              size="small"
              value={draft.repo || draft.repositoryUrl || ""}
              onChange={(e) => setDraft({ ...draft, repo: e.target.value, repositoryUrl: e.target.value })}
              fullWidth
            />
            <TextField
              label="Default branch"
              size="small"
              value={draft.branch || "main"}
              onChange={(e) => setDraft({ ...draft, branch: e.target.value })}
              fullWidth
            />
            <TextField
              label="Technology stack"
              size="small"
              value={draft.stack || ""}
              onChange={(e) => setDraft({ ...draft, stack: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Assigned Pipeline Version"
              size="small"
              value={draft.version || "v1"}
              onChange={(e) => setDraft({ ...draft, version: e.target.value })}
              fullWidth
            >
              {["v1", "v2", "v3"].map((v) => (
                <MenuItem key={v} value={v}>
                  {v} (Reusable Step Template)
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #30363d" }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
