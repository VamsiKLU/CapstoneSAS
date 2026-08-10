import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { motion } from "framer-motion";
import AppShell from "../components/AppShell";
import StatsCard from "../components/StatsCard";
import BuildHistoryTable from "../components/BuildHistoryTable";
import Loader from "../components/Loader";
import { builds, buildTrend, deployTrend, notifications, stats } from "../data/mockData";
import * as buildService from "../services/buildService";
import "../styles/dashboard.css";

const DOT = { error: "#d32f2f", warning: "#ed6c02", success: "#2e7d32", info: "#1976d2" };

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [recentBuilds, setRecentBuilds] = useState(builds);

  const load = async () => {
    setLoading(true);
    try {
      const history = await buildService.getBuildHistory();
      setRecentBuilds(history.slice(0, 10));
    } catch {
      setRecentBuilds(builds);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppShell title="Dashboard" subtitle="Platform / Overview">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Delivery overview</Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time health across pipelines, builds and deployments.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
      </div>

      <div className="ph-stats-grid">
        {stats.map((s, i) => (
          <StatsCard key={s.id} {...s} index={i} loading={loading} />
        ))}
      </div>

      <div className="ph-chart-row">
        {loading ? <Loader message="Loading charts…" /> : (
          <>
            <motion.div className="ph-panel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <div className="ph-panel-title">Build success rate (last 7 days)</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={buildTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="success" name="Successful" fill="#2e7d32" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="failed" name="Failed" fill="#d32f2f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="ph-panel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <div className="ph-panel-title">Deployments per week</div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={deployTrend}>
                  <defs>
                    <linearGradient id="gStaging" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1976d2" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#1976d2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="staging" stroke="#1976d2" fill="url(#gStaging)" strokeWidth={2} />
                  <Area type="monotone" dataKey="production" stroke="#0ea5e9" fill="url(#gProd)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </div>

      <div className="ph-dash-grid">
        <div className="ph-panel">
          <div className="ph-panel-title">
            Recent builds
            <Button size="small" component={Link} to="/build-history">View all</Button>
          </div>
          <BuildHistoryTable rows={recentBuilds} loading={loading} compact />
        </div>

        <div className="ph-panel">
          <div className="ph-panel-title">Notifications</div>
          <Stack>
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                className="ph-notif"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="ph-notif-dot" style={{ background: DOT[n.type] }} />
                <Box>
                  <Typography variant="body2" fontWeight={700}>{n.title}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">{n.body}</Typography>
                  <Typography variant="caption" display="block" color="text.disabled">{n.time}</Typography>
                </Box>
              </motion.div>
            ))}
          </Stack>
        </div>
      </div>
    </AppShell>
  );
}
