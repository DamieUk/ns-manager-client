import { Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface KpiTileProps {
  label: string;
  value: string;
  caption?: string;
  icon: ReactNode;
  tone?: 'primary' | 'default' | 'alert';
  to?: string;
}

// A headline number at the top of the dashboard.
export function KpiTile({ label, value, caption, icon, tone = 'default', to }: KpiTileProps) {
  const primary = tone === 'primary';
  return (
    <Paper
      component={to ? Link : 'div'}
      {...(to ? { to } : {})}
      sx={{
        p: 2.25,
        textDecoration: 'none',
        color: primary ? '#fff' : 'text.primary',
        bgcolor: primary ? 'primary.main' : 'background.paper',
        borderColor: tone === 'alert' ? 'error.light' : undefined,
        transition: 'transform 120ms ease',
        '&:hover': to ? { transform: 'translateY(-2px)' } : undefined,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: primary ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
          {label}
        </Typography>
        <Stack
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: primary ? 'rgba(255,255,255,0.15)' : 'background.default',
          }}
        >
          {icon}
        </Stack>
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 800, color: tone === 'alert' ? 'error.main' : undefined, lineHeight: 1.2 }} noWrap>
        {value}
      </Typography>
      {caption && (
        <Typography variant="caption" sx={{ color: primary ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>
          {caption}
        </Typography>
      )}
    </Paper>
  );
}
