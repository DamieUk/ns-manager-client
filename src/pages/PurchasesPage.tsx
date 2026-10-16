import {
  Alert,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { PurchaseStatusSelect } from '../components/PurchaseStatusSelect';
import { PURCHASE_CATEGORY_LABELS } from '../constants/finance';
import type { PurchaseListItem, PurchaseStatus } from '../types/finance';
import { formatDate, formatMoney } from '../utils/format';

// Procurement across batches: what is ordered, in transit or late.
export function PurchasesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  function load() {
    apiClient
      .get<PurchaseListItem[]>('/purchases', { params: showAll ? {} : { open: 1 } })
      .then((res) => setPurchases(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [showAll]);

  async function setStatus(p: PurchaseListItem, status: PurchaseStatus) {
    try {
      await apiClient.put(`/purchases/${p.id}`, { status });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <CircularProgress />;

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4">Закупівлі</Typography>
        <FormControlLabel control={<Switch checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />} label="Показати отримані й скасовані" />
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Партія</TableCell>
              <TableCell>Клієнт</TableCell>
              <TableCell>Що</TableCell>
              <TableCell>Постачальник</TableCell>
              <TableCell>Замовлення / трек</TableCell>
              <TableCell>Очікуємо</TableCell>
              <TableCell align="right">Вартість</TableCell>
              <TableCell>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((p) => (
              <TableRow key={p.id} hover onClick={() => navigate(`/orders/${p.order.id}`)} sx={{ cursor: 'pointer' }}>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>№ {p.order.number}</TableCell>
                <TableCell>{p.client.name}</TableCell>
                <TableCell>
                  {PURCHASE_CATEGORY_LABELS[p.category]}
                  {p.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap title={p.description}>
                      {p.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{p.supplier}</TableCell>
                <TableCell>
                  {p.supplierOrderNo ?? '—'}
                  {p.trackingNumber && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {p.trackingNumber}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {p.receivedAt ? `отримано ${formatDate(p.receivedAt)}` : formatDate(p.expectedAt)}
                  {p.isLate && <Chip size="small" color="error" label="Затримка" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {p.cost != null ? formatMoney(p.cost, p.currency ?? 'UAH') : '—'}
                </TableCell>
                <TableCell>
                  <PurchaseStatusSelect value={p.status} onChange={(status) => setStatus(p, status)} />
                </TableCell>
              </TableRow>
            ))}
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary">{showAll ? 'Закупівель ще немає' : 'Усе отримано — нічого не очікуємо'}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
