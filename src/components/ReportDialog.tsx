import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { getErrorMessage } from '../api/errors';
import type { DailyProgress, DailyProgressInput } from '../types/dailyProgress';
import type { OrderSummary } from '../types/orders';
import { fieldProps } from '../utils/formik';
import { FileDropzone } from './FileDropzone';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

type ReportValues = Omit<DailyProgressInput, 'completed' | 'needsRework'> & { completed: number | ''; needsRework: number | '' };

function validate(values: ReportValues): Partial<Record<keyof ReportValues, string>> {
  const errors: Partial<Record<keyof ReportValues, string>> = {};
  if (!values.order) errors.order = 'Оберіть партію';
  for (const key of ['completed', 'needsRework'] as const) {
    const n = Number(values[key]);
    if (values[key] === '' || !Number.isInteger(n)) errors[key] = 'Вкажіть ціле число';
    else if (n < 0) errors[key] = 'Не може бути відʼємним';
  }
  return errors;
}

interface ReportDialogProps {
  orders: OrderSummary[];
  initialValue?: DailyProgress | null;
  // Errors propagate back here and are shown in the dialog.
  onSubmit: (values: DailyProgressInput) => Promise<void>;
  onClose: () => void;
}

// An employee's report for today on one batch: boards done, boards to fix, an optional photo.
export function ReportDialog({ orders, initialValue, onSubmit, onClose }: ReportDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const formik = useFormik<ReportValues>({
    initialValues: {
      order: initialValue?.order.id ?? '',
      completed: initialValue?.completed ?? 0,
      needsRework: initialValue?.needsRework ?? 0,
      notes: initialValue?.notes ?? '',
      photo: null,
    },
    validate,
    onSubmit: async (values) => {
      setError(null);
      try {
        await onSubmit({ ...values, completed: Number(values.completed), needsRework: Number(values.needsRework) });
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  return (
    <FormDialog
      title={initialValue ? 'Звіт' : 'Звіт за сьогодні'}
      subtitle={initialValue ? `${initialValue.order.client.name} · ${initialValue.order.product.name}` : undefined}
      submitting={formik.isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection>
        <TextField select label="Партія" {...fieldProps(formik, 'order')} disabled={Boolean(initialValue)} required sx={FULL_ROW}>
          {orders.map((o) => (
            <MenuItem key={o.id} value={o.id}>
              № {o.number} · {o.client.name} — {o.product.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField type="number" label="Зроблено плат" {...fieldProps(formik, 'completed')} slotProps={{ htmlInput: { min: 0 } }} />
        <TextField type="number" label="Потребує виправлення" {...fieldProps(formik, 'needsRework')} slotProps={{ htmlInput: { min: 0 } }} />
        <TextField label="Коментар" {...fieldProps(formik, 'notes', "Необов'язково")} multiline minRows={2} sx={FULL_ROW} />
        <Box sx={FULL_ROW}>
          <FileDropzone
            label="Фото проблеми: якість, брак, поломка (необов'язково)"
            accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] }}
            files={formik.values.photo ? [formik.values.photo] : []}
            onChange={(files) => formik.setFieldValue('photo', files[0] ?? null)}
          />
          {initialValue?.photo && !formik.values.photo && (
            <Typography variant="caption" color="text.secondary">
              Поточне фото: {initialValue.photo.originalName} (перетягніть нове, щоб замінити)
            </Typography>
          )}
        </Box>
      </FormSection>
    </FormDialog>
  );
}
