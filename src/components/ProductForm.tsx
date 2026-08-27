import { Button, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { FileDropzone } from './FileDropzone';

const PRODUCT_TYPES = ['PCB', 'Component', 'Other'] as const;

export interface ProductFormValues {
  name: string;
  sku: string;
  type: (typeof PRODUCT_TYPES)[number];
  description: string;
  bomFile: File | null;
  additionalFiles: File[];
}

const INITIAL_VALUES: ProductFormValues = {
  name: '',
  sku: '',
  type: 'PCB',
  description: '',
  bomFile: null,
  additionalFiles: [],
};

function validate(values: ProductFormValues): Partial<Record<keyof ProductFormValues, string>> {
  const errors: Partial<Record<keyof ProductFormValues, string>> = {};
  if (!values.name.trim()) errors.name = "Обов'язкове поле";
  if (!values.sku.trim()) errors.sku = "Обов'язкове поле";
  if (values.type === 'PCB' && !values.bomFile) errors.bomFile = 'BOM файл обов’язковий для PCB';
  return errors;
}

interface ProductFormProps {
  submitting: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

export function ProductForm({ submitting, onSubmit, onCancel }: ProductFormProps) {
  const formik = useFormik<ProductFormValues>({
    initialValues: INITIAL_VALUES,
    validate,
    onSubmit,
  });

  return (
    <Stack component="form" spacing={2} onSubmit={formik.handleSubmit} sx={{ minWidth: 360, mt: 1 }}>
      <TextField
        name="name"
        label="Назва"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        required
      />
      <TextField
        name="sku"
        label="SKU"
        value={formik.values.sku}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.sku && Boolean(formik.errors.sku)}
        helperText={formik.touched.sku && formik.errors.sku}
        required
      />
      <TextField select name="type" label="Тип" value={formik.values.type} onChange={formik.handleChange}>
        {PRODUCT_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        name="description"
        label="Опис"
        value={formik.values.description}
        onChange={formik.handleChange}
        multiline
        minRows={2}
      />

      {formik.values.type === 'PCB' && (
        <FileDropzone
          label="BOM файл *"
          files={formik.values.bomFile ? [formik.values.bomFile] : []}
          onChange={(files) => {
            formik.setFieldValue('bomFile', files[0] ?? null);
            formik.setFieldTouched('bomFile', true);
          }}
          error={formik.touched.bomFile ? formik.errors.bomFile : undefined}
        />
      )}

      <FileDropzone
        label="Додаткові файли (необовʼязково)"
        multiple
        files={formik.values.additionalFiles}
        onChange={(files) => formik.setFieldValue('additionalFiles', files)}
      />

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={submitting}>
          Скасувати
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Створити'}
        </Button>
      </Stack>
    </Stack>
  );
}
