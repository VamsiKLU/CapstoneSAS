import { Avatar, Box, Chip, Divider, Stack, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import { motion } from "framer-motion";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

export default function Profile() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PH";

  return (
    <AppShell title="Profile" subtitle="Account / Profile">
      <motion.div className="ph-profile-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "center", sm: "flex-start" }}>
          <Avatar sx={{ width: 88, height: 88, fontSize: 28, bgcolor: "primary.main" }}>{initials}</Avatar>
          <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="h5" fontWeight={700}>{user?.name || "User"}</Typography>
            <Chip label={user?.role || "Developer"} color={user?.role === "Admin" ? "primary" : "default"} sx={{ mt: 1, fontWeight: 700 }} />
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <EmailIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body1">{user?.email || "—"}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <BadgeIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">Role</Typography>
              <Typography variant="body1">{user?.role || "Developer"}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <BusinessIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">Department</Typography>
              <Typography variant="body1">{user?.department || "Engineering"}</Typography>
            </Box>
          </Stack>
        </Stack>
      </motion.div>
    </AppShell>
  );
}
