import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { ReportCard } from '../components/ReportCard';
import { ReportDetailDialog } from '../components/ReportDetailDialog';
import { ReportForm } from '../components/ReportForm';
import type { DailyProgress, DailyProgressInput } from '../types/dailyProgress';
import type { OrderSummary } from '../types/orders';

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function buildFormData(values: DailyProgressInput): FormData {
  const formData = new FormData();
  formData.append('order', values.order);
  formData.append('completed', String(values.completed));
  formData.append('needsRework', String(values.needsRework));
  if (values.notes) formData.append('notes', values.notes);
  if (values.photo) formData.append('photo', values.photo);
  return formData;
}

export function ProgressPage() {
  const [entries, setEntries] = useState<DailyProgress[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState(isoDateDaysAgo(6));
  const [to, setTo] = useState(isoDateDaysAgo(0));
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyProgress | null>(null);
  const [detailEntry, setDetailEntry] = useState<DailyProgress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyProgress | null>(null);

  function loadEntries() {
    setLoading(true);
    setError(null);
    apiClient
      .get<DailyProgress[]>('/daily-progress', { params: { from, to } })
      .then((res) => setEntries(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadEntries, [from, to]);

  useEffect(() => {
    apiClient.get<OrderSummary[]>('/orders').then((res) => setOrders(res.data));
  }, []);

  function openCreate() {
    setEditingEntry(null);
    setFormOpen(true);
  }

  function openEdit(entry: DailyProgress) {
    setDetailEntry(null);
    setEditingEntry(entry);
    setFormOpen(true);
  }

  async function handleSubmit(values: DailyProgressInput) {
    setSubmitting(true);
    setError(null);
    try {
      const formData = buildFormData(values);
      if (editingEntry) {
        await apiClient.put(`/daily-progress/${editingEntry.id}`, formData);
      } else {
        await apiClient.post('/daily-progress', formData);
      }
      setFormOpen(false);
      loadEntries();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/daily-progress/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadEntries();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Мій прогрес</Typography>
        <Button variant="contained" onClick={openCreate}>
          Створити звіт
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          type="date"
          label="Від"
          size="small"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          type="date"
          label="До"
          size="small"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {entries.map((entry) => (
            <ReportCard key={entry.id} entry={entry} onClick={() => setDetailEntry(entry)} />
          ))}
          {entries.length === 0 && <Typography color="text.secondary">Немає звітів за цей період</Typography>}
        </Box>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} key={editingEntry?.id ?? 'new'}>
        <DialogTitle>{editingEntry ? 'Редагувати звіт' : 'Створити звіт'}</DialogTitle>
        <DialogContent>
          <ReportForm
            orders={orders}
            initialValue={editingEntry}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ReportDetailDialog
        entry={detailEntry}
        onClose={() => setDetailEntry(null)}
        onEdit={openEdit}
        onDelete={(entry) => {
          setDetailEntry(null);
          setDeleteTarget(entry);
        }}
      />

      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Видалити звіт?</DialogTitle>
        <DialogContent>Цю дію неможливо скасувати.</DialogContent>
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
