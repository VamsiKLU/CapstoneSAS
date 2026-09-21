import { Box, Button, Chip, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StatusChip from "./StatusChip";
import VersionBadge from "./VersionBadge";
import { stepLibrary } from "../data/mockData";

const labelOf = (id) => stepLibrary.find((s) => s.id === id)?.label || id;

export default function PipelineCard({ pipeline, onEdit, onClone }) {
  return (
    <Box
      sx={{
        backgroundColor: "#161b22",
        border: "1px solid #30363d",
        borderRadius: "6px",
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "border-color 0.15s ease",
        "&:hover": {
          borderColor: "#58a6ff",
        },
      }}
    >
      <div>
        {/* Card Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "6px",
                backgroundColor: "rgba(56, 139, 253, 0.1)",
                color: "#58a6ff",
                border: "1px solid rgba(56, 139, 253, 0.25)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "#f0f6fc",
                  fontFamily: "var(--ph-font-mono)",
                  fontSize: "13px",
                }}
                noWrap
              >
                {pipeline.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#8b949e" }}>
                {pipeline.projects} dependent projects · {pipeline.steps.length} reusable steps
              </Typography>
            </Box>
          </Stack>
          <VersionBadge version={pipeline.version} />
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Step Flow Preview */}
        <Typography variant="caption" sx={{ color: "#8b949e", fontWeight: 600, textTransform: "uppercase", fontSize: "10.5px", letterSpacing: "0.04em", display: "block", mb: 1 }}>
          Composed Step Contracts:
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.6} sx={{ mb: 2 }}>
          {pipeline.steps.map((s, idx) => (
            <Box
              key={s}
              sx={{
                backgroundColor: "#21262d",
                border: "1px solid #30363d",
                borderRadius: "4px",
                px: "6px",
                py: "2px",
                fontSize: "11px",
                fontFamily: "var(--ph-font-mono)",
                color: "#c9d1d9",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ color: "#6e7681", fontSize: "10px" }}>{idx + 1}.</span>
              {labelOf(s)}
            </Box>
          ))}
        </Stack>
      </div>

      {/* Card Footer */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1.5, borderTop: "1px solid #21262d" }}>
        <StatusChip value={pipeline.status} />
        <Stack direction="row" spacing={1}>
          {onClone && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />}
              onClick={() => onClone(pipeline)}
              sx={{ fontSize: "11.5px" }}
            >
              Clone
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />}
            onClick={() => onEdit?.(pipeline)}
            sx={{ fontSize: "11.5px" }}
          >
            Edit
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
