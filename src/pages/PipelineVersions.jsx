import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/RestoreOutlined";
import AppShell from "../components/AppShell";
import StatusChip from "../components/StatusChip";
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

  useEffect(() => { load(); }, []);

  const confirmRollback = async () => {
    if (!rollback) return;
    try {
      await pipelineService.rollbackPipelineVersion(rollback.name, rollback.version);
      success(`Rolled back ${rollback.name} to ${rollback.version}.`);
      setRollback(null);
    } catch (err) {
      error(err.message || "Rollback failed.");
    }
  };

  const handleEdit = (row) => {
    const count = row.projects?.length || 0;
    if (count > 0) {
      warning(`This pipeline is used by ${count} projects.`);
    }
  };

  return (
    <AppShell title="Pipeline Versions" subtitle="Delivery / Versions">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Version governance</Typography>
          <Typography variant="body2" color="text.secondary">
            Track active, supported and deprecated pipeline versions across projects.
          </Typography>
        </Box>
      </div>

      <Alert severity="info" sx={{ mb: 2 }}>
        Before editing a pipeline, review dependency impact. Deprecated versions may still power production workloads.
      </Alert>

      {loading ? (
        <Loader message="Loading pipeline versions…" />
      ) : (
        <div className="ph-surface">
          <TableContainer className="ph-scroll-x">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pipeline</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Projects</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={`${r.name}-${r.version}`} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{r.name}</TableCell>
                    <TableCell>{r.version}</TableCell>
                    <TableCell>{r.created}</TableCell>
                    <TableCell>{r.projects?.join(", ") || "—"}</TableCell>
                    <TableCell><StatusChip value={r.status} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => handleEdit(r)}>Edit</Button>
                        <Button size="small" startIcon={<RestoreIcon />} onClick={() => setRollback(r)}>
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

      <Dialog open={Boolean(rollback)} onClose={() => setRollback(null)}>
        <DialogTitle>Confirm rollback</DialogTitle>
        <DialogContent>
          Roll back <strong>{rollback?.name}</strong> to version <strong>{rollback?.version}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollback(null)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={confirmRollback}>Rollback</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
