import { Component } from "react";
import { Box, Button, Typography } from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

/**
 * Catches unhandled render errors in any child component tree and shows a
 * friendly GitHub-styled error panel instead of a completely blank page.
 * Without this, a single component crash silently empties the viewport.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface in the browser console so developers can inspect
    console.error("[ErrorBoundary] Uncaught render error:", error, info);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    // Navigate to dashboard — safest recovery route
    window.location.href = "/dashboard";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const message = this.state.error?.message || "An unexpected error occurred.";

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: "#0d1117",
          p: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 480,
            textAlign: "center",
            border: "1px solid #30363d",
            borderRadius: "6px",
            backgroundColor: "#161b22",
            p: 4,
          }}
        >
          <WarningAmberOutlinedIcon sx={{ fontSize: 40, color: "#e3b341", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#8b949e",
              mb: 2,
              fontFamily: "var(--ph-font-mono, monospace)",
              fontSize: "12px",
              wordBreak: "break-word",
            }}
          >
            {message}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={this.handleReset}
            sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }
}
