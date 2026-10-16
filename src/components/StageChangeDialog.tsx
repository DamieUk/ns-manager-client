import { Alert, MenuItem, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { STAGES, stageIndex, stageInfo } from '../constants/stages';
import type { OrderStage, OrderSummary } from '../types/orders';
import { fieldProps } from '../utils/formik';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';

interface StageChangeDialogProps {
  order: Pick<OrderSummary, 'id' | 'number' | 'stage'>;
  // Move straight to this stage; otherwise the owner picks one.
  target?: OrderStage;
  onClose: () => void;
  onChanged: (order: OrderSummary) => void;
}

interface StageValues {
  stage: OrderStage | '';
  note: string;
}

// Moves a batch to another stage with an optional comment for its history. The API refuses a
// forward move whose requirements aren't met and lists them; those are shown here.
export function StageChangeDialog({ order, target, onClose, onChanged }: StageChangeDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);

  const formik = useFormik<StageValues>({
    initialValues: { stage: target ?? '', note: '' },
    validate: (v) => (v.stage ? {} : { stage: 'Оберіть етап' }),
    onSubmit: async (v) => {
      setError(null);
      setBlockers([]);
      try {
        const res = await apiClient.post<OrderSummary>(`/orders/${order.id}/stage`, { stage: v.stage, note: v.note.trim() || undefined });
        onChanged(res.data);
      } catch (err) {
        const list = axios.isAxiosError<{ blockers?: string[] }>(err) ? err.response?.data?.blockers : undefined;
        if (list?.length) setBlockers(list);
        else setError(getErrorMessage(err));
      }
    },
  });

  const stage = formik.values.stage;
  const isCancel = stage === 'cancelled';
  const isBack = stage !== '' && stage !== 'cancelled' && order.stage !== 'cancelled' && stageIndex(stage) < stageIndex(order.stage);

  const title = isCancel
    ? `Скасувати партію № ${order.number}?`
    : target
      ? `Партія № ${order.number} → «${stageInfo(target).label}»`
      : `Етап партії № ${order.number}`;

  return (
    <FormDialog
      title={title}
      subtitle={`Зараз: ${stageInfo(order.stage).label}`}
      submitting={formik.isSubmitting}
      submitLabel={isCancel ? 'Скасувати партію' : 'Перевести'}
      submitColor={isCancel ? 'error' : 'primary'}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
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

      <FormSection columns={1}>
        {!target && (
          <TextField
            select
            label="Новий етап"
            {...fieldProps(formik, 'stage', stage ? stageInfo(stage).hint : undefined)}
            onChange={(e) => {
              formik.handleChange(e);
              setBlockers([]);
            }}
            required
          >
            {STAGES.filter((s) => s.value !== order.stage).map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
        )}
        {target && !isCancel && (
          <Typography variant="body2" color="text.secondary">
            {stageInfo(target).hint}
          </Typography>
        )}
        {isBack && <Alert severity="info">Партія повернеться на попередній етап.</Alert>}
        <TextField
          label={isCancel ? 'Причина скасування' : 'Коментар'}
          {...fieldProps(formik, 'note', 'Залишиться в історії партії')}
          multiline
          minRows={3}
        />
      </FormSection>
    </FormDialog>
  );
}
