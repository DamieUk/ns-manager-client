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
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { StageChip } from '../components/StageChip';
import type { MyOrder } from '../types/myOrders';
import { formatDate } from '../utils/format';
import { MobileCard, MobileCardList } from '../components/MobileCard';
import { useIsPhone } from '../utils/useIsPhone';

export function MyOrdersPage() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isPhone = useIsPhone();

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

      {isPhone ? (
        <MobileCardList empty="Вас ще не призначено на жодну партію">
          {orders.map((order) => (
            <MobileCard
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              title={`№ ${order.number} · ${order.product.name}`}
              aside={<StageChip stage={order.stage} />}
              lines={[
                order.client.name,
                `Зроблено ${order.completed} з ${order.quantity} · залишилось ${order.remaining}`,
                <>
                  Термін: {formatDate(order.dueDate)}
                  {order.isOverdue && <Chip size="small" color="error" label="Протерміновано" sx={{ ml: 1 }} />}
                </>,
              ]}
            />
          ))}
        </MobileCardList>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Партія</TableCell>
                <TableCell>Клієнт</TableCell>
                <TableCell>Продукт</TableCell>
                <TableCell>Етап</TableCell>
                <TableCell>Термін виконання</TableCell>
                <TableCell align="right">Зроблено</TableCell>
                <TableCell align="right">Залишилось</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover onClick={() => navigate(`/orders/${order.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 700 }}>№ {order.number}</TableCell>
                  <TableCell>{order.client.name}</TableCell>
                  <TableCell>{order.product.name}</TableCell>
                  <TableCell>
                    <StageChip stage={order.stage} />
                  </TableCell>
                  <TableCell>
                    {formatDate(order.dueDate)}
                    {order.isOverdue && <Chip size="small" color="error" label="Протерміновано" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell align="right">{order.completed}</TableCell>
                  <TableCell align="right">{order.remaining}</TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color="text.secondary">Вас ще не призначено на жодну партію</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
