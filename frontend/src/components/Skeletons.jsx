import { Box, Skeleton, Stack } from "@mui/material";

export function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <Box sx={{ p: 1 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <Stack direction="row" spacing={2} key={r} sx={{ py: 1.2 }}>
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} height={22} sx={{ flex: c === 0 ? 1.4 : 1 }} />
          ))}
        </Stack>
      ))}
    </Box>
  );
}

export function CardSkeleton({ height = 220 }) {
  return <Skeleton variant="rounded" height={height} sx={{ borderRadius: 4 }} />;
}

export default TableSkeleton;
