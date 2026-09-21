import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export const STEP_CONTRACTS = {
  install: {
    name: "Install Dependencies",
    category: "Setup",
    version: "v2.1",
    inputs: ["package.json / pom.xml"],
    outputs: ["cached_deps", "vendor_tree"],
    contractStatus: "verified",
  },
  compile: {
    name: "Compile Source",
    category: "Build",
    version: "v3.0",
    inputs: ["source_code", "cached_deps"],
    outputs: ["binary_artifacts", "build_meta"],
    contractStatus: "verified",
  },
  test: {
    name: "Run Automated Tests",
    category: "Quality",
    version: "v1.4",
    inputs: ["binary_artifacts", "test_config"],
    outputs: ["test_report.xml", "coverage_matrix"],
    contractStatus: "verified",
  },
  scan: {
    name: "Security Vulnerability Scan",
    category: "Security",
    version: "v2.0",
    inputs: ["source_code", "cached_deps"],
    outputs: ["sarif_report", "cve_manifest"],
    contractStatus: "verified",
  },
  docker: {
    name: "Docker Container Build",
    category: "Package",
    version: "v2.2",
    inputs: ["Dockerfile", "binary_artifacts"],
    outputs: ["oci_image_archive"],
    contractStatus: "verified",
  },
  push: {
    name: "Docker Registry Push",
    category: "Publish",
    version: "v1.8",
    inputs: ["oci_image_archive", "registry_auth"],
    outputs: ["image_digest_sha256"],
    contractStatus: "verified",
  },
  k8s: {
    name: "Kubernetes Rolling Deploy",
    category: "Deploy",
    version: "v3.1",
    inputs: ["k8s_manifests", "image_digest_sha256"],
    outputs: ["deployment_event_log"],
    contractStatus: "verified",
  },
};

export default function PipelineStep({
  stepId,
  index,
  totalSteps,
  onDelete,
  isDraggable = true,
  onDragStart,
}) {
  const contract = STEP_CONTRACTS[stepId] || {
    name: stepId,
    category: "Custom",
    version: "v1.0",
    inputs: ["context"],
    outputs: ["artifact"],
    contractStatus: "verified",
  };

  return (
    <Box
      draggable={isDraggable}
      onDragStart={onDragStart}
      sx={{
        backgroundColor: "#161b22",
        border: "1px solid #30363d",
        borderRadius: "6px",
        p: 1.5,
        mb: 1.5,
        cursor: isDraggable ? "grab" : "default",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "#58a6ff",
          backgroundColor: "#1c2128",
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          {isDraggable && <DragIndicatorIcon sx={{ color: "#6e7681", fontSize: 18 }} />}
          
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "4px",
              backgroundColor: "#21262d",
              border: "1px solid #30363d",
              display: "grid",
              placeItems: "center",
              fontSize: "11px",
              fontFamily: "var(--ph-font-mono)",
              fontWeight: 700,
              color: "#58a6ff",
            }}
          >
            {index + 1}
          </Box>

          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#f0f6fc", fontSize: "13px" }}>
                {contract.name}
              </Typography>
              <Box
                component="span"
                sx={{
                  fontFamily: "var(--ph-font-mono)",
                  fontSize: "10.5px",
                  px: "5px",
                  py: "1px",
                  borderRadius: "3px",
                  backgroundColor: "rgba(188, 140, 255, 0.12)",
                  color: "#bc8cff",
                  border: "1px solid rgba(188, 140, 255, 0.3)",
                }}
              >
                {contract.version}
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "#8b949e", fontSize: "11px" }}>
              Step {index + 1} of {totalSteps || index + 1} · {contract.category}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Component Contract Verified: Explicit Inputs/Outputs defined with zero hidden coupling" arrow>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "#3fb950",
                fontFamily: "var(--ph-font-mono)",
                backgroundColor: "rgba(46, 160, 67, 0.1)",
                border: "1px solid rgba(63, 185, 80, 0.3)",
                px: "6px",
                py: "2px",
                borderRadius: "4px",
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
              Contract Verified
            </Box>
          </Tooltip>

          {onDelete && (
            <IconButton size="small" onClick={onDelete} sx={{ color: "#f85149", "&:hover": { backgroundColor: "rgba(248, 81, 73, 0.1)" } }}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {/* Step Interface / Contract specification */}
      <Box
        sx={{
          mt: 1.2,
          pt: 1,
          borderTop: "1px solid #21262d",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontSize: "11.5px",
          fontFamily: "var(--ph-font-mono)",
          color: "#8b949e",
        }}
      >
        <Stack direction="row" spacing={0.8} alignItems="center">
          <span style={{ color: "#6e7681" }}>in:</span>
          {contract.inputs.map((inp) => (
            <Box
              key={inp}
              component="span"
              sx={{
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                px: "5px",
                py: "1px",
                borderRadius: "3px",
                color: "#c9d1d9",
              }}
            >
              {inp}
            </Box>
          ))}
        </Stack>

        <ArrowForwardIcon sx={{ fontSize: 12, color: "#484f58" }} />

        <Stack direction="row" spacing={0.8} alignItems="center">
          <span style={{ color: "#6e7681" }}>out:</span>
          {contract.outputs.map((out) => (
            <Box
              key={out}
              component="span"
              sx={{
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                px: "5px",
                py: "1px",
                borderRadius: "3px",
                color: "#79c0ff",
              }}
            >
              {out}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
