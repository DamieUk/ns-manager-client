import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { EditClientForm } from '../components/EditClientForm';
import type { Client, ClientInput } from '../types/clients';
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
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

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

  async function handleEdit(values: ClientInput) {
    if (!editingClient) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.put(`/clients/${editingClient._id}`, values);
      setEditingClient(null);
      loadClients();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRestore(client: Client) {
    setError(null);
    try {
      await apiClient.put(`/clients/${client._id}`, { status: 'active' });
      loadClients();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.status === 'deleted') {
        await apiClient.delete(`/clients/${deleteTarget._id}`);
      } else {
        await apiClient.put(`/clients/${deleteTarget._id}`, { status: 'deleted' });
      }
      setDeleteTarget(null);
      loadClients();
    } catch (err) {
      setError(getErrorMessage(err));
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
                    {client.status === 'deleted' && <Chip size="small" color="error" label="Видалено" />}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
                    {canModify && client.status === 'deleted' && (
                      <IconButton
                        component="span"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(client);
                        }}
                      >
                        <RestoreIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canModify && client.status !== 'deleted' && (
                      <IconButton
                        component="span"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingClient(client);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canModify && (
                      <IconButton
                        component="span"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(client);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
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

      <Dialog open={editingClient !== null} onClose={() => setEditingClient(null)}>
        <DialogTitle>Редагувати клієнта</DialogTitle>
        <DialogContent>
          {editingClient && (
            <EditClientForm
              client={editingClient}
              submitting={submitting}
              onSubmit={handleEdit}
              onCancel={() => setEditingClient(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        {deleteTarget?.status === 'deleted' ? (
          <>
            <DialogTitle>Видалити клієнта назавжди?</DialogTitle>
            <DialogContent>
              Цю дію неможливо скасувати. Усі замовлення, продукти, контракти та документи цього клієнта теж будуть
              видалені.
            </DialogContent>
          </>
        ) : (
          <>
            <DialogTitle>Позначити клієнта як видаленого?</DialogTitle>
            <DialogContent>
              Клієнт зникне з активного використання, але всі його замовлення, продукти, контракти та документи
              залишаться. Пізніше його можна відновити або видалити назавжди.
            </DialogContent>
          </>
        )}
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Скасувати</Button>
          <Button color="error" onClick={handleDelete}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
