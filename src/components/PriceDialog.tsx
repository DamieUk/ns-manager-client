import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { CURRENCY_OPTIONS } from '../constants/stages';
import type { Currency, OrderSummary, PriceInput } from '../types/orders';
import { fieldProps, toNumber } from '../utils/formik';
import { formatMoney } from '../utils/format';
import { round2, vatOf } from '../utils/money';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';

interface PriceValues {
  unitQuote: string;
  quoteCurrency: Currency;
  exchangeRate: string;
  unitPrice: string;
}

const fromNumber = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));
const isBadNumber = (value: string) => {
  const n = toNumber(value);
  return n !== null && (Number.isNaN(n) || n < 0);
};

function validate(v: PriceValues): Partial<Record<keyof PriceValues, string>> {
  const errors: Partial<Record<keyof PriceValues, string>> = {};
  if (isBadNumber(v.unitQuote)) errors.unitQuote = 'Вкажіть додатне число';
  if (v.quoteCurrency !== 'UAH' && isBadNumber(v.exchangeRate)) errors.exchangeRate = 'Вкажіть додатне число';
  if (v.quoteCurrency !== 'UAH' && toNumber(v.exchangeRate) === 0) errors.exchangeRate = 'Курс не може бути нульовим';
  if (isBadNumber(v.unitPrice)) errors.unitPrice = 'Вкажіть додатне число';
  return errors;
}

interface PriceDialogProps {
  order: OrderSummary;
  vatRate: number;
  onClose: () => void;
  onSaved: () => void;
}

// The price per board: the quote in the client's currency and the agreed UAH price without VAT
// that goes into the annex, invoices and delivery notes. The UAH price follows quote × rate
// until it is typed in by hand (e.g. rounded for the annex).
export function PriceDialog({ order, vatRate, onClose, onSaved }: PriceDialogProps) {
  const [error, setError] = useState<string | null>(null);
  // A stored price that isn't quote × rate was typed in by hand: keep it until the field is cleared.
  const [manualPrice, setManualPrice] = useState(
    order.unitPrice != null && order.unitQuote != null && order.exchangeRate != null && order.unitPrice !== round2(order.unitQuote * order.exchangeRate)
  );

  const formik = useFormik<PriceValues>({
    initialValues: {
      unitQuote: fromNumber(order.unitQuote),
      quoteCurrency: order.quoteCurrency ?? 'USD',
      exchangeRate: fromNumber(order.exchangeRate),
      unitPrice: fromNumber(order.unitPrice),
    },
    validate,
    onSubmit: async (v) => {
      setError(null);
      const isUah = v.quoteCurrency === 'UAH';
      const unitQuote = toNumber(v.unitQuote);
      const body: PriceInput = {
        unitQuote,
        quoteCurrency: unitQuote === null ? null : v.quoteCurrency,
        exchangeRate: isUah ? 1 : toNumber(v.exchangeRate),
        unitPrice: toNumber(v.unitPrice),
      };
      try {
        await apiClient.put(`/orders/${order.id}`, body);
        onSaved();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  const { values } = formik;
  const isUah = values.quoteCurrency === 'UAH';

  // Keeps the UAH price at quote × rate while it hasn't been typed in by hand.
  function recompute(next: Partial<PriceValues>) {
    if (manualPrice) return;
    const v = { ...values, ...next };
    const quote = toNumber(v.unitQuote);
    const rate = v.quoteCurrency === 'UAH' ? 1 : toNumber(v.exchangeRate);
    if (quote !== null && rate !== null && !Number.isNaN(quote * rate)) formik.setFieldValue('unitPrice', String(round2(quote * rate)));
  }

  const unitPrice = toNumber(values.unitPrice);
  const total = unitPrice !== null && !Number.isNaN(unitPrice) ? round2(unitPrice * order.quantity) : null;

  return (
    <FormDialog
      title={`Ціна партії № ${order.number}`}
      subtitle={`${order.product.name} · ${order.quantity} шт. Ціни за одну плату, без ПДВ.`}
      submitting={formik.isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Прорахунок" hint="У валюті клієнта, за BOM">
        <TextField
          label="Ціна за плату"
          {...fieldProps(formik, 'unitQuote')}
          onChange={(e) => {
            formik.handleChange(e);
            recompute({ unitQuote: e.target.value });
          }}
          slotProps={{ htmlInput: { inputMode: 'decimal' } }}
        />
        <TextField
          select
          label="Валюта"
          {...fieldProps(formik, 'quoteCurrency')}
          onChange={(e) => {
            formik.handleChange(e);
            recompute({ quoteCurrency: e.target.value as Currency });
          }}
        >
          {CURRENCY_OPTIONS.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>
      </FormSection>

      <FormSection
        title="Ціна в гривнях"
        hint="Фіксуємо на погодженні: далі додаток, рахунки й накладні йдуть у гривнях"
      >
        {!isUah && (
          <TextField
            label={`Курс, грн за 1 ${values.quoteCurrency}`}
            {...fieldProps(formik, 'exchangeRate')}
            onChange={(e) => {
              formik.handleChange(e);
              recompute({ exchangeRate: e.target.value });
            }}
            slotProps={{ htmlInput: { inputMode: 'decimal' } }}
          />
        )}
        <TextField
          label="Ціна за плату, грн без ПДВ"
          {...fieldProps(formik, 'unitPrice', manualPrice ? 'Введено вручну: очистіть, щоб рахувати за курсом' : 'Рахується за курсом; можна змінити вручну')}
          onChange={(e) => {
            formik.handleChange(e);
            setManualPrice(e.target.value.trim() !== '');
          }}
          slotProps={{ htmlInput: { inputMode: 'decimal' } }}
        />
      </FormSection>

      <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Партія
        </Typography>
        <Stack spacing={0.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {order.quantity} шт. × {formatMoney(unitPrice ?? null)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatMoney(total)}
            </Typography>
          </Stack>
          {vatRate > 0 && total !== null && (
            <>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  ПДВ {vatRate}%
                </Typography>
                <Typography variant="body2">{formatMoney(vatOf(total, vatRate))}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Всього з ПДВ
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {formatMoney(round2(total + vatOf(total, vatRate)))}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </FormDialog>
  );
}
