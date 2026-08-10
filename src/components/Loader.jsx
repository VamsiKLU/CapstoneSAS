import { Box, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import "../styles/loader.css";

export default function Loader({ fullScreen = false, message = "Loading…", size = 44 }) {
  const content = (
    <motion.div
      className={`ph-loader${fullScreen ? " ph-loader-full" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <CircularProgress size={size} thickness={4} />
      {message ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      ) : null}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <Box className="ph-loader-screen">
        {content}
      </Box>
    );
  }

  return content;
}
