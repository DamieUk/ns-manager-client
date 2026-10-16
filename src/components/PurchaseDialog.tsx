import { Alert, Autocomplete, MenuItem, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { PURCHASE_CATEGORY_OPTIONS, PURCHASE_STATUS_OPTIONS, SUPPLIER_SUGGESTIONS } from '../constants/finance';
import { CURRENCY_OPTIONS } from '../constants/stages';
import type { Purchase, PurchaseCategory, PurchaseStatus } from '../types/finance';
import type { Currency } from '../types/orders';
import { fieldError, fieldProps, REQUIRED, toNumber } from '../utils/formik';
import { toDateInput } from '../utils/format';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

interface PurchaseValues {
  category: PurchaseCategory;
  supplier: string;
  description: string;
  supplierOrderNo: string;
  trackingNumber: string;
  cost: string;
  currency: Currency;
  expectedAt: string;
  status: PurchaseStatus;
}

interface PurchaseDialogProps {
  orderId: string;
  orderNumber: string;
  purchase: Purchase | null;
  prepaid: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// One thing bought for the batch: what, from whom, the supplier's order and tracking numbers.
// Until the prepayment is in, a purchase can only be planned.
export function PurchaseDialog({ orderId, orderNumber, purchase, prepaid, onClose, onSaved }: PurchaseDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<PurchaseValues>({
    initialValues: {
      category: purchase?.category ?? 'components',
      supplier: purchase?.supplier ?? '',
      description: purchase?.description ?? '',
      supplierOrderNo: purchase?.supplierOrderNo ?? '',
      trackingNumber: purchase?.trackingNumber ?? '',
      cost: purchase?.cost != null ? String(purchase.cost) : '',
      currency: purchase?.currency ?? 'USD',
      expectedAt: toDateInput(purchase?.expectedAt),
      status: purchase?.status ?? 'planned',
    },
    validate: (v) => {
      const errors: Partial<Record<keyof PurchaseValues, string>> = {};
      if (!v.supplier.trim()) errors.supplier = REQUIRED;
      const cost = toNumber(v.cost);
      if (cost !== null && (Number.isNaN(cost) || cost < 0)) errors.cost = 'Вкажіть додатне число';
      return errors;
    },
    onSubmit: async (v) => {
      setError(null);
      const cost = toNumber(v.cost);
      const body = {
        category: v.category,
        supplier: v.supplier.trim(),
        description: v.description.trim(),
        supplierOrderNo: v.supplierOrderNo.trim(),
        trackingNumber: v.trackingNumber.trim(),
        cost,
        currency: cost === null ? null : v.currency,
        expectedAt: v.expectedAt || null,
        status: v.status,
      };
      try {
        if (purchase) await apiClient.put(`/purchases/${purchase.id}`, body);
        else await apiClient.post('/purchases', { ...body, order: orderId });
        onSaved();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  const supplierError = fieldError(formik, 'supplier');

  return (
    <FormDialog
      title={purchase ? 'Закупівля' : 'Нова закупівля'}
      subtitle={`Партія № ${orderNumber}`}
      maxWidth="md"
      submitting={formik.isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      {!prepaid && <Alert severity="info">Чекаємо передоплату: поки закупівлю можна лише запланувати.</Alert>}

      <FormSection title="Що і в кого">
        <TextField select label="Що купуємо" {...fieldProps(formik, 'category')}>
          {PURCHASE_CATEGORY_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Autocomplete
          freeSolo
          options={SUPPLIER_SUGGESTIONS}
          inputValue={formik.values.supplier}
          onInputChange={(_, value) => formik.setFieldValue('supplier', value)}
          onBlur={() => formik.setFieldTouched('supplier', true)}
          renderInput={(params) => (
            <TextField {...params} label="Постачальник" required error={Boolean(supplierError)} helperText={supplierError ?? 'JLCPCB, LCSC, PCBWay або підрядник'} />
          )}
        />
        <TextField
          label="Опис"
          {...fieldProps(formik, 'description')}
          placeholder="напр. 2 шари, 1.6 мм, ENIG, 55 шт."
          multiline
          minRows={2}
          sx={FULL_ROW}
        />
      </FormSection>

      <FormSection title="Замовлення і доставка" columns={3}>
        <TextField label="№ замовлення в постачальника" {...fieldProps(formik, 'supplierOrderNo')} />
        <TextField label="Трек-номер" {...fieldProps(formik, 'trackingNumber')} />
        <TextField type="date" label="Очікуємо" {...fieldProps(formik, 'expectedAt')} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField
          select
          label="Статус"
          {...fieldProps(formik, 'status', !prepaid ? 'Замовити можна після передоплати' : undefined)}
        >
          {PURCHASE_STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value} disabled={!prepaid && o.value !== 'planned' && o.value !== 'cancelled'}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </FormSection>

      <FormSection title="Вартість" hint="Необов'язково: для власного обліку собівартості" columns={3}>
        <TextField label="Сума" {...fieldProps(formik, 'cost')} slotProps={{ htmlInput: { inputMode: 'decimal' } }} />
        <TextField select label="Валюта" {...fieldProps(formik, 'currency')}>
          {CURRENCY_OPTIONS.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>
      </FormSection>
    </FormDialog>
  );
}
