import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
  List,
  ListItem,
  ListItemText,
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
import { Fragment, useEffect, useRef, useState, type ChangeEvent } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { ClientDocument } from '../types/clients';
import type { OrderFormValues } from './OrderForm';
import type { OrderSummary, Product } from '../types/orders';
import { OrderForm } from './OrderForm';

type DocsState = 'loading' | ClientDocument[] | 'error';

interface ClientOrdersSectionProps {
  clientId: string;
  canModify: boolean;
}

export function ClientOrdersSection({ clientId, canModify }: ClientOrdersSectionProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [documentsByOrder, setDocumentsByOrder] = useState<Record<string, DocsState>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetOrderId = useRef<string | null>(null);

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
    if (!canModify) return;
    apiClient.get<Product[]>('/products').then((res) => setProducts(res.data));
  }, [canModify]);

  function loadDocuments(orderId: string) {
    setDocumentsByOrder((prev) => ({ ...prev, [orderId]: 'loading' }));
    apiClient
      .get<ClientDocument[]>('/documents', { params: { relatedType: 'Order', relatedId: orderId } })
      .then((res) => setDocumentsByOrder((prev) => ({ ...prev, [orderId]: res.data })))
      .catch(() => setDocumentsByOrder((prev) => ({ ...prev, [orderId]: 'error' })));
  }

  function toggleExpand(orderId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
        if (!documentsByOrder[orderId]) loadDocuments(orderId);
      }
      return next;
    });
  }

  function openCreate() {
    setEditingOrder(null);
    setFormOpen(true);
  }

  function openEdit(order: OrderSummary) {
    setEditingOrder(order);
    setFormOpen(true);
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

  function triggerUpload(orderId: string) {
    uploadTargetOrderId.current = orderId;
    fileInputRef.current?.click();
  }

  async function handleUploadChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const orderId = uploadTargetOrderId.current;
    if (!file || !orderId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('relatedType', 'Order');
    formData.append('relatedId', orderId);

    try {
      await apiClient.post('/documents', formData);
      loadDocuments(orderId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDeleteDocument(orderId: string, docId: string) {
    try {
      await apiClient.delete(`/documents/${docId}`);
      loadDocuments(orderId);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDownloadDocument(docId: string, originalName: string) {
    try {
      const res = await apiClient.get(`/documents/${docId}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Box sx={{ mt: 3 }}>
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
                const docs = documentsByOrder[order.id];
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
                          <IconButton size="small" onClick={() => openEdit(order)}>
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
                            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2">Документи замовлення</Typography>
                              {canModify && (
                                <Button
                                  size="small"
                                  startIcon={<UploadFileIcon />}
                                  onClick={() => triggerUpload(order.id)}
                                >
                                  Завантажити
                                </Button>
                              )}
                            </Stack>
                            {docs === 'loading' && <CircularProgress size={18} />}
                            {docs === 'error' && <Alert severity="error">Не вдалося завантажити документи</Alert>}
                            {Array.isArray(docs) && docs.length === 0 && (
                              <Typography color="text.secondary" variant="body2">
                                Немає документів
                              </Typography>
                            )}
                            {Array.isArray(docs) && docs.length > 0 && (
                              <List dense>
                                {docs.map((doc) => (
                                  <ListItem
                                    key={doc._id}
                                    disableGutters
                                    secondaryAction={
                                      <>
                                        <IconButton size="small" onClick={() => handleDownloadDocument(doc._id, doc.originalName)}>
                                          <DownloadIcon fontSize="small" />
                                        </IconButton>
                                        {canModify && (
                                          <IconButton size="small" onClick={() => handleDeleteDocument(order.id, doc._id)}>
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        )}
                                      </>
                                    }
                                  >
                                    <ListItemText primary={doc.originalName} />
                                  </ListItem>
                                ))}
                              </List>
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

      <input ref={fileInputRef} type="file" hidden onChange={handleUploadChange} />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} key={editingOrder?.id ?? 'new'}>
        <DialogTitle>{editingOrder ? 'Редагувати замовлення' : 'Нове замовлення'}</DialogTitle>
        <DialogContent>
          <OrderForm
            products={products}
            initialValue={editingOrder}
            submitting={submitting}
            onSubmit={handleSubmitOrder}
            onCancel={() => setFormOpen(false)}
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
