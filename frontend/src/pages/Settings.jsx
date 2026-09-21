import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AppShell from "../components/AppShell";
import { useNotification } from "../components/Notification";
import "../styles/forms.css";

export default function Settings() {
  const { success } = useNotification();
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("ph_settings");
      if (stored) return JSON.parse(stored);
    } catch {
      // Use fallback defaults
    }
    return {
      apiUrl: "http://localhost:8080/api",
      notifyBuilds: true,
      notifyDeploys: true,
      notifySecurity: true,
      couplingWarnings: true,
      darkMode: true,
    };
  });

  const save = () => {
    localStorage.setItem("ph_settings", JSON.stringify(settings));
    success("Settings saved successfully.");
  };

  return (
    <AppShell title="Settings" subtitle="Account / Platform Preferences">
      <div className="ph-page-head">
        <Box>
          <div className="ph-page-head-title">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#f0f6fc" }}>
              Platform Settings
            </Typography>
            <span className="gh-badge neutral">Configuration</span>
          </div>
          <Typography variant="body2" sx={{ color: "#8b949e", mt: 0.3 }}>
            Configure API endpoint connectivity, notification rules and developer preferences.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveOutlinedIcon sx={{ fontSize: 15 }} />}
          onClick={save}
          sx={{ backgroundColor: "#238636", "&:hover": { backgroundColor: "#2ea043" } }}
        >
          Save Changes
        </Button>
      </div>

      <div className="ph-form-card">
        {/* Mock API Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
            API & Service Gateway Configuration
          </Typography>
          <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 2 }}>
            Configure the target backend REST endpoint. When offline, PipelineHub automatically activates local mock data services.
          </Typography>

          <TextField
            label="Backend API Endpoint URL"
            fullWidth
            size="small"
            value={settings.apiUrl}
            onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
            sx={{ mb: 1.5 }}
          />

          <Alert
            severity="info"
            icon={<InfoOutlinedIcon sx={{ color: "#58a6ff" }} />}
            sx={{
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              color: "#c9d1d9",
              fontSize: "12px",
            }}
          >
            Currently running in <strong>Mock Mode</strong>. All data updates remain locally persistent in browser memory and local storage.
          </Alert>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Notifications */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
            Notification Triggers
          </Typography>
          <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 1.5 }}>
            Receive real-time alerts for CI build states, deployment events, and undeclared step coupling warnings.
          </Typography>

          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyBuilds}
                  onChange={(e) => setSettings({ ...settings, notifyBuilds: e.target.checked })}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#c9d1d9", fontSize: "13px" }}>
                  CI Build Failures & Success Alerts
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyDeploys}
                  onChange={(e) => setSettings({ ...settings, notifyDeploys: e.target.checked })}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#c9d1d9", fontSize: "13px" }}>
                  Kubernetes Deployment Rollout Events
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifySecurity}
                  onChange={(e) => setSettings({ ...settings, notifySecurity: e.target.checked })}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#c9d1d9", fontSize: "13px" }}>
                  Trivy / Snyk Security Vulnerability Alerts
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.couplingWarnings ?? true}
                  onChange={(e) => setSettings({ ...settings, couplingWarnings: e.target.checked })}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#c9d1d9", fontSize: "13px" }}>
                  Undeclared Step Coupling Detection Warnings (CLOUD-240)
                </Typography>
              }
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Display Preferences */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f0f6fc", mb: 0.5 }}>
            Display Preferences
          </Typography>
          <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 1.5 }}>
            GitHub developer-tool theme is active by default.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={true}
                disabled
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "#c9d1d9", fontSize: "13px" }}>
                GitHub Dark Theme (Active)
              </Typography>
            }
          />
        </Box>
      </div>
    </AppShell>
  );
}
