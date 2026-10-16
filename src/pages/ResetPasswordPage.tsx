import { Alert, Typography } from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import AuthSuccessPanel from '../components/AuthSuccessPanel';
import { NewPasswordForm } from '../components/NewPasswordForm';
import AuthLayout from '../layouts/AuthLayout';
import type { MessageResponse } from '../types/auth';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(password: string) {
    setError(null);
    try {
      await apiClient.post<MessageResponse>('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
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

      <NewPasswordForm submitLabel="Зберегти пароль" onSubmit={handleSubmit} />
    </AuthLayout>
  );
}
