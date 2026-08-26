import { Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';

export interface CreateClientFormValues {
  name: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  contractFile: File | null;
  supportingFiles: File[];
}

const INITIAL_VALUES: CreateClientFormValues = {
  name: '',
  code: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  contractFile: null,
  supportingFiles: [],
};

function validate(values: CreateClientFormValues): Partial<Record<keyof CreateClientFormValues, string>> {
  const errors: Partial<Record<keyof CreateClientFormValues, string>> = {};

  if (!values.name.trim()) errors.name = "Обов'язкове поле";
  if (!values.code.trim()) errors.code = "Обов'язкове поле";

  if (!values.contractFile) {
    errors.contractFile = "Потрібен PDF-файл контракту";
  } else if (values.contractFile.type !== 'application/pdf') {
    errors.contractFile = 'Файл контракту має бути у форматі PDF';
  }

  return errors;
}

interface CreateClientFormProps {
  submitting: boolean;
  onSubmit: (values: CreateClientFormValues) => void;
  onCancel: () => void;
}

export function CreateClientForm({ submitting, onSubmit, onCancel }: CreateClientFormProps) {
  const formik = useFormik<CreateClientFormValues>({
    initialValues: INITIAL_VALUES,
    validate,
    onSubmit,
  });

  return (
    <Stack component="form" spacing={2} onSubmit={formik.handleSubmit} sx={{ minWidth: 340, mt: 1 }}>
      <TextField
        name="name"
        label="Назва"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        required
        fullWidth
      />
      <TextField
        name="code"
        label="Код клієнта"
        value={formik.values.code}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.code && Boolean(formik.errors.code)}
        helperText={formik.touched.code && formik.errors.code}
        required
        fullWidth
      />
      <TextField
        name="contactName"
        label="Контактна особа"
        value={formik.values.contactName}
        onChange={formik.handleChange}
        fullWidth
      />
      <TextField name="email" label="Email" value={formik.values.email} onChange={formik.handleChange} fullWidth />
      <TextField name="phone" label="Телефон" value={formik.values.phone} onChange={formik.handleChange} fullWidth />
      <TextField
        name="address"
        label="Адреса"
        value={formik.values.address}
        onChange={formik.handleChange}
        fullWidth
      />
      <TextField
        name="notes"
        label="Нотатки"
        value={formik.values.notes}
        onChange={formik.handleChange}
        multiline
        minRows={2}
        fullWidth
      />

      <Button variant="outlined" component="label">
        {formik.values.contractFile ? formik.values.contractFile.name : 'Завантажити PDF контракту *'}
        <input
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => {
            formik.setFieldValue('contractFile', e.target.files?.[0] ?? null);
            formik.setFieldTouched('contractFile', true);
          }}
        />
      </Button>
      {formik.touched.contractFile && formik.errors.contractFile && (
        <Typography variant="caption" color="error">
          {formik.errors.contractFile}
        </Typography>
      )}

      <Button variant="outlined" component="label">
        {formik.values.supportingFiles.length > 0
          ? `Обрано файлів: ${formik.values.supportingFiles.length}`
          : 'Додаткові документи (необовʼязково)'}
        <input
          type="file"
          multiple
          hidden
          onChange={(e) => formik.setFieldValue('supportingFiles', Array.from(e.target.files ?? []))}
        />
      </Button>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 1 }}>
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
