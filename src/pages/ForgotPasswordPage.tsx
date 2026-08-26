import { Button, CircularProgress, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/client';
import AuthSuccessPanel from '../components/AuthSuccessPanel';
import AuthLayout from '../layouts/AuthLayout';
import type { MessageResponse } from '../types/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post<MessageResponse>('/auth/forgot-password', { email });
    } finally {
      setSubmitting(false);
      setSuccess(true);
    }
  }

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

      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" fullWidth disabled={submitting}>
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Надіслати посилання'}
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
