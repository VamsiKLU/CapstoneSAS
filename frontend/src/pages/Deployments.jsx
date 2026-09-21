import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import CloudQueueOutlinedIcon from "@mui/icons-material/CloudQueueOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  const [form, setForm] = useState({ projectId: 1, imageTag: "2.9.1" });
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

  useEffect(() => {
    load();
  }, []);

  const deploy = async () => {
    setDeploying(true);
    try {
      await deploymentService.deploy(form);
      success("Kubernetes rolling deployment initiated.");
      setDeployOpen(false);
      load();
    } catch (err) {
      error(err.message || "Deployment initiation failed.");
    } finally {
      setDeploying(false);
    }
  };

  const rollback = async (d) => {
    try {
      await deploymentService.rollbackDeployment(d.project || d.projectId, "previous");
      success(`Rollback initiated for ${d.project || d.projectId}. Pods restarting.`);
    } catch (err) {
      error(err.message || "Rollback failed.");
    }
  };

  return (
    <AppShell title="Deployments" subtitle="Kubernetes workloads, container registries and rollback governance">
      {/* Header */}
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Deployments & Kubernetes Cluster Ops
            </Typography>
            <span className="gh-badge purple">Kubernetes v1.29</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Deploy containerized pipeline artifacts to Kubernetes clusters and govern rolling rollbacks.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<RocketLaunchOutlinedIcon sx={{ fontSize: 15 }} />}
          onClick={() => setDeployOpen(true)}
          sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
        >
          Deploy to Kubernetes
        </Button>
      </div>

      {/* DevOps Operational Metrics */}
      <div className="ph-stats-grid">
        <StatsCard
          label="Active Deployments"
          value={deployments.length}
          delta="Live pods running"
          tone="primary"
          icon="rocket"
          loading={loading}
        />
        <StatsCard
          label="Cluster CPU Usage"
          value="48.5%"
          delta="Peak 78% during tests"
          tone="warning"
          icon="play"
          loading={loading}
        />
        <StatsCard
          label="Cluster Memory"
          value="61.2%"
          delta="Stable within quota"
          tone="info"
          icon="error"
          loading={loading}
        />
        <StatsCard
          label="Rollbacks (30 Days)"
          value={rollbacks.length}
          delta="Zero downtime"
          tone="success"
          icon="pipeline"
          loading={loading}
        />
      </div>

      {/* Cluster Metrics & Live Workloads Grid */}
      <div className="ph-chart-row">
        {/* Resource Usage Line Chart */}
        <div className="ph-panel">
          <div className="ph-panel-title">
            <Stack direction="row" spacing={1} alignItems="center">
              <SpeedOutlinedIcon sx={{ fontSize: 16, color: "#58a6ff" }} />
              <span>Kubernetes Cluster Resource Telemetry</span>
            </Stack>
            <span style={{ fontSize: "11px", color: "#8b949e", fontFamily: "var(--ph-font-mono)" }}>
              Real-time metrics
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={resourceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#21262d" />
              <XAxis dataKey="t" tickLine={false} axisLine={{ stroke: "#30363d" }} tick={{ fill: "#8b949e", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={{ stroke: "#30363d" }} tick={{ fill: "#8b949e", fontSize: 11 }} unit="%" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#161b22",
                  borderColor: "#30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "12px",
                  boxShadow: "0 8px 24px rgba(1, 4, 9, 0.8)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#8b949e", paddingTop: 8 }} />
              <Line type="monotone" dataKey="cpu" stroke="#58a6ff" strokeWidth={2} dot={false} name="CPU Allocation (%)" />
              <Line type="monotone" dataKey="memory" stroke="#e3b341" strokeWidth={2} dot={false} name="RAM Allocation (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Live Workloads List */}
        <div className="ph-panel">
          <div className="ph-panel-title">
            <Stack direction="row" spacing={1} alignItems="center">
              <CloudQueueOutlinedIcon sx={{ fontSize: 16, color: "#3fb950" }} />
              <span>Live Workload Status</span>
            </Stack>
            <span className="gh-badge success">{deployments.length} running</span>
          </div>

          {loading ? (
            <Loader message="Querying Kubernetes nodes…" />
          ) : (
            <Stack spacing={1.5}>
              {deployments.map((d) => (
                <Box
                  key={d.id}
                  sx={{
                    p: 1.2,
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#f0f6fc", fontFamily: "var(--ph-font-mono)", fontSize: "12.5px" }}>
                        {d.project || `Project #${d.projectId}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#8b949e" }}>
                        Namespace: <span style={{ color: "#c9d1d9" }}>{d.namespace}</span> · Tag: <span style={{ color: "#58a6ff" }}>{d.imageTag}</span>
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusChip value={d.status} />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<UndoOutlinedIcon sx={{ fontSize: 12 }} />}
                        onClick={() => rollback(d)}
                        sx={{ fontSize: "11px", py: 0.2 }}
                      >
                        Rollback
                      </Button>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
                        <Typography variant="caption" sx={{ color: "#8b949e", fontSize: "10.5px" }}>CPU</Typography>
                        <Typography variant="caption" sx={{ color: "#c9d1d9", fontSize: "10.5px", fontFamily: "var(--ph-font-mono)" }}>{d.cpu || 0}%</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={d.cpu || 0}
                        sx={{ height: 4, borderRadius: 2, backgroundColor: "#21262d", "& .MuiLinearProgress-bar": { backgroundColor: "#58a6ff" } }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
                        <Typography variant="caption" sx={{ color: "#8b949e", fontSize: "10.5px" }}>Memory</Typography>
                        <Typography variant="caption" sx={{ color: "#c9d1d9", fontSize: "10.5px", fontFamily: "var(--ph-font-mono)" }}>{d.memory || 0}%</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={d.memory || 0}
                        sx={{ height: 4, borderRadius: 2, backgroundColor: "#21262d", "& .MuiLinearProgress-bar": { backgroundColor: "#e3b341" } }}
                      />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </div>
      </div>

      {/* Rollback History Table */}
      <div className="ph-panel" style={{ marginTop: 20 }}>
        <div className="ph-panel-title">
          <Stack direction="row" spacing={1} alignItems="center">
            <HistoryOutlinedIcon sx={{ fontSize: 16, color: "#8b949e" }} />
            <span>Rollback Audit History</span>
          </Stack>
          <span style={{ fontSize: "11px", color: "#8b949e" }}>Logged cluster events</span>
        </div>
        <TableContainer className="ph-scroll-x" sx={{ border: "1px solid #30363d", borderRadius: "6px" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#161b22" }}>
                <TableCell>Audit ID</TableCell>
                <TableCell>Service Name</TableCell>
                <TableCell>Source Release</TableCell>
                <TableCell>Target Release</TableCell>
                <TableCell>Triggered By</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rollbacks.map((r) => (
                <TableRow key={r.id} hover sx={{ "&:hover": { backgroundColor: "rgba(110, 118, 129, 0.08)" } }}>
                  <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontWeight: 600, color: "#58a6ff" }}>
                    {r.id}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#f0f6fc" }}>
                    {r.service}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "var(--ph-font-mono)", color: "#f85149" }}>
                    {r.from}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "var(--ph-font-mono)", color: "#3fb950" }}>
                    {r.to}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "var(--ph-font-mono)", color: "#8b949e" }}>
                    {r.by}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontSize: "12px", color: "#8b949e" }}>
                    {r.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Deploy to Kubernetes Modal */}
      <Dialog open={deployOpen} onClose={() => setDeployOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: "#f0f6fc", fontWeight: 600, fontSize: "15px", borderBottom: "1px solid #30363d" }}>
          Deploy Container to Kubernetes Cluster
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Target Project ID"
              type="number"
              fullWidth
              size="small"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: Number(e.target.value) })}
            />
            <TextField
              label="Docker Image Tag"
              fullWidth
              size="small"
              placeholder="e.g. 2.9.1, latest, sha256:abc..."
              value={form.imageTag}
              onChange={(e) => setForm({ ...form, imageTag: e.target.value })}
            />
            <Typography variant="caption" sx={{ color: "#8b949e" }}>
              Target cluster: <strong>production-east-k8s</strong> · Rolling update strategy: 25% max unavailable.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #30363d" }}>
          <Button onClick={() => setDeployOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={deploying}
            onClick={deploy}
            sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
          >
            {deploying ? "Deploying Workload…" : "Confirm Deployment"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
