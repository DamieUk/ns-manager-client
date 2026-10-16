import { Autocomplete, MenuItem, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { getErrorMessage } from '../api/errors';
import type { ClientDocument } from '../types/clients';
import type { OrderDetail, Product } from '../types/orders';
import type { TeamMember } from '../types/users';
import { fieldProps, REQUIRED } from '../utils/formik';
import { FileDropzone } from './FileDropzone';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

export interface OrderFormValues {
  product: string;
  quantity: number | '';
  description: string;
  dueDate: string;
  manager: string;
  assignedEmployees: string[];
  documents: string[];
}

function validate(values: OrderFormValues): Partial<Record<keyof OrderFormValues, string>> {
  const errors: Partial<Record<keyof OrderFormValues, string>> = {};
  if (!values.product) errors.product = 'Оберіть продукт';
  if (values.quantity === '' || !Number.isInteger(Number(values.quantity))) errors.quantity = 'Вкажіть ціле число';
  else if (Number(values.quantity) < 1) errors.quantity = 'Має бути більше нуля';
  if (!values.description.trim()) errors.description = REQUIRED;
  return errors;
}

interface OrderDialogProps {
  products: Product[];
  documentPool: ClientDocument[];
  managers: TeamMember[];
  employees: TeamMember[];
  // Edit this batch; otherwise create a new one (it starts at the quote stage).
  initialValue?: OrderDetail | null;
  onSubmit: (values: OrderFormValues) => Promise<void>;
  onClose: () => void;
  onUploadDocument: (file: File) => Promise<ClientDocument>;
}

// A batch's product, quantity, deadline, team and files. Price and stage are set on its page.
export function OrderDialog({ products, documentPool, managers, employees, initialValue, onSubmit, onClose, onUploadDocument }: OrderDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [localNewDocs, setLocalNewDocs] = useState<ClientDocument[]>(initialValue?.documents ?? []);
  const [uploading, setUploading] = useState(false);

  const formik = useFormik<OrderFormValues>({
    initialValues: {
      product: initialValue?.product.id ?? '',
      quantity: initialValue?.quantity ?? 1,
      description: initialValue?.description ?? '',
      dueDate: initialValue?.dueDate?.slice(0, 10) ?? '',
      manager: initialValue?.manager?.id ?? '',
      assignedEmployees: initialValue?.assignedEmployees.map((e) => e.id) ?? [],
      documents: initialValue?.documents.map((d) => d._id) ?? [],
    },
    validate,
    onSubmit: async (values) => {
      setError(null);
      try {
        await onSubmit({ ...values, quantity: Number(values.quantity) });
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  const allDocuments = [...documentPool, ...localNewDocs.filter((d) => !documentPool.some((p) => p._id === d._id))];
  const quantityLocked = Boolean(initialValue?.priceLocked);

  async function handleDrop(files: File[]) {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await onUploadDocument(file);
      setLocalNewDocs((prev) => [...prev, doc]);
      formik.setFieldValue('documents', [...formik.values.documents, doc._id]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormDialog
      title={initialValue ? `Партія № ${initialValue.number}` : 'Нова партія'}
      subtitle={initialValue ? undefined : 'Партія почне з етапу «Прорахунок»: ціну вкажете на її сторінці'}
      maxWidth="md"
      submitting={formik.isSubmitting || uploading}
      submitLabel={initialValue ? 'Зберегти' : 'Створити партію'}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Партія" columns={3}>
        <TextField select label="Продукт" {...fieldProps(formik, 'product')} required sx={{ gridColumn: { sm: 'span 2' } }}>
          {products.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.name} ({p.sku})
            </MenuItem>
          ))}
          {products.length === 0 && <MenuItem disabled>Спершу додайте продукт клієнта</MenuItem>}
        </TextField>
        <TextField
          type="number"
          label="Кількість плат"
          {...fieldProps(formik, 'quantity', quantityLocked ? 'Зафіксовано додатком' : undefined)}
          disabled={quantityLocked}
          slotProps={{ htmlInput: { min: 1 } }}
          required
        />
        <TextField label="Опис" {...fieldProps(formik, 'description', 'Що саме робимо: компоненти + монтаж, особливі вимоги')} multiline minRows={2} required sx={FULL_ROW} />
        <TextField type="date" label="Термін виконання" {...fieldProps(formik, 'dueDate')} slotProps={{ inputLabel: { shrink: true } }} />
      </FormSection>

      <FormSection title="Команда">
        <TextField select label="Відповідальний" {...fieldProps(formik, 'manager', 'Власник, який веде партію')}>
          <MenuItem value="">Без відповідального</MenuItem>
          {managers.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </MenuItem>
          ))}
        </TextField>
        <Autocomplete
          multiple
          options={employees}
          getOptionLabel={(e) => `${e.firstName} ${e.lastName}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={employees.filter((e) => formik.values.assignedEmployees.includes(e.id))}
          onChange={(_, selected) => formik.setFieldValue('assignedEmployees', selected.map((e) => e.id))}
          renderInput={(params) => <TextField {...params} label="Працівники" placeholder="Оберіть..." helperText="Бачать партію й звітують про монтаж" />}
        />
      </FormSection>

      <FormSection title="Файли" hint="BOM, програма P&P, термопрофіль: працівники партії їх бачать" columns={1}>
        <Autocomplete
          multiple
          options={allDocuments}
          getOptionLabel={(d) => d.originalName}
          isOptionEqualToValue={(a, b) => a._id === b._id}
          value={allDocuments.filter((d) => formik.values.documents.includes(d._id))}
          onChange={(_, selected) => formik.setFieldValue('documents', selected.map((d) => d._id))}
          renderInput={(params) => <TextField {...params} label="Документи клієнта" placeholder="Оберіть..." />}
        />
        <FileDropzone label={uploading ? 'Завантаження...' : 'Або перетягніть новий файл: додасться автоматично'} files={[]} onChange={handleDrop} />
        {localNewDocs.length > 0 && !initialValue && (
          <Typography variant="caption" color="text.secondary">
            Додано: {localNewDocs.map((d) => d.originalName).join(', ')}
          </Typography>
        )}
      </FormSection>
    </FormDialog>
  );
}
