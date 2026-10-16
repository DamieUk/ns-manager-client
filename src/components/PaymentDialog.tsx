import { Button, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { Invoice } from '../types/finance';
import { fieldProps, REQUIRED, toNumber } from '../utils/formik';
import { dayInput, formatMoney, toDateInput } from '../utils/format';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';

interface PaymentValues {
  paidAmount: string;
  paidAt: string;
}

interface PaymentDialogProps {
  invoice: Invoice;
  onClose: () => void;
  onSaved: () => void;
}

// Records the money received for an invoice (VAT included); its full total marks it paid.
export function PaymentDialog({ invoice, onClose, onSaved }: PaymentDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  async function send(body: { paidAmount: number | null; paidAt?: string }) {
    setError(null);
    try {
      await apiClient.put(`/invoices/${invoice.id}/payment`, body);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const formik = useFormik<PaymentValues>({
    initialValues: {
      paidAmount: String(invoice.paidAmount ?? invoice.total),
      paidAt: invoice.paidAt ? toDateInput(invoice.paidAt) : dayInput(),
    },
    validate: (v) => {
      const errors: Partial<Record<keyof PaymentValues, string>> = {};
      const amount = toNumber(v.paidAmount);
      if (amount === null) errors.paidAmount = 'Вкажіть отриману суму';
      else if (Number.isNaN(amount) || amount <= 0) errors.paidAmount = 'Сума має бути більшою за нуль';
      if (!v.paidAt) errors.paidAt = REQUIRED;
      return errors;
    },
    onSubmit: (v) => send({ paidAmount: toNumber(v.paidAmount), paidAt: v.paidAt }),
  });

  return (
    <FormDialog
      title={`Оплата рахунку № ${invoice.number}`}
      subtitle={`До сплати ${formatMoney(invoice.total)}${invoice.vatRate ? `, з них ПДВ ${formatMoney(invoice.vatAmount)}` : ''}`}
      submitting={formik.isSubmitting || clearing}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
      secondaryAction={
        invoice.paidAmount !== null && (
          <Button
            color="error"
            disabled={formik.isSubmitting || clearing}
            onClick={async () => {
              setClearing(true);
              await send({ paidAmount: null });
              setClearing(false);
            }}
          >
            Скасувати оплату
          </Button>
        )
      }
    >
      <FormSection hint="Менша сума — часткова оплата: рахунок лишиться в «Очікують оплати».">
        <TextField
          label="Отримано, грн"
          {...fieldProps(formik, 'paidAmount', 'Разом з ПДВ, як надійшло на рахунок')}
          slotProps={{ htmlInput: { inputMode: 'decimal' } }}
          required
        />
        <TextField type="date" label="Дата оплати" {...fieldProps(formik, 'paidAt')} slotProps={{ inputLabel: { shrink: true } }} required />
      </FormSection>
    </FormDialog>
  );
}
