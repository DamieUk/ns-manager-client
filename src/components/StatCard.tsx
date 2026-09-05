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
        p: 2.5,
        flex: '1 1 200px',
        bgcolor: highlight ? 'primary.main' : 'background.paper',
        color: highlight ? '#fff' : 'text.primary',
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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
      <Typography variant="h4">{value}</Typography>
    </Paper>
  );
}
