import { Alert, Box, Checkbox, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { OrderSummary } from '../types/orders';
import { fieldProps, REQUIRED } from '../utils/formik';
import { dayInput, formatMoney } from '../utils/format';
import { round2, vatOf } from '../utils/money';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

interface LineValues {
  orderId: string;
  include: boolean;
  description: string;
  quantity: string;
}

interface ShipmentValues {
  shippedAt: string;
  carrier: string;
  trackingNumber: string;
  note: string;
  lines: LineValues[];
}

interface ShipmentDialogProps {
  client: { id: string; name: string };
  // The batch the note is started from: ticked by default.
  orderId?: string;
  vatRate: number;
  onClose: () => void;
  onSaved: () => void;
}

const remainingOf = (o: OrderSummary) => o.quantity - (o.shipped ?? 0);

// A delivery note for one client: boards from any of its batches at the shipping stage, each at the
// batch's agreed price. The number (ДДММРР-N) is given on saving.
export function ShipmentDialog({ client, orderId, vatRate, onClose, onSaved }: ShipmentDialogProps) {
  const [batches, setBatches] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<ShipmentValues>({
    initialValues: { shippedAt: dayInput(), carrier: 'Нова пошта', trackingNumber: '', note: '', lines: [] },
    validate: (v) => {
      const errors: Record<string, string> = {};
      if (!v.shippedAt) errors.shippedAt = REQUIRED;
      const included = v.lines.filter((l) => l.include);
      if (included.length === 0) errors.lines = 'Оберіть хоча б одну партію';
      v.lines.forEach((l, i) => {
        if (!l.include) return;
        const batch = batches?.find((b) => b.id === l.orderId);
        const n = Number(l.quantity);
        if (!Number.isInteger(n) || n < 1) errors[`quantity${i}`] = 'Ціле число більше нуля';
        else if (batch && n > remainingOf(batch)) errors[`quantity${i}`] = `Залишилось ${remainingOf(batch)} шт.`;
        if (!l.description.trim()) errors[`description${i}`] = REQUIRED;
      });
      return errors;
    },
    onSubmit: async (v) => {
      setError(null);
      try {
        await apiClient.post('/shipments', {
          client: client.id,
          shippedAt: v.shippedAt,
          carrier: v.carrier.trim(),
          trackingNumber: v.trackingNumber.trim(),
          note: v.note.trim(),
          lines: v.lines.filter((l) => l.include).map((l) => ({ order: l.orderId, quantity: Number(l.quantity), description: l.description.trim() })),
        });
        onSaved();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  useEffect(() => {
    apiClient
      .get<OrderSummary[]>('/orders', { params: { client: client.id, stage: 'shipping' } })
      .then((res) => {
        const open = res.data.filter((o) => remainingOf(o) > 0);
        setBatches(open);
        formik.setFieldValue(
          'lines',
          open.map((o) => ({ orderId: o.id, include: orderId ? o.id === orderId : open.length === 1, description: o.product.name, quantity: String(remainingOf(o)) }))
        );
      })
      .catch((err) => setError(getErrorMessage(err)));
    // Loads once for the client; formik is stable enough here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id, orderId]);

  const lineError = (name: string) => {
    const errors = formik.errors as Record<string, string | undefined>;
    return formik.submitCount > 0 ? errors[name] : undefined;
  };

  const net = round2(
    formik.values.lines.filter((l) => l.include).reduce((sum, l) => {
      const batch = batches?.find((b) => b.id === l.orderId);
      const n = Number(l.quantity);
      return sum + (batch?.unitPrice && Number.isFinite(n) ? round2(n * batch.unitPrice) : 0);
    }, 0)
  );
  const vat = vatOf(net, vatRate);

  return (
    <FormDialog
      title="Нова видаткова накладна"
      subtitle={`${client.name} · партії на етапі «Відвантаження»`}
      maxWidth="lg"
      submitting={formik.isSubmitting}
      submitLabel="Створити накладну"
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Що відвантажуємо" hint="Ціна за плату — як у партії, без ПДВ. Опис піде в накладну." columns={1}>
        {batches === null && <CircularProgress size={24} />}
        {batches?.length === 0 && <Alert severity="info">У клієнта немає партій на етапі «Відвантаження» з невідвантаженими платами.</Alert>}
        {lineError('lines') && <Alert severity="error">{lineError('lines')}</Alert>}
        {formik.values.lines.map((line, i) => {
          const batch = batches?.find((b) => b.id === line.orderId);
          if (!batch) return null;
          const n = Number(line.quantity);
          return (
            <Box
              key={line.orderId}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'auto 2.2fr 3fr 1fr 1.2fr' },
                gap: 1.5,
                alignItems: 'center',
                p: 1.5,
                border: '1px solid',
                borderColor: line.include ? 'primary.light' : 'divider',
                borderRadius: 2,
                opacity: line.include ? 1 : 0.65,
              }}
            >
              <Checkbox checked={line.include} onChange={(e) => formik.setFieldValue(`lines.${i}.include`, e.target.checked)} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  № {batch.number} · {batch.product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Залишилось {remainingOf(batch)} з {batch.quantity} шт. · {formatMoney(batch.unitPrice)} за плату
                </Typography>
              </Box>
              <TextField
                size="small"
                label="Опис у накладній"
                name={`lines.${i}.description`}
                value={line.description}
                onChange={formik.handleChange}
                disabled={!line.include}
                error={Boolean(lineError(`description${i}`))}
                helperText={lineError(`description${i}`)}
                placeholder="напр. «… (компоненти + монтаж)»"
              />
              <TextField
                size="small"
                type="number"
                label="Кількість"
                name={`lines.${i}.quantity`}
                value={line.quantity}
                onChange={formik.handleChange}
                disabled={!line.include}
                error={Boolean(lineError(`quantity${i}`))}
                helperText={lineError(`quantity${i}`)}
                slotProps={{ htmlInput: { min: 1, max: remainingOf(batch) } }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700, textAlign: { md: 'right' } }}>
                {line.include && batch.unitPrice && Number.isFinite(n) ? formatMoney(round2(n * batch.unitPrice)) : '—'}
              </Typography>
            </Box>
          );
        })}
      </FormSection>

      <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2, maxWidth: 360, ml: 'auto', width: '100%' }}>
        <Stack spacing={0.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Сума
            </Typography>
            <Typography variant="body2">{formatMoney(net)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {vatRate ? `ПДВ ${vatRate}%` : 'Без ПДВ'}
            </Typography>
            <Typography variant="body2">{formatMoney(vat)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Всього
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {formatMoney(round2(net + vat))}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <FormSection title="Накладна і доставка" columns={3}>
        <TextField type="date" label="Дата накладної" {...fieldProps(formik, 'shippedAt')} slotProps={{ inputLabel: { shrink: true } }} required />
        <TextField label="Перевізник" {...fieldProps(formik, 'carrier')} />
        <TextField label="ТТН" {...fieldProps(formik, 'trackingNumber', 'Номер відправлення, якщо є')} />
        <TextField label="Примітка" {...fieldProps(formik, 'note', 'Видно лише в порталі')} multiline minRows={2} sx={FULL_ROW} />
      </FormSection>
    </FormDialog>
  );
}
