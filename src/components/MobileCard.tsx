import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface MobileCardProps {
  title: ReactNode;
  // On the right of the title: a status chip or an amount.
  aside?: ReactNode;
  // Short lines under the title.
  lines?: ReactNode[];
  // Buttons at the bottom.
  actions?: ReactNode;
  onClick?: () => void;
}

// A list row as a card, for phones where a wide table doesn't fit.
export function MobileCard({ title, aside, lines = [], actions, onClick }: MobileCardProps) {
  return (
    <Paper onClick={onClick} sx={{ p: 2, cursor: onClick ? 'pointer' : undefined, '&:active': onClick ? { bgcolor: 'action.hover' } : undefined }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ minWidth: 0, fontWeight: 700 }}>{title}</Box>
        {aside && <Box sx={{ flexShrink: 0 }}>{aside}</Box>}
      </Stack>
      {lines.filter(Boolean).map((line, i) => (
        <Typography key={i} variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
          {line}
        </Typography>
      ))}
      {actions && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }} onClick={(e) => e.stopPropagation()}>
          {actions}
        </Stack>
      )}
    </Paper>
  );
}

// Cards stacked with the page's usual spacing, with a message when there are none.
export function MobileCardList({ empty, children }: { empty?: string; children: ReactNode[] }) {
  if (children.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        {empty ?? 'Нічого немає'}
      </Typography>
    );
  }
  return <Stack spacing={1.5}>{children}</Stack>;
}
