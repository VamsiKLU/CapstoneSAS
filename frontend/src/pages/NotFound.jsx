import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import "../styles/error.css";

export default function NotFound() {
  return (
    <Box className="ph-error-page">
      <Box sx={{ maxWidth: 440, textAlign: "center" }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: "#f85149", mb: 1 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#f0f6fc", fontFamily: "var(--ph-font-mono)", mb: 1 }}>
          404: Not Found
        </Typography>
        <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
          The requested route does not exist in the PipelineHub developer platform workspace.
        </Typography>
        <Button
          variant="contained"
          size="small"
          component={Link}
          to="/dashboard"
          startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 15 }} />}
          sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </Box>
  );
}
