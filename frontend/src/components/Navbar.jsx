import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar({ title, subtitle, onToggleSidebar, collapsed }) {
  const [anchor, setAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PH";

  return (
    <header className="ph-navbar">
      <div className="ph-navbar-inner">
        {/* Toggle Sidebar Button */}
        <Tooltip title={collapsed ? "Expand navigation" : "Collapse navigation"}>
          <IconButton onClick={onToggleSidebar} size="small" aria-label="Toggle navigation" sx={{ color: "#8b949e" }}>
            {collapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Workspace / Context Selector */}
        <div className="ph-workspace-badge">
          <BusinessOutlinedIcon sx={{ fontSize: 14, color: "#8b949e" }} />
          <span className="org">acme-corp</span>
          <span style={{ color: "#484f58" }}>/</span>
          <span style={{ fontWeight: 600, color: "#f0f6fc" }}>cloud-240-ci</span>
        </div>

        {/* Breadcrumb path */}
        <Box sx={{ ml: 1, minWidth: 0, display: { xs: "none", sm: "block" } }}>
          <div className="ph-breadcrumb">
            <span style={{ color: "#8b949e" }}>PipelineHub</span>
            <span className="ph-breadcrumb-sep">/</span>
            <span style={{ color: "#f0f6fc", fontWeight: 600 }}>{title}</span>
            {subtitle && (
              <>
                <span className="ph-breadcrumb-sep">·</span>
                <span style={{ color: "#6e7681", fontSize: "11px" }}>{subtitle}</span>
              </>
            )}
          </div>
        </Box>

        <div className="ph-navbar-spacer" />

        {/* Search Input */}
        <div className="ph-search">
          <TextField
            size="small"
            fullWidth
            placeholder="Type / to search projects, pipelines, steps…"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: "#8b949e" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <span className="ph-search-kbd">/</span>
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>

        {/* Quick Add Project Button */}
        <Tooltip title="Create new project">
          <IconButton size="small" onClick={() => navigate("/projects/create")} sx={{ color: "#8b949e" }}>
            <AddCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="4 unread notifications">
          <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: "#8b949e" }}>
            <Badge
              badgeContent={4}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: 10,
                  height: 16,
                  minWidth: 16,
                  backgroundColor: "#1f6feb",
                  color: "#fff",
                },
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          PaperProps={{ sx: { width: 320, p: 0.5 } }}
        >
          <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid #30363d" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Notifications
            </Typography>
          </Box>
          <MenuItem onClick={() => { setNotifAnchor(null); navigate("/build-history"); }}>
            <Box sx={{ py: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#f85149", display: "block" }}>
                Build #4821 failed (payments-service)
              </Typography>
              <Typography variant="caption" sx={{ color: "#8b949e" }}>Unit tests failed · 4m ago</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => { setNotifAnchor(null); navigate("/dependencies"); }}>
            <Box sx={{ py: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#e3b341", display: "block" }}>
                Hidden Coupling Warning (Pipeline v3)
              </Typography>
              <Typography variant="caption" sx={{ color: "#8b949e" }}>Undeclared env dependency · 22m ago</Typography>
            </Box>
          </MenuItem>
        </Menu>

        {/* User Avatar & Dropdown */}
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          size="small"
          aria-label="Account menu"
          sx={{ p: 0.5, border: "1px solid #30363d" }}
        >
          <Avatar
            src={user?.avatar_url || undefined}
            alt={user?.name || "User"}
            sx={{ width: 26, height: 26, bgcolor: "#21262d", color: "#f0f6fc", fontSize: 11, fontWeight: 700 }}
          >
            {!user?.avatar_url ? initials : null}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          PaperProps={{ sx: { width: 220 } }}
        >
          <Box sx={{ px: 2, py: 1.2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#f0f6fc" }} noWrap>
              {user?.name || "Developer"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#8b949e", display: "block" }} noWrap>
              {user?.github_username ? `@${user.github_username}` : (user?.email || "Developer")}
            </Typography>
            <Box
              component="span"
              sx={{
                display: "inline-block",
                mt: 0.5,
                px: "6px",
                py: "1px",
                borderRadius: "10px",
                fontSize: "10px",
                fontFamily: "var(--ph-font-mono)",
                backgroundColor: "rgba(56, 139, 253, 0.15)",
                color: "#58a6ff",
                border: "1px solid rgba(56, 139, 253, 0.3)",
              }}
            >
              {user?.role || "DEVELOPER"}
            </Box>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { setAnchor(null); navigate("/profile"); }}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 16, mr: 1.2, color: "#8b949e" }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => { setAnchor(null); navigate("/settings"); }}>
            <SettingsOutlinedIcon sx={{ fontSize: 16, mr: 1.2, color: "#8b949e" }} />
            Settings
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={async () => { setAnchor(null); await logout(); navigate("/"); }} sx={{ color: "#f85149" }}>
            <LogoutOutlinedIcon sx={{ fontSize: 16, mr: 1.2, color: "#f85149" }} />
            Sign out
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
