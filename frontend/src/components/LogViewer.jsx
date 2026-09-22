import { useState } from "react";
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";

export default function LogViewer({ logs = [], buildId = "", duration = "", triggeredBy = "" }) {
  const [copied, setCopied] = useState(false);

  const formattedLogs = logs.length > 0 ? logs : ["[INFO] Initializing CI runner…", "[INFO] No output recorded."];

  const handleCopy = () => {
    navigator.clipboard?.writeText(formattedLogs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedLogs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pipelinehub-build-${buildId.replace("#", "")}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLineClass = (line) => {
    if (line.includes("[ERROR]") || line.includes("FAILED")) return "ph-log-error";
    if (line.includes("[SUCCESS]") || line.includes("PASSED")) return "ph-log-success";
    if (line.includes("[WARN]")) return "ph-log-warn";
    if (line.includes("[INFO]")) return "ph-log-info";
    return "";
  };

  return (
    <Box sx={{ border: "1px solid #30363d", borderRadius: "6px", overflow: "hidden", backgroundColor: "#0d1117" }}>
      {/* Log Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          backgroundColor: "#161b22",
          borderBottom: "1px solid #30363d",
          px: 2,
          py: 1,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TerminalOutlinedIcon sx={{ fontSize: 16, color: "#8b949e" }} />
          <Typography variant="caption" sx={{ fontFamily: "var(--ph-font-mono)", color: "#c9d1d9", fontWeight: 600 }}>
            {buildId ? `Execution Log: ${buildId}` : "Execution Log"}
          </Typography>
          {triggeredBy && (
            <Typography variant="caption" sx={{ color: "#8b949e", fontFamily: "var(--ph-font-mono)" }}>
              by @{triggeredBy}
            </Typography>
          )}
          {duration && (
            <Typography variant="caption" sx={{ color: "#8b949e", fontFamily: "var(--ph-font-mono)" }}>
              ({duration})
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={copied ? "Copied!" : "Copy raw log"}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? <CheckOutlinedIcon sx={{ fontSize: 14, color: "#3fb950" }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download log file">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Terminal Content */}
      <Box
        className="ph-build-logs"
        sx={{
          p: 1.5,
          fontFamily: "var(--ph-font-mono)",
          fontSize: "12px",
          lineHeight: 1.6,
          maxHeight: "360px",
          overflowY: "auto",
        }}
      >
        {formattedLogs.map((line, idx) => (
          <div key={idx} className="ph-log-line">
            <span className="ph-log-num">{idx + 1}</span>
            <span className={`ph-log-text ${getLineClass(line)}`}>{line}</span>
          </div>
        ))}
      </Box>
    </Box>
  );
}
