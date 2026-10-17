import { Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  highlight?: boolean;
}

export function StatCard({ label, value, icon, highlight }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        // Two per row on phones, as many as fit on wider screens.
        flex: { xs: '1 1 140px', sm: '1 1 200px' },
        minWidth: 0,
        bgcolor: highlight ? 'primary.main' : 'background.paper',
        color: highlight ? '#fff' : 'text.primary',
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1, sm: 2 }, gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: highlight ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
          {label}
        </Typography>
        <Stack
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: highlight ? 'rgba(255,255,255,0.15)' : 'background.default',
          }}
        >
          {icon}
        </Stack>
      </Stack>
      <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
        {value}
      </Typography>
    </Paper>
  );
}
