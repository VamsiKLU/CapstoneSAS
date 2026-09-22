import { Box, Typography } from "@mui/material";
import AdminShell from "../../components/AdminShell";

export default function AdminSettings() {
  return (
    <AdminShell title="Settings">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#f0f6fc", mb: 0.5 }}>
          Platform Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "#8b949e" }}>
          System-wide configuration for the PipelineHub platform.
        </Typography>
      </Box>
      <Box
        sx={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "#6e7681" }}>
          Platform settings will be implemented in the next phase.
        </Typography>
      </Box>
    </AdminShell>
  );
}
