import { Box, Skeleton, Typography } from "@mui/material";
import { motion } from "framer-motion";
import FolderIcon from "@mui/icons-material/FolderCopyOutlined";
import AccountTreeIcon from "@mui/icons-material/AccountTreeOutlined";
import PlayIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import RocketIcon from "@mui/icons-material/RocketLaunchOutlined";
import ErrorIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ShieldIcon from "@mui/icons-material/GppMaybeOutlined";
import "../styles/dashboard.css";

const ICONS = {
  folder: FolderIcon,
  pipeline: AccountTreeIcon,
  play: PlayIcon,
  rocket: RocketIcon,
  error: ErrorIcon,
  shield: ShieldIcon,
};

const TONES = {
  primary: { bg: "rgba(25,118,210,.12)", fg: "#1976d2" },
  info: { bg: "rgba(2,132,199,.12)", fg: "#0284c7" },
  success: { bg: "rgba(46,125,50,.12)", fg: "#2e7d32" },
  warning: { bg: "rgba(237,108,2,.14)", fg: "#ed6c02" },
  error: { bg: "rgba(211,47,47,.12)", fg: "#d32f2f" },
};

export default function StatsCard({ label, value, delta, tone = "primary", icon, index = 0, loading }) {
  const Icon = ICONS[icon] || FolderIcon;
  const t = TONES[tone] || TONES.primary;

  if (loading) {
    return (
      <div className="ph-stat-card">
        <Skeleton variant="rounded" width={44} height={44} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" height={30} />
          <Skeleton width="80%" />
        </Box>
      </div>
    );
  }

  return (
    <motion.div
      className="ph-stat-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
    >
      <div className="ph-stat-icon" style={{ background: t.bg, color: t.fg }}>
        <Icon />
      </div>
      <Box sx={{ minWidth: 0 }}>
        <div className="ph-stat-value">{value}</div>
        <Typography className="ph-stat-label">{label}</Typography>
        <div className="ph-stat-delta">{delta}</div>
      </Box>
    </motion.div>
  );
}
