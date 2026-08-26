import {
  Alert,
  CircularProgress,
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
import { DashboardOrderRow } from '../components/DashboardOrderRow';
import type { DashboardResponse } from '../types/dashboard';

export function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    apiClient
      .get<DashboardResponse>('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function toggle(orderId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Оновлено: {new Date(data.generatedAt).toLocaleString()}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Клієнт</TableCell>
              <TableCell>Продукт</TableCell>
              <TableCell align="right">К-сть</TableCell>
              <TableCell align="right">Залишилось</TableCell>
              <TableCell align="right">Готово</TableCell>
              <TableCell align="right">Потребує виправлення</TableCell>
              <TableCell align="right">Не допаяно</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.orders.map((order) => (
              <DashboardOrderRow
                key={order.orderId}
                order={order}
                expanded={expandedIds.has(order.orderId)}
                onToggle={() => toggle(order.orderId)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
