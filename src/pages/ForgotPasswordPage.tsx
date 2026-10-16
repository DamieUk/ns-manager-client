import { Button, CircularProgress, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/client';
import AuthSuccessPanel from '../components/AuthSuccessPanel';
import AuthLayout from '../layouts/AuthLayout';
import type { MessageResponse } from '../types/auth';
import { fieldProps, REQUIRED } from '../utils/formik';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);

  const formik = useFormik<{ email: string }>({
    initialValues: { email: '' },
    validate: (v) => {
      if (!v.email.trim()) return { email: REQUIRED };
      if (!EMAIL_PATTERN.test(v.email.trim())) return { email: 'Некоректний email' };
      return {};
    },
    // The answer is the same whether or not the email exists, so it never reveals accounts.
    onSubmit: async (v) => {
      try {
        await apiClient.post<MessageResponse>('/auth/forgot-password', { email: v.email.trim() });
      } catch {
        // Shown the same way: the page never tells whether the email is known.
      }
      setSuccess(true);
    },
  });

  if (success) {
    return (
      <AuthLayout>
        <AuthSuccessPanel
          title="Перевірте свою пошту"
          message="Якщо такий email існує в системі, на нього надіслано лист із подальшими інструкціями."
          buttonLabel="Повернутися до входу"
          to="/login"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Typography variant="h5" gutterBottom>
        Відновлення пароля
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Введіть email — ми надішлемо посилання для скидання пароля
      </Typography>

      <Stack component="form" noValidate spacing={2} onSubmit={formik.handleSubmit}>
        <TextField label="Email" type="email" autoComplete="email" {...fieldProps(formik, 'email')} required fullWidth />
        <Button type="submit" variant="contained" fullWidth disabled={formik.isSubmitting}>
          {formik.isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Надіслати посилання'}
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        <MuiLink component={RouterLink} to="/login">
          Повернутися до входу
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
