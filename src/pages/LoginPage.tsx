import { Alert, Button, CircularProgress, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import { useAuth } from '../auth/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import { roleHome } from '../routing/roleHome';
import { fieldProps, REQUIRED } from '../utils/formik';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<LoginValues>({
    initialValues: { email: '', password: '' },
    validate: (v) => {
      const errors: Partial<Record<keyof LoginValues, string>> = {};
      if (!v.email.trim()) errors.email = REQUIRED;
      else if (!EMAIL_PATTERN.test(v.email.trim())) errors.email = 'Некоректний email';
      if (!v.password) errors.password = REQUIRED;
      return errors;
    },
    onSubmit: async (v) => {
      setError(null);
      try {
        await login(v.email.trim(), v.password);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return (
    <AuthLayout>
      <Typography variant="h5" gutterBottom>
        Вхід
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Увійдіть, щоб продовжити
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <Stack component="form" noValidate spacing={2} onSubmit={formik.handleSubmit}>
        <TextField label="Email" type="email" autoComplete="email" {...fieldProps(formik, 'email')} required fullWidth />
        <TextField label="Пароль" type="password" autoComplete="current-password" {...fieldProps(formik, 'password')} required fullWidth />
        <Button type="submit" variant="contained" fullWidth disabled={formik.isSubmitting}>
          {formik.isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Увійти'}
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        <MuiLink component={RouterLink} to="/forgot-password">
          Забули пароль?
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
