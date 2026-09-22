import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import AppShell from "../components/AppShell";
import BuildHistoryTable from "../components/BuildHistoryTable";
import LogViewer from "../components/LogViewer";
import StatusChip from "../components/StatusChip";
import VersionBadge from "../components/VersionBadge";
import Loader from "../components/Loader";
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

  useEffect(() => {
    load();
  }, []);

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
    <AppShell title="Build History" subtitle="Track pipeline executions, statuses, logs and trigger metadata">
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Build History
            </Typography>
            <span className="gh-badge neutral">{rows.length} total runs</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Track pipeline executions, statuses, logs and trigger metadata.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={load}
        >
          Refresh
        </Button>
      </div>

      <div className="ph-surface">
        {loading ? (
          <Loader message="Loading execution logs…" />
        ) : (
          <BuildHistoryTable rows={rows} onRowClick={openBuild} />
        )}
      </div>

      {/* Build Details & Terminal Log Modal */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "6px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #30363d",
            py: 1.5,
            px: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TerminalOutlinedIcon sx={{ color: "#58a6ff" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc", fontFamily: "var(--ph-font-mono)" }}>
              Build {selected?.id}
            </Typography>
            {selected?.status && <StatusChip value={selected.status} />}
            {selected?.version && <VersionBadge version={selected.version} />}
          </Stack>
          <IconButton size="small" onClick={() => setSelected(null)} sx={{ color: "#8b949e" }}>
            <CloseOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          {/* Progress bar if running */}
          {selected?.status === "Running" && (
            <Box sx={{ mb: 2, p: 1.5, backgroundColor: "#0d1117", border: "1px solid #30363d", borderRadius: "6px" }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: "#e3b341", fontWeight: 600 }}>
                  Build in progress ({selected.progress || 35}%)…
                </Typography>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>
                  Executing step contracts
                </Typography>
              </Stack>
              <LinearProgress
                variant={polling ? "indeterminate" : "determinate"}
                value={selected.progress || 35}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#21262d",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#d29922" },
                }}
              />
            </Box>
          )}

          {/* Execution Metadata Bar */}
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            sx={{
              p: 1.2,
              mb: 2,
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#8b949e",
            }}
          >
            <Stack direction="row" spacing={0.6} alignItems="center">
              <span style={{ color: "#6e7681" }}>Target Project:</span>
              <span style={{ color: "#f0f6fc", fontWeight: 600 }}>{selected?.project || "—"}</span>
            </Stack>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <TimerOutlinedIcon sx={{ fontSize: 14 }} />
              <span>{selected?.duration || "—"}</span>
            </Stack>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <PersonOutlineOutlinedIcon sx={{ fontSize: 14 }} />
              <span>{selected?.triggeredBy || "ci-bot"}</span>
            </Stack>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
              <span style={{ fontFamily: "var(--ph-font-mono)" }}>{selected?.date || "—"}</span>
            </Stack>
          </Stack>

          {/* Dark Terminal Log Experience */}
          <LogViewer
            logs={selected?.logs || [
              "[INFO] Cloning repository into ephemeral runner workspace...",
              `[INFO] Target: ${selected?.project || "repo"} (${selected?.version || "v1"})`,
              "[INFO] Validating reusable step contract definitions...",
              "[INFO] Step 1: Install Dependencies -> Verified cache checksum",
              "[INFO] Step 2: Compile -> Code compiled into target/classes",
              "[INFO] Step 3: Test -> 48 tests passed (0 failures)",
              "[INFO] Step 4: Security Scan -> Trivy vulnerability scan clean",
              "[INFO] Step 5: Docker Build -> Container tagged registry.acme.io/service:v3",
              "[SUCCESS] Pipeline build execution completed with zero hidden coupling.",
            ]}
            buildId={selected?.id}
            duration={selected?.duration}
            triggeredBy={selected?.triggeredBy}
          />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
