import { Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import type { DailyProgress, DailyProgressInput } from '../types/dailyProgress';
import type { OrderSummary } from '../types/orders';
import { FileDropzone } from './FileDropzone';

function validate(values: DailyProgressInput): Partial<Record<keyof DailyProgressInput, string>> {
  const errors: Partial<Record<keyof DailyProgressInput, string>> = {};
  if (!values.order) errors.order = "Обов'язкове поле";
  if (values.completed < 0) errors.completed = 'Не може бути відʼємним';
  if (values.needsRework < 0) errors.needsRework = 'Не може бути відʼємним';
  return errors;
}

interface ReportFormProps {
  orders: OrderSummary[];
  initialValue?: DailyProgress | null;
  submitting: boolean;
  onSubmit: (values: DailyProgressInput) => void;
  onCancel: () => void;
}

export function ReportForm({ orders, initialValue, submitting, onSubmit, onCancel }: ReportFormProps) {
  const formik = useFormik<DailyProgressInput>({
    initialValues: {
      order: initialValue?.order.id ?? '',
      completed: initialValue?.completed ?? 0,
      needsRework: initialValue?.needsRework ?? 0,
      notes: initialValue?.notes ?? '',
      photo: null,
    },
    validate,
    onSubmit,
  });

  return (
    <Stack component="form" spacing={2} onSubmit={formik.handleSubmit} sx={{ minWidth: 320, mt: 1 }}>
      <TextField
        select
        name="order"
        label="Замовлення"
        value={formik.values.order}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.order && Boolean(formik.errors.order)}
        helperText={formik.touched.order && formik.errors.order}
        disabled={Boolean(initialValue)}
        required
      >
        {orders.map((o) => (
          <MenuItem key={o.id} value={o.id}>
            {o.client.name} — {o.product.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        type="number"
        name="completed"
        label="Зроблено плат"
        value={formik.values.completed}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.completed && Boolean(formik.errors.completed)}
        helperText={formik.touched.completed && formik.errors.completed}
        slotProps={{ htmlInput: { min: 0 } }}
      />

      <TextField
        type="number"
        name="needsRework"
        label="Потребує виправлення"
        value={formik.values.needsRework}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.needsRework && Boolean(formik.errors.needsRework)}
        helperText={formik.touched.needsRework && formik.errors.needsRework}
        slotProps={{ htmlInput: { min: 0 } }}
      />

      <TextField
        name="notes"
        label="Коментар (необов'язково)"
        value={formik.values.notes}
        onChange={formik.handleChange}
        multiline
        minRows={2}
      />

      <FileDropzone
        label="Фото проблеми — якості, браку, поломки тощо (необов'язково)"
        accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] }}
        files={formik.values.photo ? [formik.values.photo] : []}
        onChange={(files) => formik.setFieldValue('photo', files[0] ?? null)}
      />
      {initialValue?.photo && !formik.values.photo && (
        <Typography variant="caption" color="text.secondary">
          Поточне фото: {initialValue.photo.originalName} (перетягніть нове, щоб замінити)
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={submitting}>
          Скасувати
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Зберегти'}
        </Button>
      </Stack>
    </Stack>
  );
}
