import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import type { ClientInput } from '../types/clients';
import { EMPTY_REQUISITES } from '../utils/requisites';
import { FileDropzone } from './FileDropzone';
import { RequisitesFields } from './RequisitesFields';

export interface CreateClientFormValues extends ClientInput {
  code: string;
  ndaFile: File | null;
  ndaSignedAt: string;
  ndaNumber: string;
}

// Today's date in the user's time zone (toISOString would give the UTC date, which differs at night).
const today = () => new Date().toLocaleDateString('sv-SE');

function validate(values: CreateClientFormValues): Partial<Record<keyof CreateClientFormValues, string>> {
  const errors: Partial<Record<keyof CreateClientFormValues, string>> = {};
  if (!values.name.trim()) errors.name = "Обов'язкове поле";
  if (!values.code.trim()) errors.code = "Обов'язкове поле";
  if (!values.ndaFile) errors.ndaFile = 'Додайте скан підписаного NDA';
  if (!values.ndaSignedAt) errors.ndaSignedAt = 'Вкажіть дату підпису';
  return errors;
}

interface CreateClientFormProps {
  submitting: boolean;
  onSubmit: (values: CreateClientFormValues) => void;
  onCancel: () => void;
}

// A client is taken on once an NDA is signed, so the signed NDA is part of creating one. The
// framework contract and annexes are added on the client's page later.
export function CreateClientForm({ submitting, onSubmit, onCancel }: CreateClientFormProps) {
  const formik = useFormik<CreateClientFormValues>({
    initialValues: {
      name: '',
      code: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      ...EMPTY_REQUISITES,
      ndaFile: null,
      ndaSignedAt: today(),
      ndaNumber: '',
    },
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

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
        <Typography sx={{ fontWeight: 700 }}>Підписаний NDA *</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Клієнта заводимо після підписання NDA — скан або фото підписаного примірника
        </Typography>
        <Stack spacing={2}>
          <FileDropzone
            label="Перетягніть скан NDA (PDF, JPG, PNG) або натисніть, щоб обрати"
            accept={{ 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }}
            files={formik.values.ndaFile ? [formik.values.ndaFile] : []}
            onChange={(files) => {
              formik.setFieldValue('ndaFile', files[0] ?? null);
              formik.setFieldTouched('ndaFile', true, false);
            }}
            error={formik.touched.ndaFile ? formik.errors.ndaFile : undefined}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              type="date"
              name="ndaSignedAt"
              label="Дата підпису"
              value={formik.values.ndaSignedAt}
              onChange={formik.handleChange}
              error={formik.touched.ndaSignedAt && Boolean(formik.errors.ndaSignedAt)}
              helperText={formik.touched.ndaSignedAt && formik.errors.ndaSignedAt}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField name="ndaNumber" label="Номер NDA" value={formik.values.ndaNumber} onChange={formik.handleChange} fullWidth />
          </Stack>
        </Stack>
      </Box>

      <TextField name="contactName" label="Контактна особа" value={formik.values.contactName} onChange={formik.handleChange} fullWidth />
      <TextField name="email" label="Email" value={formik.values.email} onChange={formik.handleChange} fullWidth />
      <TextField name="phone" label="Телефон" value={formik.values.phone} onChange={formik.handleChange} fullWidth />
      <TextField name="address" label="Адреса" value={formik.values.address} onChange={formik.handleChange} fullWidth />
      <TextField name="notes" label="Нотатки" value={formik.values.notes} onChange={formik.handleChange} multiline minRows={2} fullWidth />

      <RequisitesFields values={formik.values} onChange={formik.handleChange} />

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
