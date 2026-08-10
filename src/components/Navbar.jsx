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
  TextField,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import HelpIcon from "@mui/icons-material/HelpOutlineOutlined";
import AddIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar({ title, subtitle, onToggleSidebar, collapsed }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PH";

  return (
    <header className="ph-navbar">
      <div className="ph-navbar-inner">
        <IconButton onClick={onToggleSidebar} aria-label="Toggle navigation">
          {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>

        <Box sx={{ mr: 2, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {title}
          </Typography>
          {subtitle ? <div className="ph-breadcrumb">{subtitle}</div> : null}
        </Box>

        <div className="ph-search">
          <TextField
            size="small"
            fullWidth
            placeholder="Search projects, pipelines, builds…"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>

        <div className="ph-navbar-spacer" />

        <IconButton aria-label="New" onClick={() => navigate("/projects/create")}>
          <AddIcon />
        </IconButton>
        <IconButton aria-label="Notifications">
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton aria-label="Help"><HelpIcon /></IconButton>

        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Account">
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>
            {initials}
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" fontWeight={700}>{user?.name || "User"}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.role || "Developer"}</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setAnchor(null); navigate("/profile"); }}>Profile</MenuItem>
          <MenuItem onClick={() => { setAnchor(null); navigate("/settings"); }}>Settings</MenuItem>
          <MenuItem onClick={() => { setAnchor(null); logout(); navigate("/login"); }}>Logout</MenuItem>
        </Menu>
      </div>
    </header>
  );
}
