import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress,
  MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunchOutlined";
import UndoIcon from "@mui/icons-material/UndoOutlined";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import AppShell from "../components/AppShell";
import StatsCard from "../components/StatsCard";
import StatusChip from "../components/StatusChip";
import Loader from "../components/Loader";
import { useNotification } from "../components/Notification";
import * as deploymentService from "../services/deploymentService";
import { resourceTrend, rollbacks } from "../data/mockData";
import "../styles/dashboard.css";

export default function Deployments() {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(true);
  const [deployments, setDeployments] = useState([]);
  const [deployOpen, setDeployOpen] = useState(false);
  const [form, setForm] = useState({ projectId: 1, imageTag: "latest" });
  const [deploying, setDeploying] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setDeployments(await deploymentService.getDeployments());
    } catch (err) {
      error(err.message || "Failed to load deployments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deploy = async () => {
    setDeploying(true);
    try {
      await deploymentService.deploy(form);
      success("Deployment initiated.");
      setDeployOpen(false);
      load();
    } catch (err) {
      error(err.message || "Deployment failed.");
    } finally {
      setDeploying(false);
    }
  };

  const rollback = async (d) => {
    try {
      await deploymentService.rollbackDeployment(d.project || d.projectId, "previous");
      success(`Rollback initiated for ${d.project || d.projectId}.`);
    } catch (err) {
      error(err.message || "Rollback failed.");
    }
  };

  return (
    <AppShell title="Deployments" subtitle="Operations / Deployments">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Deployment dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Deploy to Kubernetes, monitor CPU/memory usage, and rollback when needed.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<RocketLaunchIcon />} onClick={() => setDeployOpen(true)}>
          Deploy
        </Button>
      </div>

      <div className="ph-stats-grid">
        <StatsCard label="Active deployments" value={deployments.length} delta="Live workloads" tone="primary" icon="rocket" index={0} loading={loading} />
        <StatsCard label="Avg CPU usage" value="50%" delta="peak 88%" tone="warning" icon="play" index={1} loading={loading} />
        <StatsCard label="Avg memory" value="62%" delta="peak 92%" tone="error" icon="error" index={2} loading={loading} />
        <StatsCard label="Rollbacks (30d)" value={rollbacks.length} delta="Last: checkout-web" tone="info" icon="pipeline" index={3} loading={loading} />
      </div>

      <div className="ph-chart-row">
        <div className="ph-panel">
          <div className="ph-panel-title">Cluster resource usage</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={resourceTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} unit="%" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#1976d2" strokeWidth={2.5} dot={false} name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#ed6c02" strokeWidth={2.5} dot={false} name="Memory %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="ph-panel">
          <div className="ph-panel-title">Deployment status</div>
          {loading ? (
            <Loader message="Loading deployments…" />
          ) : (
            <Stack spacing={2}>
              {deployments.map((d) => (
                <Box key={d.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {d.project || `Project #${d.projectId}`} · {d.imageTag}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusChip value={d.status} />
                      <Button size="small" startIcon={<UndoIcon />} onClick={() => rollback(d)}>Rollback</Button>
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">CPU {d.cpu || 0}%</Typography>
                      <LinearProgress variant="determinate" value={d.cpu || 0} sx={{ height: 7, borderRadius: 4 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">Memory {d.memory || 0}%</Typography>
                      <LinearProgress color="warning" variant="determinate" value={d.memory || 0} sx={{ height: 7, borderRadius: 4 }} />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </div>
      </div>

      <div className="ph-panel" style={{ marginTop: 20 }}>
        <div className="ph-panel-title">Rollback history</div>
        <TableContainer className="ph-scroll-x">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell><TableCell>Service</TableCell><TableCell>From</TableCell>
                <TableCell>To</TableCell><TableCell>By</TableCell><TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rollbacks.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>{r.id}</TableCell>
                  <TableCell>{r.service}</TableCell>
                  <TableCell>{r.from}</TableCell>
                  <TableCell>{r.to}</TableCell>
                  <TableCell>{r.by}</TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Dialog open={deployOpen} onClose={() => setDeployOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Deploy to Kubernetes</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Project ID" type="number" fullWidth value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: Number(e.target.value) })} />
            <TextField label="Image tag" fullWidth value={form.imageTag}
              onChange={(e) => setForm({ ...form, imageTag: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeployOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={deploying} onClick={deploy}>
            {deploying ? "Deploying…" : "Deploy"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
