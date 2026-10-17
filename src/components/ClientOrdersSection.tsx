import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
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
import type { ClientDocument } from '../types/clients';
import type { OrderDetail, OrderSummary, Product } from '../types/orders';
import type { TeamMember } from '../types/users';
import { formatDate, formatMoney } from '../utils/format';
import { OrderDialog, type OrderFormValues } from './OrderDialog';
import { StageChip } from './StageChip';
import { MobileCard, MobileCardList } from './MobileCard';
import { useIsPhone } from '../utils/useIsPhone';

interface ClientOrdersSectionProps {
  clientId: string;
  canModify: boolean;
  documentPool: ClientDocument[];
  onRefreshClient: () => void;
}

// The client's batches; each opens its own page. A new batch starts at the quote stage.
export function ClientOrdersSection({ clientId, canModify, documentPool, onRefreshClient }: ClientOrdersSectionProps) {
  const navigate = useNavigate();
  const isPhone = useIsPhone();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderSummary | null>(null);

  function loadOrders() {
    setLoading(true);
    apiClient
      .get<OrderSummary[]>('/orders', { params: { client: clientId } })
      .then((res) => setOrders(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadOrders, [clientId]);

  useEffect(() => {
    apiClient.get<Product[]>('/products', { params: { client: clientId } }).then((res) => setProducts(res.data));
  }, [clientId]);

  useEffect(() => {
    apiClient
      .get<TeamMember[]>('/users')
      .then((res) => {
        setManagers(res.data.filter((u) => u.role === 'executive'));
        setEmployees(res.data.filter((u) => u.role === 'employee'));
      })
      .catch(() => {
        setManagers([]);
        setEmployees([]);
      });
  }, []);

  function openCreate() {
    setEditingOrder(null);
    setFormOpen(true);
  }

  async function openEdit(orderId: string) {
    try {
      const res = await apiClient.get<OrderDetail>(`/orders/${orderId}`);
      setEditingOrder(res.data);
      setFormOpen(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleUploadDocument(file: File): Promise<ClientDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client', clientId);
    const res = await apiClient.post<ClientDocument>('/documents', formData);
    onRefreshClient();
    return res.data;
  }

  // Errors propagate to the dialog, which shows them.
  async function handleSubmitOrder(values: OrderFormValues) {
    if (editingOrder) {
      await apiClient.put(`/orders/${editingOrder.id}`, values);
      setFormOpen(false);
      loadOrders();
    } else {
      const res = await apiClient.post<{ id: string }>('/orders', { ...values, client: clientId });
      navigate(`/orders/${res.data.id}`);
    }
  }

  async function handleDeleteOrder() {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/orders/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadOrders();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const columns = canModify ? 7 : 6;

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6">Партії</Typography>
        {canModify && (
          <Button size="small" variant="contained" onClick={openCreate}>
            Нова партія
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress size={24} />
      ) : isPhone ? (
        <MobileCardList empty="Партій ще немає">
          {orders.map((order) => (
            <MobileCard
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              title={`№ ${order.number} · ${order.product.name}`}
              aside={<StageChip stage={order.stage} />}
              lines={[
                `${order.quantity} шт.${order.total != null ? ` · ${formatMoney(order.total)} без ПДВ` : ''}`,
                <>
                  Термін: {formatDate(order.dueDate)}
                  {order.isOverdue && <Chip size="small" color="error" label="Протерміновано" sx={{ ml: 1 }} />}
                </>,
              ]}
              actions={
                canModify ? (
                  <>
                    <IconButton size="small" title="Редагувати" onClick={() => openEdit(order.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title="Видалити" onClick={() => setDeleteTarget(order)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : undefined
              }
            />
          ))}
        </MobileCardList>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Продукт</TableCell>
                <TableCell align="right">Кількість</TableCell>
                <TableCell>Етап</TableCell>
                <TableCell>Термін</TableCell>
                <TableCell align="right">Сума без ПДВ</TableCell>
                {canModify && <TableCell align="right">Дії</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover onClick={() => navigate(`/orders/${order.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{order.number}</TableCell>
                  <TableCell>{order.product.name}</TableCell>
                  <TableCell align="right">{order.quantity}</TableCell>
                  <TableCell>
                    <StageChip stage={order.stage} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDate(order.dueDate)}
                    {order.isOverdue && <Chip size="small" color="error" label="Протерміновано" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {order.total != null ? formatMoney(order.total) : '—'}
                  </TableCell>
                  {canModify && (
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" title="Редагувати" onClick={() => openEdit(order.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="Видалити" onClick={() => setDeleteTarget(order)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns}>
                    <Typography color="text.secondary">Партій ще немає</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {formOpen && (
        <OrderDialog
          key={editingOrder?.id ?? 'new'}
          products={products}
          documentPool={documentPool}
          managers={managers}
          employees={employees}
          initialValue={editingOrder}
          onSubmit={handleSubmitOrder}
          onClose={() => setFormOpen(false)}
          onUploadDocument={handleUploadDocument}
        />
      )}

      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Видалити партію № {deleteTarget?.number}?</DialogTitle>
        <DialogContent>Партія зникне разом з історією. Цю дію неможливо скасувати.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Назад</Button>
          <Button color="error" onClick={handleDeleteOrder}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
