import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useState, type FormEvent } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { CURRENCY_OPTIONS } from '../constants/stages';
import type { Currency, OrderSummary, PriceInput } from '../types/orders';
import { formatMoney } from '../utils/format';

const toNumber = (value: string) => (value.trim() === '' ? null : Number(value.replace(',', '.')));
const fromNumber = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));
const round2 = (n: number) => Math.round(n * 100) / 100;

interface PriceDialogProps {
  order: OrderSummary;
  onClose: () => void;
  onSaved: () => void;
}

// The quote in the client's currency and the agreed batch price in UAH. The UAH price follows
// amount × rate until it is typed in by hand (e.g. rounded for the annex).
export function PriceDialog({ order, onClose, onSaved }: PriceDialogProps) {
  const [amount, setAmount] = useState(fromNumber(order.quoteAmount));
  const [currency, setCurrency] = useState<Currency>(order.quoteCurrency ?? 'USD');
  const [rate, setRate] = useState(fromNumber(order.exchangeRate));
  const [priceUah, setPriceUah] = useState(fromNumber(order.priceUah));
  // A stored price that isn't amount × rate was typed in by hand: keep it until the field is cleared.
  const [priceTouched, setPriceTouched] = useState(
    order.priceUah != null &&
      order.quoteAmount != null &&
      order.exchangeRate != null &&
      order.priceUah !== round2(order.quoteAmount * order.exchangeRate)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUah = currency === 'UAH';
  const amountValue = toNumber(amount);
  const rateValue = isUah ? 1 : toNumber(rate);
  const computed = amountValue !== null && rateValue !== null && !Number.isNaN(amountValue * rateValue) ? round2(amountValue * rateValue) : null;
  const shownPrice = priceTouched ? priceUah : fromNumber(computed ?? toNumber(priceUah));
  const perBoard = toNumber(shownPrice) !== null && order.quantity > 0 ? toNumber(shownPrice)! / order.quantity : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body: PriceInput = {
      quoteAmount: amountValue,
      quoteCurrency: amountValue === null ? null : currency,
      exchangeRate: isUah ? 1 : rateValue,
      priceUah: toNumber(shownPrice),
    };
    if ([body.quoteAmount, body.exchangeRate, body.priceUah].some((v) => v !== null && (Number.isNaN(v) || v < 0))) {
      setError('Вкажіть додатні числа');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.put(`/orders/${order.id}`, body);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Ціна партії № {order.number}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Прорахунок за партію"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                fullWidth
              />
              <TextField select label="Валюта" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} sx={{ minWidth: 120 }}>
                {CURRENCY_OPTIONS.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            {!isUah && (
              <TextField
                label={`Курс, грн за 1 ${currency}`}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                helperText="Фіксуємо на дату погодження — далі всі документи в гривнях"
                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              />
            )}
            <TextField
              label="Ціна партії, грн"
              value={shownPrice}
              onChange={(e) => {
                setPriceTouched(e.target.value.trim() !== '');
                setPriceUah(e.target.value);
              }}
              helperText={
                perBoard !== null ? `≈ ${formatMoney(perBoard)} за плату (${order.quantity} шт.)` : 'Ця сума піде в додаток і рахунки'
              }
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Скасувати
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Зберегти'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
