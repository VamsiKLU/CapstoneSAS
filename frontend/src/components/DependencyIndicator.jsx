import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

export default function DependencyIndicator({ risk = "low", details = "", compact = false }) {
  const config = {
    low: {
      color: "#3fb950",
      bg: "rgba(46, 160, 67, 0.12)",
      border: "rgba(63, 185, 80, 0.3)",
      label: "Zero Hidden Coupling",
      icon: CheckCircleOutlineIcon,
      desc: "All component inputs/outputs strictly declared in pipeline contract.",
    },
    medium: {
      color: "#e3b341",
      bg: "rgba(210, 153, 34, 0.12)",
      border: "rgba(210, 153, 34, 0.3)",
      label: "Potential Step Coupling",
      icon: WarningAmberOutlinedIcon,
      desc: "Shared environment assumptions detected across 2+ dependent projects.",
    },
    high: {
      color: "#f85149",
      bg: "rgba(248, 81, 73, 0.12)",
      border: "rgba(248, 81, 73, 0.3)",
      label: "Hidden Coupling Detected",
      icon: ErrorOutlineOutlinedIcon,
      desc: "Undeclared artifact dependency across steps could break on isolated upgrade.",
    },
  }[risk.toLowerCase()] || {
    color: "#8b949e",
    bg: "rgba(110, 118, 129, 0.12)",
    border: "#30363d",
    label: "Unverified",
    icon: WarningAmberOutlinedIcon,
    desc: "Awaiting contract verification.",
  };

  const IconComponent = config.icon;

  if (compact) {
    return (
      <Tooltip title={details || config.desc} arrow>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            px: "6px",
            py: "1px",
            borderRadius: "4px",
            fontSize: "11px",
            fontFamily: "var(--ph-font-mono)",
            fontWeight: 600,
            color: config.color,
            backgroundColor: config.bg,
            border: `1px solid ${config.border}`,
            cursor: "help",
          }}
        >
          <IconComponent sx={{ fontSize: 13 }} />
          {config.label}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "6px",
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <IconComponent sx={{ fontSize: 16, color: config.color }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: config.color, fontSize: "12px", fontFamily: "var(--ph-font-mono)" }}>
          {config.label}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mt: 0.5 }}>
        {details || config.desc}
      </Typography>
    </Box>
  );
}
