import {
  Alert,
  Chip,
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
import type { MyOrder } from '../types/myOrders';

export function MyOrdersPage() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<MyOrder[]>('/orders/mine')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Мої замовлення
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Клієнт</TableCell>
              <TableCell>Продукт</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Термін виконання</TableCell>
              <TableCell align="right">Зроблено</TableCell>
              <TableCell align="right">Залишилось</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} sx={order.isOverdue ? { bgcolor: 'error.light' } : undefined}>
                <TableCell>{order.client.name}</TableCell>
                <TableCell>{order.product.name}</TableCell>
                <TableCell>
                  <Chip size="small" label={order.status} />
                </TableCell>
                <TableCell>
                  {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '—'}
                  {order.isOverdue && <Chip size="small" color="error" label="Протерміновано" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell align="right">{order.completed}</TableCell>
                <TableCell align="right">{order.remaining}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">Немає заасайнених замовлень</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
