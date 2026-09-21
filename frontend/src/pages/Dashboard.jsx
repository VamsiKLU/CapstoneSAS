import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "../components/AppShell";
import StatsCard from "../components/StatsCard";
import BuildHistoryTable from "../components/BuildHistoryTable";
import StatusChip from "../components/StatusChip";
import VersionBadge from "../components/VersionBadge";
import DependencyIndicator from "../components/DependencyIndicator";
import Loader from "../components/Loader";
import {
  builds,
  buildTrend,
  deployTrend,
  notifications,
  pipelineVersions,
  securityFindings,
  stats,
} from "../data/mockData";
import * as buildService from "../services/buildService";
import "../styles/dashboard.css";

const NOTIF_ICONS = {
  error: { color: "#f85149", dot: "#f85149" },
  warning: { color: "#e3b341", dot: "#e3b341" },
  success: { color: "#3fb950", dot: "#3fb950" },
  info: { color: "#58a6ff", dot: "#58a6ff" },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [recentBuilds, setRecentBuilds] = useState(builds);

  const load = async () => {
    setLoading(true);
    try {
      const history = await buildService.getBuildHistory();
      setRecentBuilds(history.slice(0, 8));
    } catch {
      setRecentBuilds(builds.slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell title="Dashboard" subtitle="Continuous Integration Step Reuse & Dependency Overview">
      {/* Page Header */}
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Dashboard
            </Typography>
            <span className="gh-badge purple">CLOUD-240</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Overview of pipeline execution, reusable components and dependency health.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={load}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            component={Link}
            to="/pipelines"
            sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
          >
            Compose Pipeline
          </Button>
        </Stack>
      </div>

      {/* Restrained GitHub Metric Cards */}
      <div className="ph-stats-grid">
        {stats.map((s) => (
          <StatsCard key={s.id} {...s} loading={loading} />
        ))}
      </div>

      {/* Research Domain: Hidden Coupling & Reusable Component Health Banner */}
      <Box
        sx={{
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "6px",
          p: 2,
          mb: 2,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "6px",
              backgroundColor: "rgba(188, 140, 255, 0.12)",
              color: "#bc8cff",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(188, 140, 255, 0.3)",
            }}
          >
            <HubOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Pipeline Step Coupling & Governance Status
            </Typography>
            <Typography variant="caption" sx={{ color: "#8b949e" }}>
              42 projects are consuming independently versioned steps. 1 step version requires coupling review.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <DependencyIndicator risk="medium" compact details="Pipeline v3: shared JDK environment variable between steps requires validation." />
          <Button
            component={Link}
            to="/dependencies"
            size="small"
            variant="outlined"
            endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 12 }} />}
            sx={{ fontSize: "11px" }}
          >
            Inspect Dependency Map
          </Button>
        </Stack>
      </Box>

      {/* Pipeline Activity & Deployments Visualizations */}
      <div className="ph-chart-row">
        {/* Success vs Failure Bar Chart */}
        <div className="ph-panel">
          <div className="ph-panel-title">
            <span>Pipeline Execution Success vs. Failure (Last 7 Days)</span>
            <span style={{ fontSize: "11px", color: "#8b949e", fontFamily: "var(--ph-font-mono)" }}>
              Aggregate builds
            </span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={buildTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#21262d" />
              <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: "#30363d" }} tick={{ fill: "#8b949e", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={{ stroke: "#30363d" }} tick={{ fill: "#8b949e", fontSize: 11 }} />
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
              <Bar dataKey="success" name="Successful builds" fill="#238636" radius={[3, 3, 0, 0]} />
              <Bar dataKey="failed" name="Failed builds" fill="#da3633" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Deployments Area Chart */}
        <div className="ph-panel">
          <div className="ph-panel-title">
            <span>Deployment Throughput (Staging vs. Production)</span>
            <span style={{ fontSize: "11px", color: "#8b949e", fontFamily: "var(--ph-font-mono)" }}>
              Weekly deploys
            </span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={deployTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gStaging" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f6feb" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1f6feb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3fb950" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3fb950" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#21262d" />
              <XAxis dataKey="week" tickLine={false} axisLine={{ stroke: "#30363d" }} tick={{ fill: "#8b949e", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={{ stroke: "#30363d" }} tick={{ fill: "#8b949e", fontSize: 11 }} />
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
              <Area type="monotone" dataKey="staging" stroke="#58a6ff" fill="url(#gStaging)" strokeWidth={2} name="Staging cluster" />
              <Area type="monotone" dataKey="production" stroke="#3fb950" fill="url(#gProd)" strokeWidth={2} name="Production cluster" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Grid: Recent Builds & Health / Alerts */}
      <div className="ph-dash-grid">
        {/* Recent Builds Table */}
        <div className="ph-panel">
          <div className="ph-panel-title">
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Recent CI Executions</span>
              <span className="gh-badge neutral">{recentBuilds.length} builds</span>
            </Stack>
            <Button size="small" component={Link} to="/build-history" sx={{ fontSize: "12px" }}>
              View all history →
            </Button>
          </div>
          <BuildHistoryTable rows={recentBuilds} loading={loading} compact />
        </div>

        {/* Right Side: Reusable Component Health & Findings */}
        <Stack spacing={2}>
          {/* Active Pipeline Versions Impact */}
          <div className="ph-panel">
            <div className="ph-panel-title">
              <span>Pipeline Version Distribution</span>
              <Button size="small" component={Link} to="/pipeline-versions" sx={{ fontSize: "11px" }}>
                Versions
              </Button>
            </div>
            <Stack spacing={1.2}>
              {pipelineVersions.map((pv) => (
                <Box
                  key={`${pv.name}-${pv.version}`}
                  sx={{
                    p: 1,
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#f0f6fc", fontFamily: "var(--ph-font-mono)" }}>
                      {pv.name}
                    </Typography>
                    <VersionBadge version={pv.version} />
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: "#8b949e" }}>
                      {pv.projects.length} dependent projects
                    </Typography>
                    <StatusChip value={pv.status} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </div>

          {/* Security Scan Findings */}
          <div className="ph-panel">
            <div className="ph-panel-title">
              <span>Security Scan Findings (Trivy / Snyk)</span>
              <SecurityOutlinedIcon sx={{ fontSize: 16, color: "#f85149" }} />
            </div>
            <Stack spacing={1}>
              {securityFindings.map((f) => (
                <Box
                  key={f.id}
                  sx={{
                    p: 1,
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontFamily: "var(--ph-font-mono)", fontWeight: 600, color: "#f85149", display: "block" }}>
                      {f.id} · {f.pkg}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#8b949e" }}>
                      Target: {f.project}
                    </Typography>
                  </Box>
                  <StatusChip value={f.severity} />
                </Box>
              ))}
            </Stack>
          </div>

          {/* Real-time Notifications */}
          <div className="ph-panel">
            <div className="ph-panel-title">
              <span>Platform Activity Log</span>
              <span style={{ fontSize: "11px", color: "#8b949e" }}>Live stream</span>
            </div>
            <Stack>
              {notifications.map((n) => {
                const conf = NOTIF_ICONS[n.type] || NOTIF_ICONS.info;
                return (
                  <div key={n.id} className="ph-notif">
                    <span className="ph-notif-dot" style={{ backgroundColor: conf.dot }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#f0f6fc", fontSize: "12px" }}>
                        {n.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }}>
                        {n.body}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6e7681", fontFamily: "var(--ph-font-mono)", fontSize: "10.5px" }}>
                        {n.time}
                      </Typography>
                    </Box>
                  </div>
                );
              })}
            </Stack>
          </div>
        </Stack>
      </div>
    </AppShell>
  );
}
