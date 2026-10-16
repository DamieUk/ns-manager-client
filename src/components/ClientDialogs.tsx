import { Box, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { getErrorMessage } from '../api/errors';
import type { Client, ClientInput } from '../types/clients';
import { fieldError, fieldProps, REQUIRED } from '../utils/formik';
import { dayInput } from '../utils/format';
import { EMPTY_REQUISITES, requisitesOf, validateRequisites } from '../utils/requisites';
import { ClientContactSection } from './ClientContactSection';
import { FileDropzone } from './FileDropzone';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';
import { RequisitesSection } from './RequisitesSection';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateClient(values: ClientInput): Partial<Record<keyof ClientInput, string>> {
  const errors: Partial<Record<keyof ClientInput, string>> = { ...validateRequisites(values) };
  if (!values.name.trim()) errors.name = REQUIRED;
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Некоректний email';
  return errors;
}

export interface CreateClientFormValues extends ClientInput {
  code: string;
  ndaFile: File | null;
  ndaSignedAt: string;
  ndaNumber: string;
}

interface CreateClientDialogProps {
  // Errors propagate back here and are shown in the dialog.
  onSubmit: (values: CreateClientFormValues) => Promise<void>;
  onClose: () => void;
}

// A client is taken on once an NDA is signed, so the signed NDA is part of creating one. The
// framework contract and annexes are added on the client's page later.
export function CreateClientDialog({ onSubmit, onClose }: CreateClientDialogProps) {
  const [error, setError] = useState<string | null>(null);
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
      ndaSignedAt: dayInput(),
      ndaNumber: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof CreateClientFormValues, string>> = validateClient(values);
      if (!values.code.trim()) errors.code = REQUIRED;
      if (!values.ndaFile) errors.ndaFile = 'Додайте скан підписаного NDA';
      if (!values.ndaSignedAt) errors.ndaSignedAt = 'Вкажіть дату підпису';
      return errors;
    },
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
      title="Новий клієнт"
      subtitle="Клієнта заводимо, коли підписано NDA"
      maxWidth="md"
      submitting={formik.isSubmitting}
      submitLabel="Створити клієнта"
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Клієнт">
        <TextField label="Назва" {...fieldProps(formik, 'name', 'Як називаємо клієнта в порталі')} required />
        <TextField label="Код клієнта" {...fieldProps(formik, 'code', 'Короткий унікальний код, напр. TDR')} required />
      </FormSection>

      <FormSection title="Підписаний NDA" hint="Скан або фото підписаного примірника">
        <Box sx={FULL_ROW}>
          <FileDropzone
          label="Перетягніть скан NDA (PDF, JPG, PNG) або натисніть, щоб обрати"
          accept={{ 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }}
          files={formik.values.ndaFile ? [formik.values.ndaFile] : []}
          onChange={(files) => {
            formik.setFieldValue('ndaFile', files[0] ?? null);
            formik.setFieldTouched('ndaFile', true, false);
          }}
          error={fieldError(formik, 'ndaFile')}
          />
        </Box>
        <TextField type="date" label="Дата підпису" {...fieldProps(formik, 'ndaSignedAt')} required slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Номер NDA" {...fieldProps(formik, 'ndaNumber')} />
      </FormSection>

      <ClientContactSection formik={formik} />
      <RequisitesSection formik={formik} hint="Отримувач у рахунках і накладних: можна заповнити пізніше" />
    </FormDialog>
  );
}

interface EditClientDialogProps {
  client: Client;
  onSubmit: (values: ClientInput) => Promise<void>;
  onClose: () => void;
}

export function EditClientDialog({ client, onSubmit, onClose }: EditClientDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const formik = useFormik<ClientInput>({
    initialValues: {
      name: client.name,
      contactName: client.contactName ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      address: client.address ?? '',
      notes: client.notes ?? '',
      ...requisitesOf(client),
    },
    validate: validateClient,
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
      title={client.name}
      subtitle={`Код клієнта: ${client.code}`}
      maxWidth="md"
      submitting={formik.isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Клієнт">
        <TextField label="Назва" {...fieldProps(formik, 'name')} required />
        <TextField label="Код клієнта" value={client.code} disabled helperText="Код не змінюється" />
      </FormSection>
      <ClientContactSection formik={formik} />
      <RequisitesSection formik={formik} />
    </FormDialog>
  );
}
