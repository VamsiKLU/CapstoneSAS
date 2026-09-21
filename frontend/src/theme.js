import { createTheme } from "@mui/material/styles";

export const buildTheme = (mode = "dark") =>
  createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#1f6feb",
        light: "#58a6ff",
        dark: "#1158c7",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#8b949e",
        light: "#c9d1d9",
        dark: "#6e7681",
      },
      success: {
        main: "#238636",
        light: "#3fb950",
        dark: "#1a6527",
        contrastText: "#ffffff",
      },
      error: {
        main: "#da3633",
        light: "#f85149",
        dark: "#b62324",
        contrastText: "#ffffff",
      },
      warning: {
        main: "#d29922",
        light: "#e3b341",
        dark: "#9e6a03",
        contrastText: "#0d1117",
      },
      info: {
        main: "#58a6ff",
        light: "#79c0ff",
        dark: "#388bfd",
        contrastText: "#ffffff",
      },
      background: {
        default: "#0d1117",
        paper: "#161b22",
      },
      text: {
        primary: "#f0f6fc",
        secondary: "#8b949e",
        disabled: "#484f58",
      },
      divider: "#30363d",
      action: {
        hover: "rgba(177, 186, 196, 0.08)",
        selected: "rgba(177, 186, 196, 0.12)",
        disabled: "rgba(139, 148, 158, 0.3)",
        disabledBackground: "rgba(177, 186, 196, 0.08)",
      },
    },
    shape: { borderRadius: 6 },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      h4: { fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.015em", color: "#f0f6fc" },
      h5: { fontWeight: 600, fontSize: "1.3rem", letterSpacing: "-0.01em", color: "#f0f6fc" },
      h6: { fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.005em", color: "#f0f6fc" },
      subtitle1: { fontWeight: 600, fontSize: "0.925rem", color: "#f0f6fc" },
      subtitle2: { fontWeight: 500, fontSize: "0.85rem", color: "#8b949e" },
      body1: { fontSize: "0.875rem", color: "#c9d1d9" },
      body2: { fontSize: "0.8125rem", color: "#8b949e" },
      caption: { fontSize: "0.75rem", color: "#8b949e" },
      button: { textTransform: "none", fontWeight: 500, fontSize: "0.8125rem" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "#0d1117",
            color: "#c9d1d9",
            scrollbarColor: "#30363d #0d1117",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            boxShadow: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 6,
            boxShadow: "none",
            transition: "border-color 0.15s ease",
            "&:hover": {
              borderColor: "#484f58",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            boxShadow: "none",
            fontSize: "0.8125rem",
            padding: "5px 12px",
            lineHeight: 1.45,
            border: "1px solid transparent",
            "&:hover": {
              boxShadow: "none",
            },
          },
          containedPrimary: {
            backgroundColor: "#238636",
            borderColor: "rgba(240, 246, 252, 0.1)",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#2ea043",
              borderColor: "rgba(240, 246, 252, 0.15)",
            },
          },
          outlined: {
            borderColor: "#30363d",
            backgroundColor: "#21262d",
            color: "#c9d1d9",
            "&:hover": {
              backgroundColor: "#30363d",
              borderColor: "#8b949e",
              color: "#f0f6fc",
            },
          },
          text: {
            color: "#c9d1d9",
            "&:hover": {
              backgroundColor: "rgba(177, 186, 196, 0.08)",
              color: "#f0f6fc",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: "1px solid #21262d",
            color: "#c9d1d9",
            padding: "8px 14px",
            fontSize: "0.8125rem",
          },
          head: {
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#8b949e",
            backgroundColor: "#161b22",
            borderBottom: "1px solid #30363d",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: "rgba(110, 118, 129, 0.08) !important",
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: "#0d1117",
            borderRadius: 6,
            fontSize: "0.8125rem",
            color: "#f0f6fc",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#30363d",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#8b949e",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#58a6ff",
              borderWidth: "1px",
              boxShadow: "0 0 0 3px rgba(31, 111, 235, 0.3)",
            },
          },
          input: {
            padding: "7px 12px",
            "&::placeholder": {
              color: "#6e7681",
              opacity: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            color: "#8b949e",
            "&.Mui-focused": {
              color: "#58a6ff",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontSize: "0.75rem",
            fontWeight: 500,
            height: "22px",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 6,
            boxShadow: "0 16px 32px rgba(1, 4, 9, 0.85)",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(1, 4, 9, 0.75)",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            color: "#c9d1d9",
            padding: "6px 12px",
            borderRadius: 4,
            margin: "2px 4px",
            "&:hover": {
              backgroundColor: "#1f6feb",
              color: "#ffffff",
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: "#30363d",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            border: "1px solid #30363d",
            fontSize: "0.8125rem",
          },
          standardInfo: {
            backgroundColor: "rgba(56, 139, 253, 0.1)",
            borderColor: "rgba(56, 139, 253, 0.4)",
            color: "#79c0ff",
          },
          standardWarning: {
            backgroundColor: "rgba(210, 153, 34, 0.1)",
            borderColor: "rgba(210, 153, 34, 0.4)",
            color: "#e3b341",
          },
          standardError: {
            backgroundColor: "rgba(248, 81, 73, 0.1)",
            borderColor: "rgba(248, 81, 73, 0.4)",
            color: "#f85149",
          },
          standardSuccess: {
            backgroundColor: "rgba(63, 185, 80, 0.1)",
            borderColor: "rgba(63, 185, 80, 0.4)",
            color: "#56d364",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: "#8b949e",
            borderRadius: 6,
            padding: 6,
            "&:hover": {
              backgroundColor: "rgba(177, 186, 196, 0.12)",
              color: "#f0f6fc",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#21262d",
            border: "1px solid #30363d",
            color: "#f0f6fc",
            fontSize: "0.75rem",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(1, 4, 9, 0.5)",
          },
          arrow: {
            color: "#21262d",
            "&::before": {
              border: "1px solid #30363d",
            },
          },
        },
      },
    },
  });

export default buildTheme;
