import { Box, Button, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

export default function EmptyState({ title = "Nothing here yet", description, actionLabel, onAction }) {
  return (
    <Box className="ph-empty">
      <InboxIcon sx={{ fontSize: 46, color: "#cbd5e1" }} />
      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      ) : null}
      {actionLabel ? (
        <Button variant="contained" sx={{ mt: 1 }} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}
