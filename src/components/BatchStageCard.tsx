import ArrowForwardIcon from '@mui/icons-material/ArrowForwardOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import { Alert, Box, Button, Paper, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useState } from 'react';
import { PIPELINE, stageIndex, stageInfo } from '../constants/stages';
import type { OrderStage, OrderSummary } from '../types/orders';
import { daysSince, formatDateTime } from '../utils/format';
import { StageChangeDialog } from './StageChangeDialog';

interface BatchStageCardProps {
  order: OrderSummary;
  canChange: boolean;
  onChanged: (order: OrderSummary) => void;
}

// Where the batch is in the pipeline and, for owners, the way on: the next stage (with what
// still blocks it), any other stage, or cancellation.
export function BatchStageCard({ order, canChange, onChanged }: BatchStageCardProps) {
  const [dialog, setDialog] = useState<{ target?: OrderStage } | null>(null);
  const current = stageIndex(order.stage);
  const cancelled = order.stage === 'cancelled';
  const blockers = order.blockers ?? [];

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <Typography variant="h6">Етап: {stageInfo(order.stage).label}</Typography>
        <Typography variant="caption" color="text.secondary" title={formatDateTime(order.stageChangedAt)}>
          на етапі {daysSince(order.stageChangedAt)}
        </Typography>
      </Stack>

      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Stepper activeStep={cancelled ? -1 : current} alternativeLabel sx={{ minWidth: 820 }}>
          {PIPELINE.map((s, i) => (
            <Step key={s.value} completed={!cancelled && (i < current || order.stage === 'done')}>
              <StepLabel
                slotProps={{
                  label: { sx: { fontSize: 12, fontWeight: i === current ? 700 : 500 } },
                }}
              >
                {s.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {cancelled && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Партію скасовано. Її можна відновити на будь-який етап.
        </Alert>
      )}

      {canChange && order.nextStage && blockers.length > 0 && (
        <Alert severity="warning" icon={<LockIcon fontSize="inherit" />} sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Щоб перейти на «{stageInfo(order.nextStage).label}»:
          </Typography>
          {blockers.map((b) => (
            <Typography key={b} variant="body2">
              • {b}
            </Typography>
          ))}
        </Alert>
      )}

      {canChange && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
          {order.nextStage && (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              disabled={blockers.length > 0}
              onClick={() => setDialog({ target: order.nextStage! })}
            >
              Далі: {stageInfo(order.nextStage).label}
            </Button>
          )}
          <Button variant="outlined" onClick={() => setDialog({})}>
            {cancelled ? 'Відновити партію' : 'Інший етап'}
          </Button>
          {!cancelled && order.stage !== 'done' && (
            <Button color="error" onClick={() => setDialog({ target: 'cancelled' })}>
              Скасувати партію
            </Button>
          )}
        </Stack>
      )}

      {dialog && (
        <StageChangeDialog
          order={order}
          target={dialog.target}
          onClose={() => setDialog(null)}
          onChanged={(updated) => {
            setDialog(null);
            onChanged(updated);
          }}
        />
      )}
    </Paper>
  );
}
