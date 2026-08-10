import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment,
  MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrowOutlined";
import AppShell from "../components/AppShell";
import StatusChip from "../components/StatusChip";
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

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => rows.filter((r) =>
      (filter === "All" || r.status === filter) &&
      (r.name?.toLowerCase().includes(query.toLowerCase()) ||
        (r.repo || r.repositoryUrl || "").toLowerCase().includes(query.toLowerCase()))),
    [rows, query, filter],
  );

  const save = async () => {
    try {
      if (draft.id) {
        await projectService.updateProject(draft.id, draft);
        success("Project updated.");
      } else {
        await projectService.createProject(draft);
        success("Project created.");
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
      success("Project deleted.");
      load();
    } catch (err) {
      error(err.message || "Delete failed.");
    }
  };

  const triggerBuild = async (project) => {
    setBuilding(project.id);
    try {
      await buildService.startBuild({ projectId: project.id, pipelineVersion: project.version || "v1" });
      success(`Build started for ${project.name}.`);
    } catch (err) {
      error(err.message || "Build failed to start.");
    } finally {
      setBuilding(null);
    }
  };

  return (
    <AppShell title="Projects" subtitle="Delivery / Projects">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Project management</Typography>
          <Typography variant="body2" color="text.secondary">
            Assign pipeline versions and track build status per repository.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/projects/create">
          Add project
        </Button>
      </div>

      <div className="ph-surface">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            size="small" placeholder="Search projects…" value={query} sx={{ flex: 1 }}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <TextField select size="small" label="Status" value={filter} sx={{ minWidth: 170 }} onChange={(e) => setFilter(e.target.value)}>
            {["All", "Passing", "Failed", "Running", "Queued"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Stack>

        {loading ? (
          <Loader message="Loading projects…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No projects match your filters"
            description="Create a new project or reset the filters to see all repositories."
            actionLabel="Add project"
            onAction={() => navigate("/projects/create")}
          />
        ) : (
          <TableContainer className="ph-scroll-x">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Repository URL</TableCell>
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
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{p.name}</TableCell>
                    <TableCell sx={{ color: "primary.main" }}>{p.repo || p.repositoryUrl}</TableCell>
                    <TableCell>{p.branch || "main"}</TableCell>
                    <TableCell>{p.stack || "—"}</TableCell>
                    <TableCell>{p.version}</TableCell>
                    <TableCell><StatusChip value={p.status} /></TableCell>
                    <TableCell>{p.lastBuild}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Trigger build">
                        <IconButton size="small" disabled={building === p.id} onClick={() => triggerBuild(p)}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => { setDraft(p); setOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => remove(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit project</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Project name" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} fullWidth />
            <TextField label="Repository URL" value={draft.repo || draft.repositoryUrl || ""} onChange={(e) => setDraft({ ...draft, repo: e.target.value, repositoryUrl: e.target.value })} fullWidth />
            <TextField label="Branch" value={draft.branch || "main"} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} fullWidth />
            <TextField label="Technology stack" value={draft.stack || ""} onChange={(e) => setDraft({ ...draft, stack: e.target.value })} fullWidth />
            <TextField select label="Pipeline version" value={draft.version || "v1"} onChange={(e) => setDraft({ ...draft, version: e.target.value })} fullWidth>
              {["v1", "v2", "v3"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
