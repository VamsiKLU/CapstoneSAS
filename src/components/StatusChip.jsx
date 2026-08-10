import Chip from "@mui/material/Chip";

const MAP = {
  passing: "success",
  success: "success",
  active: "success",
  healthy: "success",
  running: "info",
  queued: "warning",
  pending: "warning",
  supported: "info",
  pressure: "warning",
  degraded: "warning",
  mitigated: "info",
  deprecated: "default",
  cancelled: "default",
  failed: "error",
  open: "error",
  critical: "error",
  high: "warning",
  medium: "info",
  low: "success",
};

export default function StatusChip({ value, size = "small" }) {
  const color = MAP[String(value).toLowerCase()] || "default";
  return <Chip label={value} color={color} size={size} variant={color === "default" ? "outlined" : "filled"} sx={{ fontWeight: 600 }} />;
}
