import { Box, Skeleton, Typography } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import "../styles/dashboard.css";

const ICONS = {
  folder: FolderOutlinedIcon,
  pipeline: AccountTreeOutlinedIcon,
  play: PlayCircleOutlineOutlinedIcon,
  rocket: RocketLaunchOutlinedIcon,
  error: ErrorOutlineOutlinedIcon,
  shield: ShieldOutlinedIcon,
};

const TONES = {
  primary: { bg: "rgba(31, 111, 235, 0.12)", border: "rgba(56, 139, 253, 0.3)", fg: "#58a6ff" },
  info: { bg: "rgba(56, 139, 253, 0.12)", border: "rgba(56, 139, 253, 0.3)", fg: "#79c0ff" },
  success: { bg: "rgba(46, 160, 67, 0.12)", border: "rgba(63, 185, 80, 0.3)", fg: "#3fb950" },
  warning: { bg: "rgba(210, 153, 34, 0.12)", border: "rgba(210, 153, 34, 0.3)", fg: "#e3b341" },
  error: { bg: "rgba(248, 81, 73, 0.12)", border: "rgba(248, 81, 73, 0.3)", fg: "#f85149" },
};

export default function StatsCard({ label, value, delta, tone = "primary", icon, loading }) {
  const Icon = ICONS[icon] || FolderOutlinedIcon;
  const t = TONES[tone] || TONES.primary;

  if (loading) {
    return (
      <div className="ph-stat-card">
        <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: "6px", bgcolor: "#21262d" }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="40%" height={24} sx={{ bgcolor: "#21262d" }} />
          <Skeleton width="70%" height={16} sx={{ bgcolor: "#21262d" }} />
        </Box>
      </div>
    );
  }

  return (
    <div className="ph-stat-card">
      <div className="ph-stat-icon" style={{ background: t.bg, borderColor: t.border, color: t.fg }}>
        <Icon sx={{ fontSize: 18 }} />
      </div>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <div className="ph-stat-value">{value}</div>
        <div className="ph-stat-label">{label}</div>
        {delta && <div className="ph-stat-delta">{delta}</div>}
      </Box>
    </div>
  );
}
