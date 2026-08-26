import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { CreateClientForm, type CreateClientFormValues } from '../components/CreateClientForm';
import type { Client } from '../types/clients';
import type { OrderSummary } from '../types/orders';

type OrdersState = 'loading' | OrderSummary[] | 'error';

export function ClientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ordersByClient, setOrdersByClient] = useState<Record<string, OrdersState>>({});

  function loadClients() {
    setLoading(true);
    apiClient
      .get<Client[]>('/clients')
      .then((res) => setClients(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadClients, []);

  function handleExpand(clientId: string) {
    if (ordersByClient[clientId]) return;
    setOrdersByClient((prev) => ({ ...prev, [clientId]: 'loading' }));
    apiClient
      .get<OrderSummary[]>('/orders', { params: { client: clientId } })
      .then((res) => setOrdersByClient((prev) => ({ ...prev, [clientId]: res.data })))
      .catch(() => setOrdersByClient((prev) => ({ ...prev, [clientId]: 'error' })));
  }

  async function handleCreate(values: CreateClientFormValues) {
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('code', values.code);
    if (values.contactName) formData.append('contactName', values.contactName);
    if (values.email) formData.append('email', values.email);
    if (values.phone) formData.append('phone', values.phone);
    if (values.address) formData.append('address', values.address);
    if (values.notes) formData.append('notes', values.notes);
    if (values.contractFile) formData.append('contract', values.contractFile);
    values.supportingFiles.forEach((file) => formData.append('documents', file));

    try {
      const res = await apiClient.post<Client>('/clients', formData);
      setDialogOpen(false);
      navigate(`/clients/${res.data._id}`);
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

      <Stack spacing={1}>
        {clients.map((client) => {
          const orders = ordersByClient[client._id];
          return (
            <Accordion key={client._id} onChange={(_, expanded) => expanded && handleExpand(client._id)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700 }}>{client.name}</Typography>
                    {client.code && <Chip size="small" label={client.code} />}
                  </Stack>
                  <Button
                    component="span"
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clients/${client._id}`);
                    }}
                  >
                    Детальніше
                  </Button>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {orders === 'loading' && <CircularProgress size={20} />}
                {orders === 'error' && <Alert severity="error">Не вдалося завантажити замовлення</Alert>}
                {Array.isArray(orders) && orders.length === 0 && (
                  <Typography color="text.secondary">Немає замовлень</Typography>
                )}
                {Array.isArray(orders) && orders.length > 0 && (
                  <List dense>
                    {orders.map((order) => (
                      <ListItem key={order.id} disableGutters>
                        <ListItemText
                          primary={order.product.name}
                          secondary={`Кількість: ${order.quantity} · Статус: ${order.status}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Новий клієнт</DialogTitle>
        <DialogContent>
          <CreateClientForm submitting={submitting} onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
