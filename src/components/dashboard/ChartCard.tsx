import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ChartCardProps {
  title: string;
  // One line that says what the chart shows right now.
  insight?: ReactNode;
  // Where to go for the details.
  to?: string;
  action?: string;
  span?: { xs?: number; md?: number; lg?: number };
  empty?: boolean;
  emptyText?: string;
  children: ReactNode;
}

// A dashboard tile: title, a one-line takeaway, the chart, and a link to the full list.
export function ChartCard({ title, insight, to, action = 'Детальніше', span, empty, emptyText = 'Даних поки немає', children }: ChartCardProps) {
  return (
    <Paper
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        gridColumn: {
          xs: `span ${span?.xs ?? 12}`,
          md: `span ${span?.md ?? 6}`,
          lg: `span ${span?.lg ?? span?.md ?? 6}`,
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {insight && (
            <Typography variant="body2" color="text.secondary">
              {insight}
            </Typography>
          )}
        </Box>
        {to && (
          <Typography component={Link} to={to} variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', pt: 0.5 }}>
            {action} →
          </Typography>
        )}
      </Stack>
      <Box sx={{ flexGrow: 1, mt: 1.5, minHeight: 0 }}>
        {empty ? (
          <Box sx={{ height: 200, display: 'grid', placeItems: 'center', color: 'text.secondary', bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="body2">{emptyText}</Typography>
          </Box>
        ) : (
          children
        )}
      </Box>
    </Paper>
  );
}
