import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./components/Notification";
import buildTheme from "./theme";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={buildTheme("light")}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
