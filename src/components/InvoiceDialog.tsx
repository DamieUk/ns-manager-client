import { Box, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { INVOICE_KIND_OPTIONS } from '../constants/finance';
import type { Invoice, InvoiceKind } from '../types/finance';
import type { OrderDetail } from '../types/orders';
import { fieldProps, REQUIRED, toNumber } from '../utils/formik';
import { dayInput, formatMoney, toDateInput } from '../utils/format';
import { round2, vatOf } from '../utils/money';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

interface InvoiceValues {
  kind: InvoiceKind;
  description: string;
  amount: string;
  issuedAt: string;
  dueAt: string;
  note: string;
}

interface InvoiceDialogProps {
  order: OrderDetail;
  invoice: Invoice | null;
  onClose: () => void;
  onSaved: () => void;
}

// The line printed when it is left empty (as the API builds it).
function defaultLine(kind: InvoiceKind, order: OrderDetail): string {
  if (kind === 'full') return order.product.name;
  return `${kind === 'prepayment' ? 'Передоплата' : 'Доплата'}: ${order.product.name}, ${order.quantity} шт. (партія № ${order.number})`;
}

// Issues an invoice for the batch (or edits an unpaid one). The amount is without VAT and stays
// within the batch price; VAT comes on top. The number (ДДММРР-N) is given on saving.
export function InvoiceDialog({ order, invoice, onClose, onSaved }: InvoiceDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const total = order.total ?? 0;
  const vatRate = invoice ? invoice.vatRate : (order.payments?.vatRate ?? 0);
  const live = (order.invoices ?? []).filter((i) => i.status !== 'cancelled');
  // What can still be invoiced, counting this invoice's own amount when editing it.
  const left = round2((order.payments?.toInvoice ?? total) + (invoice && invoice.status !== 'cancelled' ? invoice.amount : 0));

  const formik = useFormik<InvoiceValues>({
    initialValues: {
      kind: invoice?.kind ?? (live.length > 0 ? 'balance' : 'prepayment'),
      description: invoice?.description ?? '',
      amount: invoice ? String(invoice.amount) : live.length > 0 ? String(left) : '',
      issuedAt: invoice ? toDateInput(invoice.issuedAt) : dayInput(),
      dueAt: invoice ? toDateInput(invoice.dueAt) : dayInput(5),
      note: invoice?.note ?? '',
    },
    validate: (v) => {
      const errors: Partial<Record<keyof InvoiceValues, string>> = {};
      const amount = toNumber(v.amount);
      if (amount === null) errors.amount = 'Вкажіть суму';
      else if (Number.isNaN(amount) || amount <= 0) errors.amount = 'Сума має бути більшою за нуль';
      else if (amount > left + 0.001) errors.amount = `Більше, ніж залишилось виставити (${formatMoney(left)})`;
      if (!v.issuedAt) errors.issuedAt = REQUIRED;
      if (v.dueAt && v.issuedAt && v.dueAt < v.issuedAt) errors.dueAt = 'Раніше за дату рахунку';
      return errors;
    },
    onSubmit: async (v) => {
      setError(null);
      const body = {
        kind: v.kind,
        description: v.description.trim(),
        amount: toNumber(v.amount),
        issuedAt: v.issuedAt,
        dueAt: v.dueAt || null,
        note: v.note.trim(),
      };
      try {
        if (invoice) await apiClient.put(`/invoices/${invoice.id}`, body);
        else await apiClient.post('/invoices', { ...body, order: order.id });
        onSaved();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  const shares = [30, 50, 70, 100].map((p) => ({ label: `${p}%`, value: round2((total * p) / 100) })).filter((s) => s.value <= left + 0.001);
  const amount = toNumber(formik.values.amount);
  const validAmount = amount !== null && !Number.isNaN(amount) && amount > 0 ? amount : null;

  return (
    <FormDialog
      title={invoice ? `Рахунок № ${invoice.number}` : 'Новий рахунок'}
      subtitle={`Партія № ${order.number} · ${order.client.name} · ${order.product.name}, ${order.quantity} шт.`}
      submitting={formik.isSubmitting}
      submitLabel={invoice ? 'Зберегти' : 'Виставити рахунок'}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Сума" hint={`Партія ${formatMoney(total)} без ПДВ · залишилось виставити ${formatMoney(left)}`}>
        <TextField select label="Призначення" {...fieldProps(formik, 'kind')}>
          {INVOICE_KIND_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Сума без ПДВ, грн" {...fieldProps(formik, 'amount')} slotProps={{ htmlInput: { inputMode: 'decimal' } }} required />
        <Stack direction="row" spacing={1} sx={{ ...FULL_ROW, flexWrap: 'wrap', rowGap: 1 }}>
          {shares.map((s) => (
            <Chip key={s.label} label={`${s.label} · ${formatMoney(s.value)}`} variant="outlined" onClick={() => formik.setFieldValue('amount', String(s.value))} />
          ))}
          {left > 0 && !shares.some((s) => s.value === left) && (
            <Chip label={`Залишок · ${formatMoney(left)}`} variant="outlined" onClick={() => formik.setFieldValue('amount', String(left))} />
          )}
        </Stack>
      </FormSection>

      <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2 }}>
        <Stack spacing={0.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Сума без ПДВ
            </Typography>
            <Typography variant="body2">{formatMoney(validAmount)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {vatRate > 0 ? `ПДВ ${vatRate}%` : 'Без ПДВ'}
            </Typography>
            <Typography variant="body2">{formatMoney(validAmount !== null ? vatOf(validAmount, vatRate) : null)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              До сплати
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {formatMoney(validAmount !== null ? round2(validAmount + vatOf(validAmount, vatRate)) : null)}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <FormSection title="У рахунку" columns={1}>
        <TextField
          label="Рядок рахунку"
          {...fieldProps(formik, 'description', 'Порожньо — підставимо назву продукту й партію')}
          placeholder={defaultLine(formik.values.kind, order)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </FormSection>

      <FormSection title="Дати">
        <TextField type="date" label="Дата рахунку" {...fieldProps(formik, 'issuedAt')} slotProps={{ inputLabel: { shrink: true } }} required />
        <TextField type="date" label="Сплатити до" {...fieldProps(formik, 'dueAt')} slotProps={{ inputLabel: { shrink: true } }} />
      </FormSection>

      <FormSection columns={1}>
        <TextField label="Примітка" {...fieldProps(formik, 'note', 'Видно лише в порталі')} multiline minRows={2} />
      </FormSection>
    </FormDialog>
  );
}
