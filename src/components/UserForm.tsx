import { Button, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { ROLE_OPTIONS, STATUS_OPTIONS } from '../constants/users';
import type { TeamMember, UserInput } from '../types/users';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: UserInput): Partial<Record<keyof UserInput, string>> {
  const errors: Partial<Record<keyof UserInput, string>> = {};
  if (!values.firstName.trim()) errors.firstName = "Обов'язкове поле";
  if (!values.lastName.trim()) errors.lastName = "Обов'язкове поле";
  if (!values.jobTitle.trim()) errors.jobTitle = "Обов'язкове поле";
  if (!values.email.trim()) errors.email = "Обов'язкове поле";
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Некоректний email';
  if (!values.phone.trim()) errors.phone = "Обов'язкове поле";
  if (!values.address.trim()) errors.address = "Обов'язкове поле";
  return errors;
}

interface UserFormProps {
  initialValue?: TeamMember | null;
  submitting: boolean;
  onSubmit: (values: UserInput) => void;
  onCancel: () => void;
}

export function UserForm({ initialValue, submitting, onSubmit, onCancel }: UserFormProps) {
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
    onSubmit,
  });

  return (
    <Stack component="form" spacing={2} onSubmit={formik.handleSubmit} sx={{ minWidth: 360, mt: 1 }}>
      <Stack direction="row" spacing={2}>
        <TextField
          name="firstName"
          label="Ім'я"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
          required
          fullWidth
        />
        <TextField
          name="lastName"
          label="Прізвище"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          required
          fullWidth
        />
      </Stack>

      <TextField
        name="jobTitle"
        label="Посада"
        value={formik.values.jobTitle}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.jobTitle && Boolean(formik.errors.jobTitle)}
        helperText={formik.touched.jobTitle && formik.errors.jobTitle}
        required
        fullWidth
      />

      <TextField
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        disabled={Boolean(initialValue)}
        required
        fullWidth
      />

      <TextField
        name="phone"
        label="Телефон"
        value={formik.values.phone}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.phone && Boolean(formik.errors.phone)}
        helperText={formik.touched.phone && formik.errors.phone}
        required
        fullWidth
      />

      <TextField
        name="address"
        label="Адреса"
        value={formik.values.address}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.address && Boolean(formik.errors.address)}
        helperText={formik.touched.address && formik.errors.address}
        required
        fullWidth
      />

      <TextField
        select
        name="role"
        label="Рівень доступу"
        value={formik.values.role}
        onChange={formik.handleChange}
        required
        fullWidth
      >
        {ROLE_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        name="status"
        label="Статус"
        value={formik.values.status}
        onChange={formik.handleChange}
        required
        fullWidth
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

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
