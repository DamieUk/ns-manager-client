import { Box, CircularProgress } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import { roleHome } from '../routing/roleHome';

export function AuthCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = params.get('token');
    const error = params.get('error');

    window.history.replaceState(null, '', window.location.pathname);

    if (!token) {
      navigate('/login', { replace: true, state: { error: error ?? 'auth_failed' } });
      return;
    }

    login(token)
      .then((user) => navigate(roleHome(user.role), { replace: true }))
      .catch(() => navigate('/login', { replace: true, state: { error: 'auth_failed' } }));
  }, [login, navigate]);

  return (
    <AuthLayout>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    </AuthLayout>
  );
}
