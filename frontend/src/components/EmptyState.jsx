import { Box, Button, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export default function EmptyState({ title = "Nothing here yet", description, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        p: 4,
        textAlign: "center",
        backgroundColor: "#161b22",
        border: "1px dashed #30363d",
        borderRadius: "6px",
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 36, color: "#6e7681", mb: 0.5 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: "#8b949e", maxWidth: 400, fontSize: "12px" }}>
          {description}
        </Typography>
      )}
      {actionLabel && (
        <Button variant="contained" size="small" sx={{ mt: 1.5 }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
