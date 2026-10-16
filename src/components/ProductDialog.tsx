import { Box, MenuItem, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { getErrorMessage } from '../api/errors';
import { fieldError, fieldProps, REQUIRED } from '../utils/formik';
import { FileDropzone } from './FileDropzone';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

const PRODUCT_TYPES = [
  { value: 'PCB', label: 'Друкована плата (PCB)' },
  { value: 'Component', label: 'Компонент' },
  { value: 'Other', label: 'Інше' },
] as const;

export interface ProductFormValues {
  name: string;
  sku: string;
  type: (typeof PRODUCT_TYPES)[number]['value'];
  description: string;
  bomFile: File | null;
  additionalFiles: File[];
}

function validate(values: ProductFormValues): Partial<Record<keyof ProductFormValues, string>> {
  const errors: Partial<Record<keyof ProductFormValues, string>> = {};
  if (!values.name.trim()) errors.name = REQUIRED;
  if (!values.sku.trim()) errors.sku = REQUIRED;
  if (values.type === 'PCB' && !values.bomFile) errors.bomFile = 'Для плати потрібен BOM';
  return errors;
}

interface ProductDialogProps {
  // Errors propagate back here and are shown in the dialog.
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onClose: () => void;
}

// A client's product: what its batches are made of. A board comes with its BOM.
export function ProductDialog({ onSubmit, onClose }: ProductDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const formik = useFormik<ProductFormValues>({
    initialValues: { name: '', sku: '', type: 'PCB', description: '', bomFile: null, additionalFiles: [] },
    validate,
    onSubmit: async (values) => {
      setError(null);
      try {
        await onSubmit(values);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  return (
    <FormDialog
      title="Новий продукт"
      maxWidth="md"
      submitting={formik.isSubmitting}
      submitLabel="Створити продукт"
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Продукт" columns={3}>
        <TextField label="Назва" {...fieldProps(formik, 'name', 'Як у документах, напр. «Плата 4-портового комутатора V2»')} required sx={{ gridColumn: { sm: 'span 2' } }} />
        <TextField label="SKU" {...fieldProps(formik, 'sku', 'Унікальний артикул')} required />
        <TextField select label="Тип" {...fieldProps(formik, 'type')}>
          {PRODUCT_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Опис" {...fieldProps(formik, 'description')} multiline minRows={2} sx={{ gridColumn: { sm: 'span 2' } }} />
      </FormSection>

      <FormSection title="Файли" hint="BOM (HTML, таблиця) і все, що допоможе з прорахунком: Gerber, креслення">
        {formik.values.type === 'PCB' && (
          <Box sx={FULL_ROW}>
            <FileDropzone
              label="BOM файл *"
              files={formik.values.bomFile ? [formik.values.bomFile] : []}
              onChange={(files) => {
                formik.setFieldValue('bomFile', files[0] ?? null);
                formik.setFieldTouched('bomFile', true, false);
              }}
              error={fieldError(formik, 'bomFile')}
            />
          </Box>
        )}
        <Box sx={FULL_ROW}>
          <FileDropzone
            label="Додаткові файли (необовʼязково)"
            multiple
            files={formik.values.additionalFiles}
            onChange={(files) => formik.setFieldValue('additionalFiles', files)}
          />
        </Box>
      </FormSection>
    </FormDialog>
  );
}
