import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import AppShell from "../components/AppShell";
import PipelineCard from "../components/PipelineCard";
import PipelineStep, { STEP_CONTRACTS } from "../components/PipelineStep";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useNotification } from "../components/Notification";
import * as pipelineService from "../services/pipelineService";
import { stepLibrary } from "../data/mockData";
import "../styles/dashboard.css";

export default function Pipelines() {
  const { success, error, warning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [placed, setPlaced] = useState(["install", "compile", "test", "scan", "docker"]);
  const [over, setOver] = useState(false);
  const [name, setName] = useState("java-microservice-standard");
  const [version, setVersion] = useState("v3");

  const load = async () => {
    setLoading(true);
    try {
      setItems(await pipelineService.getPipelines());
    } catch (err) {
      error(err.message || "Failed to load pipelines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("step-id");
    const from = e.dataTransfer.getData("from-index");
    if (from !== "") {
      const idx = Number(from);
      setPlaced((prev) => {
        const next = [...prev];
        const [moved] = next.splice(idx, 1);
        next.push(moved);
        return next;
      });
    } else if (id) {
      setPlaced((prev) => [...prev, id]);
    }
  };

  const addStep = (stepId) => {
    setPlaced((prev) => [...prev, stepId]);
  };

  const removeStep = (index) => {
    setPlaced((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!name) {
      error("Pipeline name is required.");
      return;
    }
    if (placed.length === 0) {
      error("At least one reusable pipeline step is required.");
      return;
    }
    try {
      await pipelineService.createPipeline({ name, version, steps: placed });
      success(`Pipeline template '${name}@${version}' saved with ${placed.length} steps.`);
      load();
    } catch (err) {
      error(err.message || "Save failed.");
    }
  };

  const handleEdit = (pipeline) => {
    if (pipeline.projects > 0) {
      warning(`This pipeline is used by ${pipeline.projects} projects. Changes may impact downstream consumers.`);
    }
    setName(pipeline.name);
    setVersion(pipeline.version);
    setPlaced(pipeline.steps);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clone = async (pipeline) => {
    try {
      await pipelineService.clonePipeline(pipeline.id);
      success(`Pipeline template cloned successfully.`);
      load();
    } catch (err) {
      error(err.message || "Clone failed.");
    }
  };

  return (
    <AppShell title="Pipelines" subtitle="Compose reusable CI pipeline steps with explicit versions and interfaces">
      {/* Header */}
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Reusable CI Pipeline Steps
            </Typography>
            <span className="gh-badge purple">Explicit Interface Contracts</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Compose modular, independently versioned pipeline steps. Contracts specify declared inputs and outputs to prevent hidden coupling.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltOutlinedIcon sx={{ fontSize: 15 }} />}
            onClick={() => setPlaced([])}
          >
            Clear Canvas
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveOutlinedIcon sx={{ fontSize: 15 }} />}
            onClick={save}
            sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
          >
            Save Pipeline Template
          </Button>
        </Stack>
      </div>

      {/* Contract Verification Notice */}
      <Alert
        severity="info"
        icon={<CheckCircleOutlineIcon sx={{ color: "#58a6ff" }} />}
        sx={{ mb: 2.5, backgroundColor: "#161b22", borderColor: "#30363d" }}
      >
        <Typography variant="caption" sx={{ color: "#c9d1d9", display: "block" }}>
          <strong>Decoupled Component Guarantee:</strong> Each step runs in an isolated container environment.
          Step reuse contracts explicitly declare prerequisites (inputs) and exported artifacts (outputs) to guarantee zero hidden coupling.
        </Typography>
      </Alert>

      {/* Editor & Library Grid */}
      <div className="ph-dnd-grid">
        {/* Step Library Panel */}
        <div className="ph-surface" style={{ height: "fit-content" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Component Library
            </Typography>
            <span className="gh-badge neutral">{stepLibrary.length} steps</span>
          </Stack>
          <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 2 }}>
            Drag steps onto the execution sequence or click (+) to append.
          </Typography>

          <Stack spacing={1}>
            {stepLibrary.map((s) => {
              const contract = STEP_CONTRACTS[s.id] || {
                category: "General",
                version: "v1.0",
                inputs: [],
                outputs: [],
              };
              return (
                <Box
                  key={s.id}
                  className="ph-dnd-step"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("step-id", s.id);
                    e.dataTransfer.setData("from-index", "");
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    p: 1.2,
                    mb: 1,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ViewInArOutlinedIcon sx={{ fontSize: 15, color: "#58a6ff" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "12.5px", color: "#f0f6fc" }}>
                        {s.label}
                      </Typography>
                    </Stack>
                    <IconButton size="small" onClick={() => addStep(s.id)} sx={{ color: "#8b949e", p: 0.2 }}>
                      <AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.8 }}>
                    <span className="gh-badge neutral" style={{ fontSize: "10px", padding: "1px 5px" }}>
                      {contract.category}
                    </span>
                    <span className="gh-badge purple" style={{ fontSize: "10px", padding: "1px 5px" }}>
                      {contract.version}
                    </span>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </div>

        {/* Pipeline Canvas & Assembly */}
        <div className="ph-surface">
          {/* Form Meta */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ flex: 1 }}
              placeholder="e.g. java-microservice-standard"
            />
            <TextField
              size="small"
              label="Semantic Version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              sx={{ width: 130 }}
              placeholder="v1, v2, v3"
            />
          </Stack>

          {/* Canvas Step Sequence */}
          <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", fontSize: "12.5px" }}>
              Sequential Step Composition ({placed.length} steps configured)
            </Typography>
            <span className="gh-badge success">Interfaces Verified</span>
          </Box>

          <div
            className={`ph-dnd-canvas${over ? " over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            {placed.length === 0 ? (
              <EmptyState
                title="Canvas is empty"
                description="Drag reusable component steps from the library on the left to assemble your CI workflow."
              />
            ) : (
              placed.map((id, i) => (
                <PipelineStep
                  key={`${id}-${i}`}
                  stepId={id}
                  index={i}
                  totalSteps={placed.length}
                  onDelete={() => removeStep(i)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("step-id", id);
                    e.dataTransfer.setData("from-index", String(i));
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Existing Templates Gallery */}
      <Box sx={{ mt: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Published Pipeline Templates
            </Typography>
            <Typography variant="caption" sx={{ color: "#8b949e" }}>
              Shared across downstream repositories with independent version pinning.
            </Typography>
          </Box>
        </Stack>

        {loading ? (
          <Loader message="Loading pipeline templates…" />
        ) : (
          <div className="ph-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {items.map((p) => (
              <PipelineCard
                key={p.id}
                pipeline={p}
                onEdit={handleEdit}
                onClone={clone}
              />
            ))}
          </div>
        )}
      </Box>
    </AppShell>
  );
}
