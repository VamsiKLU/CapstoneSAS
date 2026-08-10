import { useEffect, useState } from "react";
import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmberOutlined";
import { motion } from "framer-motion";
import AppShell from "../components/AppShell";
import Loader from "../components/Loader";
import { dependencies } from "../data/mockData";
import "../styles/dependencies.css";

export default function DependencyTracking() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setRows(dependencies);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const totalConsumers = rows.reduce((sum, r) => sum + (r.consumers?.length || 0), 0);

  return (
    <AppShell title="Dependency Tracking" subtitle="Delivery / Dependencies">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Pipeline dependency map</Typography>
          <Typography variant="body2" color="text.secondary">
            Prevent hidden coupling by visualizing which projects depend on each pipeline version.
          </Typography>
        </Box>
      </div>

      <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
        Before editing a pipeline, check impact: {totalConsumers} projects are currently mapped across all versions.
      </Alert>

      {loading ? (
        <Loader message="Analyzing dependencies…" />
      ) : (
        <div className="ph-dep-grid">
          {rows.map((dep, i) => (
            <motion.div
              key={dep.version}
              className={`ph-dep-card risk-${dep.risk}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>{dep.version}</Typography>
                <Chip label={`${dep.consumers.length} projects`} size="small" color={dep.risk === "high" ? "error" : dep.risk === "medium" ? "warning" : "success"} />
              </Stack>

              <div className="ph-dep-flow">
                <div className="ph-dep-node pipeline">{dep.version}</div>
                <div className="ph-dep-arrow">→</div>
                <div className="ph-dep-consumers">
                  {dep.consumers.map((c) => (
                    <Chip key={c} label={c} variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                  ))}
                </div>
              </div>

              {dep.consumers.length >= 2 && (
                <Typography variant="caption" color="error.main" sx={{ mt: 2, display: "block" }}>
                  Warning: This pipeline is used by {dep.consumers.length} projects.
                </Typography>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
