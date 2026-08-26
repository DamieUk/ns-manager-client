import { Alert, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import AuthSuccessPanel from '../components/AuthSuccessPanel';
import AuthLayout from '../layouts/AuthLayout';
import type { MessageResponse } from '../types/auth';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Паролі не збігаються');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post<MessageResponse>('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <Alert severity="error">Посилання недійсне. Запросіть скидання пароля ще раз.</Alert>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <AuthSuccessPanel
          title="Пароль оновлено!"
          message="Тепер ви можете увійти з новим паролем."
          buttonLabel="Перейти до входу"
          to="/login"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Typography variant="h5" gutterBottom>
        Новий пароль
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Встановіть новий пароль для свого облікового запису
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="Новий пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Підтвердіть пароль"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" fullWidth disabled={submitting}>
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Зберегти пароль'}
        </Button>
      </Stack>
    </AuthLayout>
  );
}
