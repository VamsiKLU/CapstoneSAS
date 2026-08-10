import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import { motion } from "framer-motion";
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
      success("Project created successfully.");
      navigate("/projects");
    } catch (err) {
      error(err.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Create Project" subtitle="Delivery / Projects / New">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Connect a Git repository</Typography>
          <Typography variant="body2" color="text.secondary">
            Register a project, assign a pipeline version, and start building.
          </Typography>
        </Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/projects")}>Back</Button>
      </div>

      <motion.form
        className="ph-form-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Stack spacing={2.5}>
          <TextField label="Project name" required fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Repository URL" required fullWidth placeholder="https://github.com/org/repo"
            value={form.repositoryUrl} onChange={(e) => setForm({ ...form, repositoryUrl: e.target.value })} />
          <TextField label="Branch" fullWidth value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })} />
          <TextField select label="Technology stack" fullWidth value={form.stack}
            onChange={(e) => setForm({ ...form, stack: e.target.value })}>
            {STACKS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField select label="Pipeline version" fullWidth value={form.version}
            onChange={(e) => setForm({ ...form, version: e.target.value })}>
            {["v1", "v2", "v3"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={() => navigate("/projects")}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
              {loading ? "Creating…" : "Create project"}
            </Button>
          </Stack>
        </Stack>
      </motion.form>
    </AppShell>
  );
}
