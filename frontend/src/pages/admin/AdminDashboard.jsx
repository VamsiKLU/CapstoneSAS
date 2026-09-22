import { Box, Divider, Stack, Typography } from "@mui/material";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AdminShell from "../../components/AdminShell";
import { useAuth } from "../../context/AuthContext";

// Mock admin overview data -- will be replaced with real data when database is connected
const MOCK_METRICS = [
  { label: "Registered Developers", value: "3", Icon: PeopleOutlinedIcon, color: "#58a6ff" },
  { label: "Active Pipelines", value: "18", Icon: AccountTreeOutlinedIcon, color: "#3fb950" },
  { label: "Platform Health", value: "Healthy", Icon: MonitorHeartOutlinedIcon, color: "#3fb950" },
  { label: "Audit Events (7d)", value: "142", Icon: AssignmentOutlinedIcon, color: "#bc8cff" },
];

const MOCK_RECENT_USERS = [
  { name: "Aarav Sharma", username: "aarav-sharma", role: "DEVELOPER", joined: "2026-09-20" },
  { name: "Jordan Lee", username: "jordan-lee", role: "DEVELOPER", joined: "2026-09-19" },
  { name: "Platform Administrator", username: null, role: "ADMIN", joined: "2026-09-18" },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AdminShell title="Overview">
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#f0f6fc", mb: 0.5 }}>
          Platform Overview
        </Typography>
        <Typography variant="body2" sx={{ color: "#8b949e" }}>
          Signed in as {user?.email}. Administration console for PipelineHub platform management.
        </Typography>
      </Box>

      {/* Metric cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 3,
          mb: 5,
        }}
      >
        {MOCK_METRICS.map((m) => (
          <Box
            key={m.label}
            sx={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "8px",
              p: 3,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  background: `${m.color}1a`,
                  border: `1px solid ${m.color}33`,
                  display: "grid",
                  placeItems: "center",
                  color: m.color,
                }}
              >
                <m.Icon sx={{ fontSize: 17 }} />
              </Box>
              <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 500 }}>
                {m.label}
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#f0f6fc" }}>
              {m.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Recent users section */}
      <Box
        sx={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid #30363d",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
            Recent Platform Users
          </Typography>
          <Typography variant="caption" sx={{ color: "#6e7681", fontFamily: "var(--ph-font-mono)" }}>
            Mock data
          </Typography>
        </Box>
        <Box sx={{ p: 1 }}>
          {MOCK_RECENT_USERS.map((u) => (
            <Box
              key={u.name}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderRadius: "6px",
                "&:hover": { background: "rgba(177, 186, 196, 0.06)" },
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#e6edf3" }}>
                  {u.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#8b949e", fontFamily: "var(--ph-font-mono)", fontSize: "11px" }}
                >
                  {u.username ? `@${u.username}` : "admin account"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="caption" sx={{ color: "#6e7681" }}>
                  {u.joined}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    px: "8px",
                    py: "2px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontFamily: "var(--ph-font-mono)",
                    fontWeight: 600,
                    background: u.role === "ADMIN" ? "rgba(188, 140, 255, 0.12)" : "rgba(56, 139, 253, 0.12)",
                    color: u.role === "ADMIN" ? "#bc8cff" : "#58a6ff",
                    border: u.role === "ADMIN" ? "1px solid rgba(188, 140, 255, 0.3)" : "1px solid rgba(56, 139, 253, 0.3)",
                    textTransform: "uppercase",
                  }}
                >
                  {u.role}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </AdminShell>
  );
}
