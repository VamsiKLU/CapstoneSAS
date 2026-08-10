import { useEffect, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import DragIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AppShell from "../components/AppShell";
import PipelineCard from "../components/PipelineCard";
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
  const [placed, setPlaced] = useState(["install", "compile", "test"]);
  const [over, setOver] = useState(false);
  const [name, setName] = useState("java-microservice-standard");
  const [version, setVersion] = useState("v1");

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

  useEffect(() => { load(); }, []);

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

  const label = (id) => stepLibrary.find((s) => s.id === id)?.label || id;

  const save = async () => {
    if (!name) {
      error("Pipeline name is required.");
      return;
    }
    try {
      await pipelineService.createPipeline({ name, version, steps: placed });
      success("Pipeline template saved.");
      load();
    } catch (err) {
      error(err.message || "Save failed.");
    }
  };

  const handleEdit = (pipeline) => {
    if (pipeline.projects > 0) {
      warning(`This pipeline is used by ${pipeline.projects} projects.`);
    }
    setName(pipeline.name);
    setVersion(pipeline.version);
    setPlaced(pipeline.steps);
  };

  const clone = async (pipeline) => {
    try {
      await pipelineService.clonePipeline(pipeline.id);
      success("Pipeline cloned.");
      load();
    } catch (err) {
      error(err.message || "Clone failed.");
    }
  };

  return (
    <AppShell title="Pipelines" subtitle="Delivery / Pipelines">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Reusable pipeline templates</Typography>
          <Typography variant="body2" color="text.secondary">
            Compose stages: install, compile, test, scan, Docker build/push, and Kubernetes deploy.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={save}>Save pipeline template</Button>
      </div>

      <div className="ph-dnd-grid">
        <div className="ph-surface">
          <Typography fontWeight={700} sx={{ mb: 1.5 }}>Step library</Typography>
          {stepLibrary.map((s) => (
            <div
              key={s.id}
              className="ph-dnd-step"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("step-id", s.id);
                e.dataTransfer.setData("from-index", "");
              }}
            >
              <DragIcon fontSize="small" color="disabled" />
              <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
            </div>
          ))}
        </div>

        <div className="ph-surface">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField size="small" label="Template name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} />
            <TextField size="small" label="Version" value={version} onChange={(e) => setVersion(e.target.value)} sx={{ width: 100 }} />
            <Button variant="outlined" onClick={() => setPlaced([])}>Clear canvas</Button>
          </Stack>

          <div
            className={`ph-dnd-canvas${over ? " over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            {placed.length === 0 ? (
              <EmptyState title="Empty pipeline" description="Drag steps from the library to build your pipeline." />
            ) : (
              placed.map((id, i) => (
                <div
                  key={`${id}-${i}`}
                  className="ph-dnd-placed"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("step-id", id);
                    e.dataTransfer.setData("from-index", String(i));
                  }}
                >
                  <DragIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
                    {i + 1}. {label(id)}
                  </Typography>
                  <DeleteIcon
                    fontSize="small"
                    color="error"
                    style={{ cursor: "pointer" }}
                    onClick={() => setPlaced((prev) => prev.filter((_, x) => x !== i))}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Existing templates</Typography>
      {loading ? (
        <Loader message="Loading pipelines…" />
      ) : (
        <div className="ph-stats-grid">
          {items.map((p, i) => (
            <Box key={p.id} sx={{ position: "relative" }}>
              <PipelineCard pipeline={p} index={i} onEdit={handleEdit} />
              <Button size="small" startIcon={<ContentCopyIcon />} sx={{ mt: 1 }} onClick={() => clone(p)}>
                Clone
              </Button>
            </Box>
          ))}
        </div>
      )}
    </AppShell>
  );
}
