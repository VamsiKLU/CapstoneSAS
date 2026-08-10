import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Tooltip from "@mui/material/Tooltip";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import FolderIcon from "@mui/icons-material/FolderCopyOutlined";
import AccountTreeIcon from "@mui/icons-material/AccountTreeOutlined";
import LayersIcon from "@mui/icons-material/LayersOutlined";
import HubIcon from "@mui/icons-material/HubOutlined";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import RocketIcon from "@mui/icons-material/RocketLaunchOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import HexagonIcon from "@mui/icons-material/HexagonOutlined";
import { useAuth } from "../context/AuthContext";
import "../styles/sidebar.css";

const NAV = [
  { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", Icon: DashboardIcon }] },
  {
    group: "Delivery",
    items: [
      { to: "/projects", label: "Projects", Icon: FolderIcon },
      { to: "/pipelines", label: "Pipelines", Icon: AccountTreeIcon },
      { to: "/pipeline-versions", label: "Pipeline Versions", Icon: LayersIcon },
      { to: "/dependencies", label: "Dependency Tracking", Icon: HubIcon },
    ],
  },
  {
    group: "Operations",
    items: [
      { to: "/build-history", label: "Build History", Icon: HistoryIcon },
      { to: "/deployments", label: "Deployments", Icon: RocketIcon },
      { to: "/profile", label: "Profile", Icon: PersonIcon },
      { to: "/settings", label: "Settings", Icon: SettingsIcon },
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
        <div className="ph-sidebar-brand">
          <div className="ph-logo-mark">
            <HexagonIcon fontSize="small" />
          </div>
          {!collapsed && (
            <div className="ph-logo-text">
              Pipeline<span>Hub</span>
            </div>
          )}
        </div>

        <nav className="ph-nav">
          {NAV.map((section) => (
            <div key={section.group}>
              {!collapsed && <div className="ph-nav-label">{section.group}</div>}
              {section.items.map(({ to, label, Icon }) => {
                const active = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <Tooltip key={to} title={collapsed ? label : ""} placement="right" arrow>
                    <NavLink to={to} onClick={onCloseMobile}>
                      <motion.div
                        whileHover={{ x: collapsed ? 0 : 3 }}
                        whileTap={{ scale: 0.98 }}
                        className={`ph-nav-item${active ? " active" : ""}`}
                      >
                        <Icon />
                        {!collapsed && <span>{label}</span>}
                      </motion.div>
                    </NavLink>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="ph-sidebar-footer">
          <Tooltip title={collapsed ? "Logout" : ""} placement="right" arrow>
            <div className="ph-nav-item" onClick={handleLogout}>
              <LogoutIcon />
              {!collapsed && <span>Logout</span>}
            </div>
          </Tooltip>
        </div>
      </aside>
    </>
  );
}
