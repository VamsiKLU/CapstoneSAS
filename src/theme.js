import { createTheme } from "@mui/material/styles";

export const buildTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#1976d2" },
      success: { main: "#2e7d32" },
      error: { main: "#d32f2f" },
      warning: { main: "#ed6c02" },
      background:
        mode === "light"
          ? { default: "#f4f6f8", paper: "#ffffff" }
          : { default: "#0b1120", paper: "#111827" },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif',
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: "0 1px 2px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.06)",
            transition: "box-shadow .25s ease, transform .25s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: { root: { borderRadius: 10, boxShadow: "none" } },
      },
      MuiTableCell: {
        styleOverrides: { head: { fontWeight: 700, fontSize: 13, letterSpacing: ".02em" } },
      },
    },
  });

export default buildTheme;
