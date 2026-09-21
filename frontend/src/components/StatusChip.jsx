import Box from "@mui/material/Box";

const STATUS_CONFIG = {
  // Build / Run statuses
  success: { label: "Success", bg: "rgba(46, 160, 67, 0.15)", border: "rgba(63, 185, 80, 0.4)", text: "#3fb950", dot: "#3fb950" },
  passing: { label: "Passing", bg: "rgba(46, 160, 67, 0.15)", border: "rgba(63, 185, 80, 0.4)", text: "#3fb950", dot: "#3fb950" },
  active: { label: "Active", bg: "rgba(46, 160, 67, 0.15)", border: "rgba(63, 185, 80, 0.4)", text: "#3fb950", dot: "#3fb950" },
  healthy: { label: "Healthy", bg: "rgba(46, 160, 67, 0.15)", border: "rgba(63, 185, 80, 0.4)", text: "#3fb950", dot: "#3fb950" },

  failed: { label: "Failed", bg: "rgba(248, 81, 73, 0.15)", border: "rgba(248, 81, 73, 0.4)", text: "#f85149", dot: "#f85149" },
  critical: { label: "Critical", bg: "rgba(248, 81, 73, 0.15)", border: "rgba(248, 81, 73, 0.4)", text: "#f85149", dot: "#f85149" },
  open: { label: "Open", bg: "rgba(248, 81, 73, 0.15)", border: "rgba(248, 81, 73, 0.4)", text: "#f85149", dot: "#f85149" },

  running: { label: "Running", bg: "rgba(210, 153, 34, 0.15)", border: "rgba(210, 153, 34, 0.4)", text: "#e3b341", dot: "#e3b341" },
  queued: { label: "Queued", bg: "rgba(210, 153, 34, 0.15)", border: "rgba(210, 153, 34, 0.4)", text: "#e3b341", dot: "#e3b341" },
  pending: { label: "Pending", bg: "rgba(210, 153, 34, 0.15)", border: "rgba(210, 153, 34, 0.4)", text: "#e3b341", dot: "#e3b341" },
  pressure: { label: "Pressure", bg: "rgba(210, 153, 34, 0.15)", border: "rgba(210, 153, 34, 0.4)", text: "#e3b341", dot: "#e3b341" },
  degraded: { label: "Degraded", bg: "rgba(210, 153, 34, 0.15)", border: "rgba(210, 153, 34, 0.4)", text: "#e3b341", dot: "#e3b341" },
  high: { label: "High Risk", bg: "rgba(248, 81, 73, 0.15)", border: "rgba(248, 81, 73, 0.4)", text: "#f85149", dot: "#f85149" },
  medium: { label: "Medium Risk", bg: "rgba(210, 153, 34, 0.15)", border: "rgba(210, 153, 34, 0.4)", text: "#e3b341", dot: "#e3b341" },
  low: { label: "Low Risk", bg: "rgba(46, 160, 67, 0.15)", border: "rgba(63, 185, 80, 0.4)", text: "#3fb950", dot: "#3fb950" },

  supported: { label: "Supported", bg: "rgba(56, 139, 253, 0.15)", border: "rgba(56, 139, 253, 0.4)", text: "#58a6ff", dot: "#58a6ff" },
  mitigated: { label: "Mitigated", bg: "rgba(56, 139, 253, 0.15)", border: "rgba(56, 139, 253, 0.4)", text: "#58a6ff", dot: "#58a6ff" },

  deprecated: { label: "Deprecated", bg: "rgba(110, 118, 129, 0.15)", border: "rgba(110, 118, 129, 0.4)", text: "#8b949e", dot: "#8b949e" },
  cancelled: { label: "Cancelled", bg: "rgba(110, 118, 129, 0.15)", border: "rgba(110, 118, 129, 0.4)", text: "#8b949e", dot: "#8b949e" },
};

export default function StatusChip({ value, size = "small", showDot = true }) {
  const key = String(value || "").toLowerCase();
  const conf = STATUS_CONFIG[key] || {
    label: value || "Unknown",
    bg: "rgba(110, 118, 129, 0.15)",
    border: "#30363d",
    text: "#8b949e",
    dot: "#8b949e",
  };

  const isSmall = size === "small";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        px: isSmall ? "7px" : "10px",
        py: isSmall ? "1.5px" : "3px",
        borderRadius: "12px",
        border: "1px solid",
        borderColor: conf.border,
        backgroundColor: conf.bg,
        color: conf.text,
        fontSize: isSmall ? "11px" : "12px",
        fontWeight: 600,
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
      }}
    >
      {showDot && (
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: conf.dot,
            flexShrink: 0,
            animation: key === "running" ? "pulse 1.8s infinite ease-in-out" : "none",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1, transform: "scale(1)" },
              "50%": { opacity: 0.4, transform: "scale(0.85)" },
            },
          }}
        />
      )}
      {value}
    </Box>
  );
}
