import { MenuItem, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { getErrorMessage } from '../api/errors';
import { ROLE_OPTIONS, STATUS_OPTIONS } from '../constants/users';
import type { TeamMember, UserInput } from '../types/users';
import { fieldProps, REQUIRED } from '../utils/formik';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: UserInput): Partial<Record<keyof UserInput, string>> {
  const errors: Partial<Record<keyof UserInput, string>> = {};
  if (!values.firstName.trim()) errors.firstName = REQUIRED;
  if (!values.lastName.trim()) errors.lastName = REQUIRED;
  if (!values.jobTitle.trim()) errors.jobTitle = REQUIRED;
  if (!values.email.trim()) errors.email = REQUIRED;
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Некоректний email';
  if (!values.phone.trim()) errors.phone = REQUIRED;
  if (!values.address.trim()) errors.address = REQUIRED;
  return errors;
}

interface UserDialogProps {
  initialValue?: TeamMember | null;
  // Errors propagate back here and are shown in the dialog.
  onSubmit: (values: UserInput) => Promise<void>;
  onClose: () => void;
}

export function UserDialog({ initialValue, onSubmit, onClose }: UserDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const formik = useFormik<UserInput>({
    initialValues: {
      firstName: initialValue?.firstName ?? '',
      lastName: initialValue?.lastName ?? '',
      jobTitle: initialValue?.jobTitle ?? '',
      email: initialValue?.email ?? '',
      phone: initialValue?.phone ?? '',
      address: initialValue?.address ?? '',
      status: initialValue?.status ?? 'working',
      role: initialValue?.role ?? 'employee',
    },
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
      title={initialValue ? `${initialValue.firstName} ${initialValue.lastName}` : 'Новий користувач'}
      subtitle={initialValue ? initialValue.email : 'На email прийде запрошення встановити пароль'}
      maxWidth="md"
      submitting={formik.isSubmitting}
      submitLabel={initialValue ? 'Зберегти' : 'Запросити'}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Людина" columns={3}>
        <TextField label="Ім'я" {...fieldProps(formik, 'firstName')} required />
        <TextField label="Прізвище" {...fieldProps(formik, 'lastName')} required />
        <TextField label="Посада" {...fieldProps(formik, 'jobTitle')} required />
      </FormSection>

      <FormSection title="Контакти" columns={3}>
        <TextField
          label="Email"
          {...fieldProps(formik, 'email', initialValue ? 'Email не змінюється' : 'Ним входять у портал')}
          disabled={Boolean(initialValue)}
          required
        />
        <TextField label="Телефон" {...fieldProps(formik, 'phone')} required />
        <TextField label="Адреса" {...fieldProps(formik, 'address')} required />
      </FormSection>

      <FormSection title="Доступ">
        <TextField select label="Рівень доступу" {...fieldProps(formik, 'role', 'Власник бачить і погоджує все; працівник — свої партії')}>
          {ROLE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Статус" {...fieldProps(formik, 'status')}>
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </FormSection>
    </FormDialog>
  );
}
