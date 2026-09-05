import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { TeamMember } from '../types/users';

const MIN_PASSWORD_LENGTH = 8;

interface SetPasswordDialogProps {
  user: TeamMember | null;
  onClose: () => void;
}

export function SetPasswordDialog({ user, onClose }: SetPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setPassword('');
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!user) return;
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Пароль має містити щонайменше ${MIN_PASSWORD_LENGTH} символів`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.put(`/users/${user.id}/password`, { password });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={user !== null} onClose={handleClose}>
      <DialogTitle>Скинути пароль</DialogTitle>
      <DialogContent>
        {user && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Новий пароль для {user.firstName} {user.lastName} ({user.email}). Повідомте його працівнику окремо —
            листа не надсилається.
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          type={showPassword ? 'text' : 'password'}
          label="Новий пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          autoFocus
          slotProps={{
            input: {
              endAdornment: (
                <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              ),
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Скасувати
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Встановити'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
