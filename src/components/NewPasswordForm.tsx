import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { fieldProps, REQUIRED } from '../utils/formik';

export const MIN_PASSWORD_LENGTH = 8;

interface NewPasswordValues {
  password: string;
  confirmPassword: string;
}

// A new password typed twice (activating an account, resetting a password).
export function NewPasswordForm({ submitLabel, onSubmit }: { submitLabel: string; onSubmit: (password: string) => Promise<void> }) {
  const formik = useFormik<NewPasswordValues>({
    initialValues: { password: '', confirmPassword: '' },
    validate: (v) => {
      const errors: Partial<Record<keyof NewPasswordValues, string>> = {};
      if (!v.password) errors.password = REQUIRED;
      else if (v.password.length < MIN_PASSWORD_LENGTH) errors.password = `Щонайменше ${MIN_PASSWORD_LENGTH} символів`;
      if (!v.confirmPassword) errors.confirmPassword = REQUIRED;
      else if (v.confirmPassword !== v.password) errors.confirmPassword = 'Паролі не збігаються';
      return errors;
    },
    onSubmit: (v) => onSubmit(v.password),
  });

  return (
    <Stack component="form" noValidate spacing={2} onSubmit={formik.handleSubmit}>
      <TextField
        label="Новий пароль"
        type="password"
        autoComplete="new-password"
        {...fieldProps(formik, 'password', `Щонайменше ${MIN_PASSWORD_LENGTH} символів`)}
        required
        fullWidth
      />
      <TextField label="Підтвердіть пароль" type="password" autoComplete="new-password" {...fieldProps(formik, 'confirmPassword')} required fullWidth />
      <Button type="submit" variant="contained" fullWidth disabled={formik.isSubmitting}>
        {formik.isSubmitting ? <CircularProgress size={22} color="inherit" /> : submitLabel}
      </Button>
    </Stack>
  );
}
