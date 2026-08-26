import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { DailyProgressForm } from '../components/DailyProgressForm';
import type { DailyProgress, DailyProgressInput } from '../types/dailyProgress';
import type { OrderSummary } from '../types/orders';

export function ProgressPage() {
  const [entries, setEntries] = useState<DailyProgress[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyProgress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([apiClient.get<DailyProgress[]>('/daily-progress'), apiClient.get<OrderSummary[]>('/orders')])
      .then(([entriesRes, ordersRes]) => {
        setEntries(entriesRes.data);
        setOrders(ordersRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  function openCreate() {
    setEditingEntry(null);
    setFormOpen(true);
  }

  function openEdit(entry: DailyProgress) {
    setEditingEntry(entry);
    setFormOpen(true);
  }

  async function handleSubmit(values: DailyProgressInput) {
    setSubmitting(true);
    try {
      if (editingEntry) {
        await apiClient.put(`/daily-progress/${editingEntry.id}`, values);
      } else {
        await apiClient.post('/daily-progress', values);
      }
      setFormOpen(false);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/daily-progress/${deleteTargetId}`);
      setDeleteTargetId(null);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <CircularProgress />;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Мій прогрес
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" onClick={openCreate} sx={{ mb: 2 }}>
        Новий запис
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Замовлення</TableCell>
              <TableCell align="right">Готово</TableCell>
              <TableCell align="right">Потребує виправлення</TableCell>
              <TableCell align="right">Не допаяно</TableCell>
              <TableCell>Нотатки</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {entry.order.client.name} — {entry.order.product.name}
                </TableCell>
                <TableCell align="right">{entry.completed}</TableCell>
                <TableCell align="right">{entry.needsRework}</TableCell>
                <TableCell align="right">{entry.partiallyAssembled}</TableCell>
                <TableCell>{entry.notes}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(entry)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleteTargetId(entry.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} key={editingEntry?.id ?? 'new'}>
        <DialogTitle>{editingEntry ? 'Редагувати запис' : 'Новий запис'}</DialogTitle>
        <DialogContent>
          <DailyProgressForm
            orders={orders}
            initialValue={editingEntry}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle>Видалити запис?</DialogTitle>
        <DialogContent>Цю дію неможливо скасувати.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetId(null)}>Скасувати</Button>
          <Button color="error" onClick={handleDelete}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
