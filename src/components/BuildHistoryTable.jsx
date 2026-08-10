import { useMemo, useState } from "react";
import {
  Box, Button, IconButton, InputAdornment, MenuItem, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import StatusChip from "./StatusChip";
import EmptyState from "./EmptyState";
import { TableSkeleton } from "./Skeletons";

export default function BuildHistoryTable({ rows = [], loading = false, compact = false, onRowClick }) {
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

  const downloadLogs = (id) => {
    if (typeof window === "undefined") return;
    const blob = new Blob([`PipelineHub build log for ${id}\n[INFO] Build completed.\n`], { type: "text/plain" });
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
            placeholder="Search build id, project, user…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            sx={{ flex: 1 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <TextField select size="small" label="Status" value={status} sx={{ minWidth: 160 }}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            {["All", "Success", "Failed", "Running", "Cancelled"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" startIcon={<RefreshIcon />}>Refresh</Button>
        </Stack>
      )}

      {loading ? (
        <TableSkeleton rows={compact ? 4 : 8} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No builds found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <TableContainer className="ph-scroll-x">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Build ID</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Pipeline Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Triggered By</TableCell>
                  <TableCell>Date</TableCell>
                  {!compact && <TableCell align="right">Logs</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((r) => (
                  <TableRow key={r.id} hover sx={{ cursor: onRowClick ? "pointer" : "default" }} onClick={() => onRowClick?.(r)}>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>{r.id}</TableCell>
                    <TableCell>{r.project}</TableCell>
                    <TableCell>{r.version}</TableCell>
                    <TableCell><StatusChip value={r.status} /></TableCell>
                    <TableCell>{r.duration}</TableCell>
                    <TableCell>{r.triggeredBy}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    {!compact && (
                      <TableCell align="right">
                        <Tooltip title="Download logs">
                          <IconButton size="small" onClick={() => downloadLogs(r.id)}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
              onRowsPerPageChange={(e) => { setRpp(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </>
      )}
    </Box>
  );
}
