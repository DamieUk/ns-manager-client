import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
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
import { Fragment, useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { ClientDocument } from '../types/clients';
import type { OrderDetail, OrderSummary, Product } from '../types/orders';
import type { TeamMember } from '../types/users';
import { DocumentList } from './DocumentList';
import { OrderForm, type OrderFormValues } from './OrderForm';

type OrderDetailState = 'loading' | OrderDetail | 'error';

interface ClientOrdersSectionProps {
  clientId: string;
  canModify: boolean;
  documentPool: ClientDocument[];
  onRefreshClient: () => void;
}

export function ClientOrdersSection({ clientId, canModify, documentPool, onRefreshClient }: ClientOrdersSectionProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [detailsById, setDetailsById] = useState<Record<string, OrderDetailState>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
        setManagers(res.data.filter((u) => u.role === 'executive' || u.role === 'manager'));
        setEmployees(res.data.filter((u) => u.role === 'employee'));
      })
      .catch(() => {
        setManagers([]);
        setEmployees([]);
      });
  }, []);

  function loadOrderDetail(orderId: string) {
    setDetailsById((prev) => ({ ...prev, [orderId]: 'loading' }));
    apiClient
      .get<OrderDetail>(`/orders/${orderId}`)
      .then((res) => setDetailsById((prev) => ({ ...prev, [orderId]: res.data })))
      .catch(() => setDetailsById((prev) => ({ ...prev, [orderId]: 'error' })));
  }

  function toggleExpand(orderId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
        loadOrderDetail(orderId);
      }
      return next;
    });
  }

  function openCreate() {
    setEditingOrder(null);
    setFormOpen(true);
  }

  async function openEdit(orderId: string) {
    const cached = detailsById[orderId];
    if (cached && cached !== 'loading' && cached !== 'error') {
      setEditingOrder(cached);
    } else {
      const res = await apiClient.get<OrderDetail>(`/orders/${orderId}`);
      setEditingOrder(res.data);
    }
    setFormOpen(true);
  }

  async function handleUploadDocument(file: File): Promise<ClientDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client', clientId);
    const res = await apiClient.post<ClientDocument>('/documents', formData);
    onRefreshClient();
    return res.data;
  }

  async function handleSubmitOrder(values: OrderFormValues) {
    setSubmitting(true);
    try {
      if (editingOrder) {
        await apiClient.put(`/orders/${editingOrder.id}`, values);
      } else {
        await apiClient.post('/orders', { ...values, client: clientId });
      }
      setFormOpen(false);
      loadOrders();
      if (editingOrder) loadOrderDetail(editingOrder.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteOrder() {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/orders/${deleteTargetId}`);
      setDeleteTargetId(null);
      loadOrders();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDetachDocument(order: OrderDetail, docId: string) {
    try {
      const remaining = order.documents.filter((d) => d._id !== docId).map((d) => d._id);
      await apiClient.put(`/orders/${order.id}`, { documents: remaining });
      loadOrderDetail(order.id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Замовлення</Typography>
        {canModify && (
          <Button size="small" variant="contained" onClick={openCreate}>
            Нове замовлення
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Продукт</TableCell>
                <TableCell align="right">Кількість</TableCell>
                <TableCell>Статус</TableCell>
                {canModify && <TableCell align="right">Дії</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const expanded = expandedIds.has(order.id);
                const detail = detailsById[order.id];
                return (
                  <Fragment key={order.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleExpand(order.id)}
                          sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                        >
                          <ExpandMoreIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>{order.product.name}</TableCell>
                      <TableCell align="right">{order.quantity}</TableCell>
                      <TableCell>
                        <Chip size="small" label={order.status} />
                      </TableCell>
                      {canModify && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(order.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteTargetId(order.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={canModify ? 5 : 4} sx={{ py: 0, borderBottom: expanded ? undefined : 'none' }}>
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2 }}>
                            {order.description && (
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                {order.description}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              Менеджер: {order.manager?.name ?? '—'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              Працівники:{' '}
                              {order.assignedEmployees.length > 0
                                ? order.assignedEmployees.map((e) => e.name).join(', ')
                                : '—'}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Документи замовлення
                            </Typography>
                            {detail === 'loading' && <CircularProgress size={18} />}
                            {detail === 'error' && <Alert severity="error">Не вдалося завантажити деталі</Alert>}
                            {detail && detail !== 'loading' && detail !== 'error' && (
                              <DocumentList
                                documents={detail.documents}
                                onDetach={canModify ? (docId) => handleDetachDocument(detail, docId) : undefined}
                                onError={setError}
                              />
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canModify ? 5 : 4}>
                    <Typography color="text.secondary">Немає замовлень</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} key={editingOrder?.id ?? 'new'}>
        <DialogTitle>{editingOrder ? 'Редагувати замовлення' : 'Нове замовлення'}</DialogTitle>
        <DialogContent>
          <OrderForm
            products={products}
            documentPool={documentPool}
            managers={managers}
            employees={employees}
            initialValue={editingOrder}
            submitting={submitting}
            onSubmit={handleSubmitOrder}
            onCancel={() => setFormOpen(false)}
            onUploadDocument={handleUploadDocument}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle>Видалити замовлення?</DialogTitle>
        <DialogContent>Цю дію неможливо скасувати.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetId(null)}>Скасувати</Button>
          <Button color="error" onClick={handleDeleteOrder}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
