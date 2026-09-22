import AdminSidebar from "./AdminSidebar";
import { Box, Typography } from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

export default function AdminShell({ title, children }) {
  const { user } = useAuth();

  return (
    <div className="ph-admin-shell">
      <AdminSidebar />
      <div className="ph-admin-main">
        {/* Top bar */}
        <div className="ph-admin-topbar">
          <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18, color: "#bc8cff" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
            {title || "Administration"}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <span className="ph-admin-role-badge">Admin</span>
          <Typography variant="caption" sx={{ color: "#8b949e", ml: 1 }}>
            {user?.name || user?.email || "Administrator"}
          </Typography>
        </div>
        <main className="ph-admin-content">{children}</main>
      </div>
    </div>
  );
}
