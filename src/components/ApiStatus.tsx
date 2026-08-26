import { Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';

type Status = 'checking' | 'ok' | 'error';

function ApiStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get('/health')
      .then(() => {
        if (!cancelled) setStatus('ok');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'checking') return null;

  return status === 'ok' ? (
    <Alert severity="success" sx={{ mb: 3 }}>
      Бекенд доступний
    </Alert>
  ) : (
    <Alert severity="warning" sx={{ mb: 3 }}>
      Бекенд недоступний (перевірте, що сервер запущений на VITE_API_URL)
    </Alert>
  );
}

export default ApiStatus;
