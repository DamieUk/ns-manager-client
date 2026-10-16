import { Alert, Box, Button, CircularProgress, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import { useAuth } from '../auth/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import { roleHome } from '../routing/roleHome';

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
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

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

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
