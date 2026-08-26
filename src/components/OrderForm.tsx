import { Button, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import type { OrderSummary, Product } from '../types/orders';

const ORDER_STATUSES = ['active', 'completed', 'cancelled'] as const;

export interface OrderFormValues {
  product: string;
  quantity: number;
  status: string;
}

function validate(values: OrderFormValues): Partial<Record<keyof OrderFormValues, string>> {
  const errors: Partial<Record<keyof OrderFormValues, string>> = {};
  if (!values.product) errors.product = "Обов'язкове поле";
  if (!values.quantity || values.quantity < 1) errors.quantity = 'Має бути більше нуля';
  return errors;
}

interface OrderFormProps {
  products: Product[];
  initialValue?: OrderSummary | null;
  submitting: boolean;
  onSubmit: (values: OrderFormValues) => void;
  onCancel: () => void;
}

export function OrderForm({ products, initialValue, submitting, onSubmit, onCancel }: OrderFormProps) {
  const formik = useFormik<OrderFormValues>({
    initialValues: {
      product: initialValue?.product.id ?? '',
      quantity: initialValue?.quantity ?? 1,
      status: initialValue?.status ?? 'active',
    },
    validate,
    onSubmit,
  });

  return (
    <Stack component="form" spacing={2} onSubmit={formik.handleSubmit} sx={{ minWidth: 320, mt: 1 }}>
      <TextField
        select
        name="product"
        label="Продукт"
        value={formik.values.product}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.product && Boolean(formik.errors.product)}
        helperText={formik.touched.product && formik.errors.product}
        required
      >
        {products.map((p) => (
          <MenuItem key={p._id} value={p._id}>
            {p.name} ({p.sku})
          </MenuItem>
        ))}
      </TextField>

      <TextField
        type="number"
        name="quantity"
        label="Кількість плат"
        value={formik.values.quantity}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.quantity && Boolean(formik.errors.quantity)}
        helperText={formik.touched.quantity && formik.errors.quantity}
        slotProps={{ htmlInput: { min: 1 } }}
        required
      />

      {initialValue && (
        <TextField select name="status" label="Статус" value={formik.values.status} onChange={formik.handleChange}>
          {ORDER_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
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
