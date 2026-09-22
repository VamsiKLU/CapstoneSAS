import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import AppShell from "../components/AppShell";
import StatusChip from "../components/StatusChip";
import VersionBadge from "../components/VersionBadge";
import DependencyIndicator from "../components/DependencyIndicator";
import Loader from "../components/Loader";
import { dependencies } from "../data/mockData";
import "../styles/dependencies.css";

const COUPLING_ANALYSIS = {
  "Pipeline v1": {
    declaredInputs: ["package.json", "src/"],
    declaredOutputs: ["dist/", "test-report.xml"],
    undeclaredDetected: "None. All artifact transfers explicit.",
    couplingRisk: "low",
    reason: "Steps 1-3 execute with strict input/output contract declarations.",
  },
  "Pipeline v2": {
    declaredInputs: ["pom.xml", "src/", "Dockerfile"],
    declaredOutputs: ["target/*.jar", "docker-image.tar"],
    undeclaredDetected: "Shared local Docker socket mounting without unpinned daemon contract.",
    couplingRisk: "medium",
    reason: "Step 4 assumes host Docker daemon without declaring socket requirement.",
  },
  "Pipeline v3": {
    declaredInputs: ["pom.xml", "src/", "k8s/"],
    declaredOutputs: ["target/*.jar", "oci_digest", "k8s_deploy_receipt"],
    undeclaredDetected: "Implicit environment variable (JAVA_HOME / JDK 21) shared between step 1 and step 4.",
    couplingRisk: "high",
    reason: "Step 4 implicitly relies on environment mutations performed in Step 1. Downstream projects upgrading independently may experience step failures.",
  },
};

