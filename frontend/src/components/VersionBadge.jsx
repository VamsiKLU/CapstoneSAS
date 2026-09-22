import Box from "@mui/material/Box";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

export default function VersionBadge({ version, showIcon = true, size = "small" }) {
  const isSmall = size === "small";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        px: isSmall ? "6px" : "8px",
        py: isSmall ? "1px" : "2px",
        borderRadius: "4px",
        border: "1px solid rgba(188, 140, 255, 0.3)",
        backgroundColor: "rgba(188, 140, 255, 0.1)",
        color: "#bc8cff",
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        fontSize: isSmall ? "11px" : "12px",
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {showIcon && <LocalOfferOutlinedIcon sx={{ fontSize: isSmall ? 10 : 12, opacity: 0.8 }} />}
      {version}
    </Box>
  );
}
