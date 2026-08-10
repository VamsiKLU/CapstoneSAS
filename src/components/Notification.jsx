import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const notify = useCallback((message, severity = "info") => {
    setToast({ open: true, message, severity });
  }, []);

  const close = () => setToast((t) => ({ ...t, open: false }));

  const value = useMemo(
    () => ({
      notify,
      success: (msg) => notify(msg, "success"),
      error: (msg) => notify(msg, "error"),
      warning: (msg) => notify(msg, "warning"),
      info: (msg) => notify(msg, "info"),
    }),
    [notify],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4500}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={close} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export default NotificationContext;
