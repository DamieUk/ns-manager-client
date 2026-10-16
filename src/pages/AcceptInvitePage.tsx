import { Alert, Typography } from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import AuthSuccessPanel from '../components/AuthSuccessPanel';
import { NewPasswordForm } from '../components/NewPasswordForm';
import AuthLayout from '../layouts/AuthLayout';
import type { MessageResponse } from '../types/auth';

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(password: string) {
    setError(null);
    try {
      await apiClient.post<MessageResponse>('/auth/accept-invite', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <Alert severity="error">Посилання недійсне. Перевірте лист-запрошення ще раз.</Alert>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <AuthSuccessPanel
          title="Обліковий запис активовано!"
          message="Тепер ви можете увійти, використовуючи свій email та щойно встановлений пароль."
          buttonLabel="Перейти до входу"
          to="/login"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Typography variant="h5" gutterBottom>
        Активація облікового запису
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Встановіть пароль, щоб завершити активацію
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <NewPasswordForm submitLabel="Активувати" onSubmit={handleSubmit} />
    </AuthLayout>
  );
}
