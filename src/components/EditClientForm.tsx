import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import type { Client, ClientInput } from '../types/clients';

function validate(values: ClientInput): Partial<Record<keyof ClientInput, string>> {
  const errors: Partial<Record<keyof ClientInput, string>> = {};
  if (!values.name.trim()) errors.name = "Обов'язкове поле";
  return errors;
}

interface EditClientFormProps {
  client: Client;
  submitting: boolean;
  onSubmit: (values: ClientInput) => void;
  onCancel: () => void;
}

export function EditClientForm({ client, submitting, onSubmit, onCancel }: EditClientFormProps) {
  const formik = useFormik<ClientInput>({
    initialValues: {
      name: client.name,
      contactName: client.contactName ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      address: client.address ?? '',
      notes: client.notes ?? '',
    },
    validate,
    onSubmit,
  });

  return (
    <Stack component="form" spacing={2} onSubmit={formik.handleSubmit} sx={{ minWidth: 340, mt: 1 }}>
      <TextField label="Код клієнта" value={client.code} disabled fullWidth />
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

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 1 }}>
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
