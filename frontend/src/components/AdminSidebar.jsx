import { NavLink, useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", Icon: DashboardOutlinedIcon, end: true },
  { to: "/admin/users", label: "Users", Icon: PeopleOutlinedIcon },
  { to: "/admin/system", label: "System Health", Icon: MonitorHeartOutlinedIcon },
  { to: "/admin/audit", label: "Audit", Icon: AssignmentOutlinedIcon },
  { to: "/admin/settings", label: "Settings", Icon: TuneOutlinedIcon },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="ph-admin-sidebar">
      <div className="ph-admin-sidebar-brand">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div className="ph-logo-mark" style={{ width: 26, height: 26 }}>
            <ViewInArOutlinedIcon sx={{ fontSize: 14 }} />
          </div>
          <div>
            <div className="ph-admin-sidebar-brand-title">
              Pipeline<span style={{ color: "#58a6ff" }}>Hub</span>
            </div>
            <div className="ph-admin-sidebar-brand-sub">Administration</div>
          </div>
        </div>
      </div>

      <nav className="ph-admin-nav">
        <div className="ph-admin-nav-label">Administration</div>
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <div className={`ph-admin-nav-item${isActive ? " active" : ""}`}>
                <Icon />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="ph-admin-footer">
        <div
          className="ph-admin-nav-item"
          onClick={handleLogout}
          style={{ color: "#8b949e" }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleLogout()}
        >
          <LogoutOutlinedIcon />
          <span>Sign out</span>
        </div>
      </div>
    </aside>
  );
}
