import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import type { Client } from '../types/clients';

export function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function loadClients() {
    setLoading(true);
    apiClient
      .get<Client[]>('/clients')
      .then((res) => setClients(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadClients, []);

  async function handleCreate() {
    setSubmitting(true);
    try {
      await apiClient.post('/clients', { name });
      setDialogOpen(false);
      setName('');
      loadClients();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <CircularProgress />;

  const canModify = hasPermission(user, 'ORDERS', 'modify');

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Клієнти
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {canModify && (
        <Button variant="contained" onClick={() => setDialogOpen(true)} sx={{ mb: 2 }}>
          Новий клієнт
        </Button>
      )}

      <List component={Paper}>
        {clients.map((client) => (
          <ListItemButton key={client._id} component={RouterLink} to={`/clients/${client._id}`}>
            <ListItemText primary={client.name} secondary={client.contactName} />
          </ListItemButton>
        ))}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Новий клієнт</DialogTitle>
        <DialogContent>
          <Stack sx={{ mt: 1, minWidth: 300 }}>
            <TextField label="Назва" value={name} onChange={(e) => setName(e.target.value)} required />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Скасувати</Button>
          <Button variant="contained" disabled={!name || submitting} onClick={handleCreate}>
            Створити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
