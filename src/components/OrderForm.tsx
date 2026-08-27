import { Autocomplete, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import type { ClientDocument } from '../types/clients';
import type { OrderDetail, Product } from '../types/orders';
import { FileDropzone } from './FileDropzone';

const ORDER_STATUSES = ['active', 'completed', 'cancelled'] as const;

export interface OrderFormValues {
  product: string;
  quantity: number;
  status: string;
  documents: string[];
}

function validate(values: OrderFormValues): Partial<Record<keyof OrderFormValues, string>> {
  const errors: Partial<Record<keyof OrderFormValues, string>> = {};
  if (!values.product) errors.product = "Обов'язкове поле";
  if (!values.quantity || values.quantity < 1) errors.quantity = 'Має бути більше нуля';
  return errors;
}

interface OrderFormProps {
  products: Product[];
  documentPool: ClientDocument[];
  initialValue?: OrderDetail | null;
  submitting: boolean;
  onSubmit: (values: OrderFormValues) => void;
  onCancel: () => void;
  onUploadDocument: (file: File) => Promise<ClientDocument>;
}

export function OrderForm({
  products,
  documentPool,
  initialValue,
  submitting,
  onSubmit,
  onCancel,
  onUploadDocument,
}: OrderFormProps) {
  const [localNewDocs, setLocalNewDocs] = useState<ClientDocument[]>(initialValue?.documents ?? []);
  const [uploading, setUploading] = useState(false);

  const formik = useFormik<OrderFormValues>({
    initialValues: {
      product: initialValue?.product.id ?? '',
      quantity: initialValue?.quantity ?? 1,
      status: initialValue?.status ?? 'active',
      documents: initialValue?.documents.map((d) => d._id) ?? [],
    },
    validate,
    onSubmit,
  });

  const allDocuments = [
    ...documentPool,
    ...localNewDocs.filter((d) => !documentPool.some((p) => p._id === d._id)),
  ];

  async function handleDrop(files: File[]) {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await onUploadDocument(file);
      setLocalNewDocs((prev) => [...prev, doc]);
      formik.setFieldValue('documents', [...formik.values.documents, doc._id]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Stack component="form" spacing={2} onSubmit={formik.handleSubmit} sx={{ minWidth: 360, mt: 1 }}>
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

      <Autocomplete
        multiple
        options={allDocuments}
        getOptionLabel={(d) => d.originalName}
        isOptionEqualToValue={(a, b) => a._id === b._id}
        value={allDocuments.filter((d) => formik.values.documents.includes(d._id))}
        onChange={(_, selected) =>
          formik.setFieldValue(
            'documents',
            selected.map((d) => d._id)
          )
        }
        renderInput={(params) => <TextField {...params} label="Існуючі документи" placeholder="Оберіть..." />}
      />

      <FileDropzone
        label={uploading ? 'Завантаження...' : 'Або перетягніть новий файл — додасться автоматично'}
        files={[]}
        onChange={handleDrop}
      />
      {localNewDocs.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          Нові файли цієї сесії: {localNewDocs.map((d) => d.originalName).join(', ')}
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={submitting}>
          Скасувати
        </Button>
        <Button type="submit" variant="contained" disabled={submitting || uploading}>
          {submitting ? <CircularProgress size={20} /> : 'Зберегти'}
        </Button>
      </Stack>
    </Stack>
  );
}
