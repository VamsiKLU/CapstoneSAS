import { useState } from "react";
import {
  Box, Divider, FormControlLabel, Stack, Switch, TextField, Typography, Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import AppShell from "../components/AppShell";
import { useNotification } from "../components/Notification";
import "../styles/forms.css";

export default function Settings() {
  const { success } = useNotification();
  const [settings, setSettings] = useState({
    apiUrl: "http://localhost:8080/api",
    notifyBuilds: true,
    notifyDeploys: true,
    notifySecurity: true,
    darkMode: false,
  });

  const save = () => {
    localStorage.setItem("ph_settings", JSON.stringify(settings));
    success("Settings saved.");
  };

  return (
    <AppShell title="Settings" subtitle="Account / Settings">
      <div className="ph-page-head">
        <Box>
          <Typography variant="h5">Platform settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure API endpoints, notifications and display preferences.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={save}>Save changes</Button>
      </div>

      <div className="ph-form-card">
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>API configuration</Typography>
        <TextField
          label="Backend API URL" fullWidth sx={{ mb: 3 }}
          value={settings.apiUrl}
          onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Notifications</Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={<Switch checked={settings.notifyBuilds} onChange={(e) => setSettings({ ...settings, notifyBuilds: e.target.checked })} />}
            label="Build status alerts"
          />
          <FormControlLabel
            control={<Switch checked={settings.notifyDeploys} onChange={(e) => setSettings({ ...settings, notifyDeploys: e.target.checked })} />}
            label="Deployment alerts"
          />
          <FormControlLabel
            control={<Switch checked={settings.notifySecurity} onChange={(e) => setSettings({ ...settings, notifySecurity: e.target.checked })} />}
            label="Security scan alerts"
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={<Switch checked={settings.darkMode} onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })} />}
          label="Dark mode (coming soon)"
        />
      </div>
    </AppShell>
  );
}
