import {
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import type { DailyProgress, DailyProgressInput } from '../types/dailyProgress';
import type { OrderSummary } from '../types/orders';

interface DailyProgressFormProps {
  orders: OrderSummary[];
  initialValue?: DailyProgress | null;
  submitting: boolean;
  onSubmit: (values: DailyProgressInput) => void;
  onCancel: () => void;
}

export function DailyProgressForm({ orders, initialValue, submitting, onSubmit, onCancel }: DailyProgressFormProps) {
  const [order, setOrder] = useState(initialValue?.order.id ?? '');
  const [date, setDate] = useState(initialValue ? initialValue.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [completed, setCompleted] = useState(initialValue?.completed ?? 0);
  const [needsRework, setNeedsRework] = useState(initialValue?.needsRework ?? 0);
  const [partiallyAssembled, setPartiallyAssembled] = useState(initialValue?.partiallyAssembled ?? 0);
  const [notes, setNotes] = useState(initialValue?.notes ?? '');

  const isValid = order !== '' && date !== '';

  function handleSubmit() {
    onSubmit({ order, date, completed, needsRework, partiallyAssembled, notes });
  }

  return (
    <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
      <TextField select label="Замовлення" value={order} onChange={(e) => setOrder(e.target.value)} required>
        {orders.map((o) => (
          <MenuItem key={o.id} value={o.id}>
            {o.client.name} — {o.product.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="date"
        label="Дата"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        required
      />
      <TextField
        type="number"
        label="Готово"
        value={completed}
        onChange={(e) => setCompleted(Number(e.target.value))}
        slotProps={{ htmlInput: { min: 0 } }}
      />
      <TextField
        type="number"
        label="Потребує виправлення"
        value={needsRework}
        onChange={(e) => setNeedsRework(Number(e.target.value))}
        slotProps={{ htmlInput: { min: 0 } }}
      />
      <TextField
        type="number"
        label="Не допаяно (ручні компоненти)"
        value={partiallyAssembled}
        onChange={(e) => setPartiallyAssembled(Number(e.target.value))}
        slotProps={{ htmlInput: { min: 0 } }}
      />
      <TextField
        label="Нотатки"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        multiline
        minRows={2}
      />
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={submitting}>
          Скасувати
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Зберегти'}
        </Button>
      </Stack>
    </Stack>
  );
}
