import { Box, Typography } from "@mui/material";
import AdminShell from "../../components/AdminShell";

export default function AdminUsers() {
  return (
    <AdminShell title="Users">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#f0f6fc", mb: 0.5 }}>
          User Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#8b949e" }}>
          Developer accounts and access control. Full implementation in the next phase when the database is connected.
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
          User management will be implemented in the next phase when the database is connected.
        </Typography>
      </Box>
    </AdminShell>
  );
}
