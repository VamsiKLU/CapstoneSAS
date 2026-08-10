import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogContent, DialogTitle, LinearProgress, Stack, Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import AppShell from "../components/AppShell";
import BuildHistoryTable from "../components/BuildHistoryTable";
import Loader from "../components/Loader";
import StatusChip from "../components/StatusChip";
import { useNotification } from "../components/Notification";
import * as buildService from "../services/buildService";
import "../styles/dashboard.css";

export default function BuildHistory() {
  const { error } = useNotification();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [polling, setPolling] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await buildService.getBuildHistory());
    } catch (err) {
      error(err.message || "Failed to load build history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openBuild = async (build) => {
    setSelected(build);
    if (build.status === "Running") {
      setPolling(true);
      const updated = await buildService.getBuildStatus(build.id);
      setSelected(updated);
      setPolling(false);
      load();
    }
  };

  return (
    <AppShell title="Build History" subtitle="Operations / Builds">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Build execution log</Typography>
          <Typography variant="body2" color="text.secondary">
            Track build status, duration, logs and triggered-by metadata.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
      </div>

      <div className="ph-surface">
        {loading ? (
          <Loader message="Loading build history…" />
        ) : (
          <BuildHistoryTable rows={rows} onRowClick={openBuild} />
        )}
      </div>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>
          Build {selected?.id}
          {selected?.status ? <StatusChip value={selected.status} /> : null}
        </DialogTitle>
        <DialogContent>
          {selected?.status === "Running" && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Progress</Typography>
              <LinearProgress variant={polling ? "indeterminate" : "determinate"} value={selected.progress || 35} sx={{ mt: 0.5, height: 8, borderRadius: 4 }} />
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Duration: {selected?.duration || "—"} · Triggered by: {selected?.triggeredBy || "—"}
          </Typography>
          <Box className="ph-build-logs">
            {(selected?.logs || ["[INFO] No logs available."]).map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
