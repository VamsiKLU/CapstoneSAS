import { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import StatusChip from "./StatusChip";
import VersionBadge from "./VersionBadge";
import EmptyState from "./EmptyState";
import { TableSkeleton } from "./Skeletons";

export default function BuildHistoryTable({
  rows = [],
  loading = false,
  compact = false,
  onRowClick,
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(compact ? 5 : 10);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === "All" || r.status === status) &&
          ((r.project || "").toLowerCase().includes(query.toLowerCase()) ||
            (r.id || "").toLowerCase().includes(query.toLowerCase()) ||
            (r.triggeredBy || "").toLowerCase().includes(query.toLowerCase())),
      ),
    [rows, query, status],
  );

  const paged = compact ? filtered.slice(0, 5) : filtered.slice(page * rpp, page * rpp + rpp);

  const downloadLogs = (e, id) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const blob = new Blob(
      [`PipelineHub CI Build Execution Log for ${id}\n\n[INFO] Starting step runner...\n[INFO] Checking step contracts...\n[SUCCESS] Build verified without hidden coupling.\n`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `build-${id.replace("#", "")}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {!compact && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search by build ID (#4890), project, author…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: "#8b949e" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            sx={{ minWidth: 150 }}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            {["All", "Success", "Failed", "Running", "Cancelled"].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      )}

      {loading ? (
        <TableSkeleton rows={compact ? 5 : 8} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No builds found" description="Try adjusting your search query or status filter." />
      ) : (
        <>
          <TableContainer className="ph-scroll-x" sx={{ border: "1px solid #30363d", borderRadius: "6px" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#161b22" }}>
                  <TableCell sx={{ width: 100 }}>Build</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Date</TableCell>
                  {!compact && <TableCell align="right">Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      cursor: onRowClick ? "pointer" : "default",
                      "&:hover": { backgroundColor: "rgba(110, 118, 129, 0.08)" },
                    }}
                    onClick={() => onRowClick?.(r)}
                  >
                    <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontWeight: 600, color: "#58a6ff" }}>
                      {r.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#f0f6fc" }}>
                      {r.project}
                    </TableCell>
                    <TableCell>
                      <VersionBadge version={r.version} />
                    </TableCell>
                    <TableCell>
                      <StatusChip value={r.status} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontSize: "12px", color: "#8b949e" }}>
                      {r.duration}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontSize: "12px", color: "#8b949e" }}>
                      {r.triggeredBy}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "var(--ph-font-mono)", fontSize: "12px", color: "#8b949e" }}>
                      {r.date}
                    </TableCell>
                    {!compact && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View execution log">
                            <IconButton size="small" onClick={() => onRowClick?.(r)}>
                              <TerminalOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download raw log">
                            <IconButton size="small" onClick={(e) => downloadLogs(e, r.id)}>
                              <DownloadOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!compact && (
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rpp}
              onRowsPerPageChange={(e) => {
                setRpp(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                borderTop: "1px solid #30363d",
                color: "#8b949e",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: "12px",
                },
              }}
            />
          )}
        </>
      )}
    </Box>
  );
}