export default function DependencyTracking() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => {
      setRows(dependencies);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const totalConsumers = rows.reduce((sum, r) => sum + (r.consumers?.length || 0), 0);

  const filteredRows = rows.filter((r) => {
    if (filter === "all") return true;
    return r.risk === filter;
  });

  return (
    <AppShell title="Dependency Tracking" subtitle="Visualize pipeline dependencies and identify potential hidden coupling">
      {/* Page Header */}
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Pipeline Dependency & Coupling Analysis
            </Typography>
            <span className="gh-badge purple">Hidden Coupling Detector</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Identify undeclared dependencies, implicit state sharing, and coupling risks between reusable pipeline steps.
          </Typography>
        </Box>

        {/* Filter pills */}
        <Stack direction="row" spacing={1}>
          {["all", "high", "medium", "low"].map((f) => (
            <Button
              key={f}
              size="small"
              variant={filter === f ? "contained" : "outlined"}
              onClick={() => setFilter(f)}
              sx={{
                fontSize: "11px",
                textTransform: "capitalize",
                backgroundColor: filter === f ? "#1f6feb" : "#21262d",
                borderColor: filter === f ? "#1f6feb" : "#30363d",
              }}
            >
              {f === "all" ? "All Versions" : `${f} risk`}
            </Button>
          ))}
        </Stack>
      </div>

      {/* Engineering Diagnostic Metric Bar */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.5, backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px" }}>
          <Typography variant="caption" sx={{ color: "#8b949e", textTransform: "uppercase", fontSize: "10.5px", fontWeight: 600 }}>
            Tracked Consumers
          </Typography>
          <Typography variant="h6" sx={{ color: "#f0f6fc", fontFamily: "var(--ph-font-mono)", fontWeight: 700 }}>
            {totalConsumers} Repositories
          </Typography>
          <Typography variant="caption" sx={{ color: "#3fb950" }}>
            Mapped across 3 release streams
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px" }}>
          <Typography variant="caption" sx={{ color: "#8b949e", textTransform: "uppercase", fontSize: "10.5px", fontWeight: 600 }}>
            Declared Step Contracts
          </Typography>
          <Typography variant="h6" sx={{ color: "#3fb950", fontFamily: "var(--ph-font-mono)", fontWeight: 700 }}>
            100% Compliant
          </Typography>
          <Typography variant="caption" sx={{ color: "#8b949e" }}>
            Input/output contracts registered
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px" }}>
          <Typography variant="caption" sx={{ color: "#8b949e", textTransform: "uppercase", fontSize: "10.5px", fontWeight: 600 }}>
            Undeclared Coupling Alerts
          </Typography>
          <Typography variant="h6" sx={{ color: "#f85149", fontFamily: "var(--ph-font-mono)", fontWeight: 700 }}>
            1 Active Warning
          </Typography>
          <Typography variant="caption" sx={{ color: "#e3b341" }}>
            Pipeline v3 requires env isolation
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px" }}>
          <Typography variant="caption" sx={{ color: "#8b949e", textTransform: "uppercase", fontSize: "10.5px", fontWeight: 600 }}>
            Independent Upgrade Safety
          </Typography>
          <Typography variant="h6" sx={{ color: "#58a6ff", fontFamily: "var(--ph-font-mono)", fontWeight: 700 }}>
            94.2% Stability
          </Typography>
          <Typography variant="caption" sx={{ color: "#8b949e" }}>
            Zero forced breaking changes
          </Typography>
        </Box>
      </Box>

      {/* Warning banner */}
      <Alert
        severity="warning"
        icon={<WarningAmberOutlinedIcon sx={{ color: "#e3b341" }} />}
        sx={{
          mb: 3,
          backgroundColor: "#161b22",
          border: "1px solid rgba(210, 153, 34, 0.4)",
          color: "#c9d1d9",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.3 }}>
          Hidden Coupling Impact Advisory
        </Typography>
        <Typography variant="caption" sx={{ color: "#8b949e" }}>
          When modifying shared pipeline step definitions, verify that no undeclared environment variables, container volumes,
          or implicitly produced files are assumed by downstream steps.
        </Typography>
      </Alert>

      {/* Dependency Relationship Map */}
      {loading ? (
        <Loader message="Synthesizing pipeline dependency graph…" />
      ) : (
        <div className="ph-dep-grid">
          {filteredRows.map((dep) => {
            const analysis = COUPLING_ANALYSIS[dep.version] || {
              declaredInputs: ["source"],
              declaredOutputs: ["artifact"],
              undeclaredDetected: "None",
              couplingRisk: dep.risk,
              reason: "Standard component flow.",
            };

            return (
              <div key={dep.version} className={`ph-dep-card risk-${dep.risk}`}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HubOutlinedIcon sx={{ fontSize: 18, color: "#58a6ff" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#f0f6fc", fontFamily: "var(--ph-font-mono)" }}>
                      {dep.version}
                    </Typography>
                  </Stack>
                  <StatusChip value={dep.risk === "high" ? "High Risk" : dep.risk === "medium" ? "Medium Risk" : "Low Risk"} />
                </Stack>

                {/* Pipeline to Projects Mapping */}
                <div className="ph-dep-flow">
                  <div className="ph-dep-stage-row">
                    <div className="ph-dep-node pipeline">{dep.version}</div>
                    <div className="ph-dep-arrow">→</div>
                    <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 600 }}>
                      Consuming Services ({dep.consumers.length}):
                    </Typography>
                  </div>
                  <div className="ph-dep-consumers">
                    {dep.consumers.map((c) => (
                      <span key={c} className="ph-dep-consumer-pill">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coupling Analysis Diagnostics */}
                <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #21262d" }}>
                  <Typography variant="caption" sx={{ color: "#8b949e", textTransform: "uppercase", fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", display: "block", mb: 0.6 }}>
                    Undeclared Step Coupling Diagnosis:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "12px", color: dep.risk === "high" ? "#f85149" : dep.risk === "medium" ? "#e3b341" : "#3fb950", mb: 1 }}>
                    {analysis.undeclaredDetected}
                  </Typography>

                  <Typography variant="caption" sx={{ color: "#8b949e", display: "block", lineHeight: 1.4 }}>
                    <strong>Impact Rationale:</strong> {analysis.reason}
                  </Typography>
                </Box>

                {/* Contract Summary */}
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1,
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontFamily: "var(--ph-font-mono)",
                  }}
                >
                  <Stack direction="row" spacing={0.8} sx={{ mb: 0.5 }}>
                    <span style={{ color: "#6e7681" }}>inputs:</span>
                    <span style={{ color: "#c9d1d9" }}>{analysis.declaredInputs.join(", ")}</span>
                  </Stack>
                  <Stack direction="row" spacing={0.8}>
                    <span style={{ color: "#6e7681" }}>outputs:</span>
                    <span style={{ color: "#79c0ff" }}>{analysis.declaredOutputs.join(", ")}</span>
                  </Stack>
                </Box>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
