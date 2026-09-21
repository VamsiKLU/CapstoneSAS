import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import { useAuth } from "../context/AuthContext";
import "../styles/sidebar.css";

const NAV_GROUPS = [
  {
    group: "Workspace",
    items: [
      { to: "/dashboard", label: "Dashboard", Icon: SpaceDashboardOutlinedIcon },
    ],
  },
  {
    group: "Delivery",
    items: [
      { to: "/projects", label: "Projects", Icon: FolderOutlinedIcon },
      { to: "/pipelines", label: "Pipelines", Icon: AccountTreeOutlinedIcon },
      { to: "/pipeline-versions", label: "Pipeline Versions", Icon: LayersOutlinedIcon },
      { to: "/dependencies", label: "Dependency Tracking", Icon: HubOutlinedIcon },
    ],
  },
  {
    group: "Operations",
    items: [
      { to: "/build-history", label: "Build History", Icon: HistoryOutlinedIcon },
      { to: "/deployments", label: "Deployments", Icon: RocketLaunchOutlinedIcon },
    ],
  },
  {
    group: "Account",
    items: [
      { to: "/profile", label: "Profile", Icon: PersonOutlineOutlinedIcon },
      { to: "/settings", label: "Settings", Icon: SettingsOutlinedIcon },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {mobileOpen ? <div className="ph-sidebar-backdrop" onClick={onCloseMobile} /> : null}
      <aside className={`ph-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="ph-sidebar-brand">
          <div className="ph-logo-mark">
            <ViewInArOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
          {!collapsed && (
            <div className="ph-logo-text">
              <span className="brand-title">
                Pipeline<span className="accent">Hub</span>
              </span>
              <span className="ph-logo-sub">CLOUD-240 · CI Step Reuse</span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="ph-nav">
          {NAV_GROUPS.map((section) => (
            <div key={section.group} style={{ marginBottom: 8 }}>
              {!collapsed && <div className="ph-nav-label">{section.group}</div>}
              {section.items.map(({ to, label, Icon }) => {
                const active = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <Tooltip key={to} title={collapsed ? label : ""} placement="right" arrow>
                    <NavLink to={to} onClick={onCloseMobile} style={{ textDecoration: "none" }}>
                      <div className={`ph-nav-item${active ? " active" : ""}`}>
                        <Icon />
                        {!collapsed && <span>{label}</span>}
                      </div>
                    </NavLink>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer with user info & logout */}
        <div className="ph-sidebar-footer">
          <Tooltip title={collapsed ? "Sign out" : ""} placement="right" arrow>
            <div className="ph-nav-item" onClick={handleLogout} style={{ color: "#8b949e" }}>
              <LogoutOutlinedIcon />
              {!collapsed && <span>Sign out</span>}
            </div>
          </Tooltip>
        </div>
      </aside>
    </>
  );
}
