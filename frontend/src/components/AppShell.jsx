import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../styles/global.css";

export default function AppShell({ title, subtitle, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 900) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  return (
    <div className="ph-shell">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="ph-main">
        <Navbar title={title} subtitle={subtitle} collapsed={collapsed} onToggleSidebar={toggle} />
        <main className="ph-content">{children}</main>
      </div>
    </div>
  );
}
