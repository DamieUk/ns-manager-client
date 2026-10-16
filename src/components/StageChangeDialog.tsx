import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useState, type FormEvent } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { STAGES, stageIndex, stageInfo } from '../constants/stages';
import type { OrderStage, OrderSummary } from '../types/orders';

interface StageChangeDialogProps {
  order: Pick<OrderSummary, 'id' | 'number' | 'stage'>;
  // Move straight to this stage; otherwise the owner picks one.
  target?: OrderStage;
  onClose: () => void;
  onChanged: (order: OrderSummary) => void;
}

// Moves a batch to another stage with an optional comment for its history. The API refuses a
// forward move whose requirements aren't met and lists them; those are shown here.
export function StageChangeDialog({ order, target, onClose, onChanged }: StageChangeDialogProps) {
  const [stage, setStage] = useState<OrderStage | ''>(target ?? '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);

  const isCancel = stage === 'cancelled';
  const isBack = stage !== '' && stage !== 'cancelled' && order.stage !== 'cancelled' && stageIndex(stage) < stageIndex(order.stage);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stage) return;
    setSubmitting(true);
    setError(null);
    setBlockers([]);
    try {
      const res = await apiClient.post<OrderSummary>(`/orders/${order.id}/stage`, { stage, note: note.trim() || undefined });
      onChanged(res.data);
    } catch (err) {
      const list = axios.isAxiosError<{ blockers?: string[] }>(err) ? err.response?.data?.blockers : undefined;
      if (list?.length) setBlockers(list);
      else setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const title = isCancel
    ? `Скасувати партію № ${order.number}?`
    : stage
      ? `Партія № ${order.number} → «${stageInfo(stage).label}»`
      : `Етап партії № ${order.number}`;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!target && (
              <TextField select label="Етап" value={stage} onChange={(e) => setStage(e.target.value as OrderStage)} required>
                {STAGES.filter((s) => s.value !== order.stage).map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {s.hint}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
            )}
            {stage && !isCancel && (
              <Typography variant="body2" color="text.secondary">
                {stageInfo(stage).hint}
              </Typography>
            )}
            {isBack && <Alert severity="info">Партія повернеться на попередній етап.</Alert>}
            {blockers.length > 0 && (
              <Alert severity="warning">
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Перейти поки не можна:
                </Typography>
                {blockers.map((b) => (
                  <Typography key={b} variant="body2">
                    • {b}
                  </Typography>
                ))}
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label={isCancel ? 'Причина скасування' : 'Коментар'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              minRows={2}
              helperText="Залишиться в історії партії"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Назад
          </Button>
          <Button type="submit" variant="contained" color={isCancel ? 'error' : 'primary'} disabled={submitting || !stage}>
            {submitting ? <CircularProgress size={20} /> : isCancel ? 'Скасувати партію' : 'Перевести'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
