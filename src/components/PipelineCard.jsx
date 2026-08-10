import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountTreeIcon from "@mui/icons-material/AccountTreeOutlined";
import { motion } from "framer-motion";
import StatusChip from "./StatusChip";
import { stepLibrary } from "../data/mockData";

const labelOf = (id) => stepLibrary.find((s) => s.id === id)?.label || id;

export default function PipelineCard({ pipeline, index = 0, onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      whileHover={{ y: -4 }}
    >
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 2, display: "grid", placeItems: "center",
                bgcolor: "rgba(25,118,210,.12)", color: "primary.main",
              }}
            >
              <AccountTreeIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>{pipeline.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {pipeline.projects} projects · {pipeline.steps.length} steps
              </Typography>
            </Box>
            <Chip label={pipeline.version} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
            <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" flexWrap="wrap" gap={0.8}>
            {pipeline.steps.map((s) => (
              <Chip key={s} label={labelOf(s)} size="small" sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }} />
            ))}
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
            <StatusChip value={pipeline.status} />
            <Button size="small" variant="outlined" onClick={() => onEdit?.(pipeline)}>
              Edit template
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}
