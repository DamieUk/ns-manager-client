import { Box, Paper, Stack, Typography } from '@mui/material';
import { stageInfo } from '../constants/stages';
import type { StageEvent } from '../types/orders';
import { formatDateTime } from '../utils/format';

// The batch's stage changes, newest first.
export function StageHistory({ events }: { events: StageEvent[] }) {
  const items = [...events].reverse();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Історія
      </Typography>
      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Подій ще немає
        </Typography>
      )}
      <Stack>
        {items.map((e, i) => {
          const to = stageInfo(e.toStage);
          return (
            <Stack key={e.id} direction="row" spacing={1.5}>
              <Stack sx={{ alignItems: 'center', pt: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: to.color, flexShrink: 0 }} />
                {i < items.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
              </Stack>
              <Box sx={{ pb: 2, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {e.fromStage ? `${stageInfo(e.fromStage).label} → ${to.label}` : `Створено: ${to.label}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(e.createdAt)}
                  {e.user ? ` · ${e.user.name}` : ''}
                </Typography>
                {e.note && (
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {e.note}
                  </Typography>
                )}
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
