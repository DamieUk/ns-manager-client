import GoogleIcon from '@mui/icons-material/AccountCircle';
import { Alert, Box, Button, CircularProgress, Divider, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { getGoogleSignInUrl, getLoginErrorMessage } from '../auth/googleAuth';
import { useAuth } from '../auth/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import { roleHome } from '../routing/roleHome';
import type { LoginResponse } from '../types/auth';

interface LoginLocationState {
  error?: string;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  const oauthErrorMessage = getLoginErrorMessage((location.state as LoginLocationState | null)?.error ?? null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      await login(res.data.token);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <Typography variant="h5" gutterBottom>
        Вхід
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Увійдіть, щоб продовжити
      </Typography>

      {(oauthErrorMessage || error) && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error ?? oauthErrorMessage}
        </Alert>
      )}

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={() => {
          window.location.href = getGoogleSignInUrl();
        }}
      >
        Увійти через Google
      </Button>

      <Divider sx={{ my: 3 }}>або</Divider>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" fullWidth disabled={submitting}>
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Увійти'}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        <MuiLink component={RouterLink} to="/forgot-password">
          Забули пароль?
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
