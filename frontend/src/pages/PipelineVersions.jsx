import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AppShell from "../components/AppShell";
import StatusChip from "../components/StatusChip";
import VersionBadge from "../components/VersionBadge";
import Loader from "../components/Loader";
import { useNotification } from "../components/Notification";
import * as pipelineService from "../services/pipelineService";
import "../styles/dashboard.css";

export default function PipelineVersions() {
  const { success, warning, error } = useNotification();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [rollback, setRollback] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await pipelineService.getPipelineVersions());
    } catch (err) {
      error(err.message || "Failed to load versions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmRollback = async () => {
    if (!rollback) return;
    try {
      await pipelineService.rollbackPipelineVersion(rollback.name, rollback.version);
      success(`Rolled back ${rollback.name} to release ${rollback.version}. Dependent workloads unaffected.`);
      setRollback(null);
      load();
    } catch (err) {
      error(err.message || "Rollback failed.");
    }
  };

  const handleEdit = (row) => {
    const count = row.projects?.length || 0;
    if (count > 0) {
      warning(`Caution: ${count} projects currently depend on this release (${row.name}@${row.version}).`);
    }
  };

  return (
    <AppShell title="Pipeline Versions" subtitle="Governance & Independent Version Upgrades">
      {/* Page Header */}
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Pipeline Versions & Release Governance
            </Typography>
            <span className="gh-badge purple">Independent Upgrades</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Track independently versioned reusable components so individual projects choose when to upgrade without hidden coupling.
          </Typography>
        </Box>
      </div>

      {/* GitHub-style Version Impact Banner */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon sx={{ color: "#58a6ff" }} />}
        sx={{
          mb: 3,
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
          color: "#c9d1d9",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.3 }}>
          Decoupled Versioning Policy
        </Typography>
        <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }}>
          Pipeline component steps maintain independent semantic releases. Upstream modifications do not force-upgrade dependent repositories,
          eliminating unexpected build failures from hidden step coupling.
        </Typography>
      </Alert>

      {loading ? (
        <Loader message="Loading version release registry…" />
      ) : (
        <div className="ph-surface">
          <TableContainer className="ph-scroll-x" sx={{ border: "1px solid #30363d", borderRadius: "6px" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#161b22" }}>
                  <TableCell>Component Pipeline</TableCell>
                  <TableCell>Release Version</TableCell>
                  <TableCell>Released Date</TableCell>
                  <TableCell>Consuming Projects</TableCell>
                  <TableCell>Lifecycle Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={`${r.name}-${r.version}`}
                    hover
                    sx={{ "&:hover": { backgroundColor: "rgba(110, 118, 129, 0.08)" } }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#f0f6fc", fontFamily: "var(--ph-font-mono)" }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LayersOutlinedIcon sx={{ fontSize: 16, color: "#8b949e" }} />
                        <span>{r.name}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <VersionBadge version={r.version} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontSize: "12px", color: "#8b949e" }}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
                        <span>{r.created}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {r.projects && r.projects.length > 0 ? (
                          r.projects.map((proj) => (
                            <Box
                              key={proj}
                              component="span"
                              sx={{
                                display: "inline-block",
                                px: "6px",
                                py: "1px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontFamily: "var(--ph-font-mono)",
                                backgroundColor: "#21262d",
                                border: "1px solid #30363d",
                                color: "#c9d1d9",
                              }}
                            >
                              {proj}
                            </Box>
                          ))
                        ) : (
                          <span style={{ color: "#6e7681", fontSize: "12px" }}>—</span>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <StatusChip value={r.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />}
                          onClick={() => handleEdit(r)}
                          sx={{ fontSize: "11.5px" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<RestoreOutlinedIcon sx={{ fontSize: 13 }} />}
                          onClick={() => setRollback(r)}
                          sx={{
                            fontSize: "11.5px",
                            color: "#d29922",
                            borderColor: "rgba(210, 153, 34, 0.3)",
                            "&:hover": { borderColor: "#d29922", backgroundColor: "rgba(210, 153, 34, 0.1)" },
                          }}
                        >
                          Rollback
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      <Dialog open={Boolean(rollback)} onClose={() => setRollback(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: "#f0f6fc", fontWeight: 600, fontSize: "15px", borderBottom: "1px solid #30363d" }}>
          Confirm Version Rollback
        </DialogTitle>
        <DialogContent sx={{ mt: 1.5 }}>
          <Typography variant="body2" sx={{ color: "#c9d1d9", mb: 1 }}>
            Are you sure you want to roll back <strong>{rollback?.name}</strong> to release <strong>{rollback?.version}</strong>?
          </Typography>
          <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }}>
            This will switch the active version tag. Downstream projects explicitly pinned to this release will continue running safely.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #30363d" }}>
          <Button onClick={() => setRollback(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={confirmRollback}
            sx={{ backgroundColor: "#da3633", "&:hover": { backgroundColor: "#b62324" } }}
          >
            Confirm Rollback
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
