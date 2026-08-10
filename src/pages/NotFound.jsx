import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { motion } from "framer-motion";
import "../styles/error.css";

export default function NotFound() {
  return (
    <Box className="ph-error-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <ErrorOutlineIcon sx={{ fontSize: 72, color: "primary.main", mb: 2 }} />
        <Typography variant="h3" fontWeight={800} gutterBottom>404</Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Page not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button variant="contained" component={Link} to="/dashboard">Back to dashboard</Button>
      </motion.div>
    </Box>
  );
}
