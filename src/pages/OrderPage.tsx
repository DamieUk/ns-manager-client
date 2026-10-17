import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
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
  LinearProgress,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { BatchAnnexCard } from '../components/BatchAnnexCard';
import { BatchInvoicesCard } from '../components/BatchInvoicesCard';
import { BatchPurchasesCard } from '../components/BatchPurchasesCard';
import { BatchPrepCard } from '../components/BatchPrepCard';
import { BatchQcCard } from '../components/BatchQcCard';
import { BatchShippingCard } from '../components/BatchShippingCard';
import { stageIndex } from '../constants/stages';
import { BatchPriceCard } from '../components/BatchPriceCard';
import { BatchStageCard } from '../components/BatchStageCard';
import { DocumentList } from '../components/DocumentList';
import { OrderDialog, type OrderFormValues } from '../components/OrderDialog';
import { StageChip } from '../components/StageChip';
import { StageHistory } from '../components/StageHistory';
import type { ClientDocument, DocumentType } from '../types/clients';
import type { OrderDetail, Product } from '../types/orders';
import type { TeamMember } from '../types/users';
import { formatDate } from '../utils/format';

interface EditData {
  products: Product[];
  documents: ClientDocument[];
  managers: TeamMember[];
  employees: TeamMember[];
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
}

function Counter({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Box sx={{ flex: '1 1 0', minWidth: 90 }}>
      <Typography variant="h5" sx={{ color }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

// One batch (партія): its stage and the way on, price and annex (owners), team, assembly
// progress, files and history.
export function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const isOwner = user?.role === 'executive';
  const canModify = hasPermission(user, 'ORDERS', 'modify');

  function load() {
    apiClient
      .get<OrderDetail>(`/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [orderId]);

  async function openEdit() {
    if (!order) return;
    try {
      const [products, documents, users] = await Promise.all([
        apiClient.get<Product[]>('/products', { params: { client: order.client.id } }),
        apiClient.get<ClientDocument[]>('/documents', { params: { client: order.client.id } }),
        apiClient.get<TeamMember[]>('/users'),
      ]);
      setEditData({
        products: products.data,
        documents: documents.data,
        managers: users.data.filter((u) => u.role === 'executive'),
        employees: users.data.filter((u) => u.role === 'employee'),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function uploadDocument(file: File, type: DocumentType = 'other'): Promise<ClientDocument> {
    const data = new FormData();
    data.append('file', file);
    data.append('client', order!.client.id);
    data.append('type', type);
    const res = await apiClient.post<ClientDocument>('/documents', data);
    return res.data;
  }

  // Errors propagate to the dialog, which shows them.
  async function handleSubmit(values: OrderFormValues) {
    await apiClient.put(`/orders/${order!.id}`, values);
    setEditData(null);
    load();
  }

  async function handleDelete() {
    try {
      await apiClient.delete(`/orders/${order!.id}`);
      navigate(`/clients/${order!.client.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setConfirmDelete(false);
    }
  }

  async function setDocuments(ids: string[]) {
    try {
      await apiClient.put(`/orders/${order!.id}`, { documents: ids });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    try {
      const docs = [];
      for (const file of files) docs.push(await uploadDocument(file));
      await setDocuments([...order!.documents.map((d) => d._id), ...docs.map((d) => d._id)]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function changeDocumentType(docId: string, type: DocumentType) {
    try {
      await apiClient.put(`/documents/${docId}`, { type });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <CircularProgress />;
  if (!order) return error ? <Alert severity="error">{error}</Alert> : null;

  const done = Math.min(order.progress.completed, order.quantity);

  return (
    <>
      <Button
        component={Link}
        to={isOwner ? `/clients/${order.client.id}` : '/my-orders'}
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 1 }}
      >
        {isOwner ? order.client.name : 'Мої замовлення'}
      </Button>

      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
            <Typography variant="h4">Партія № {order.number}</Typography>
            <StageChip stage={order.stage} size="medium" />
            {order.isOverdue && <Chip color="error" label="Протерміновано" />}
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {isOwner ? (
              <MuiLink component={Link} to={`/clients/${order.client.id}`} underline="hover" color="inherit">
                {order.client.name}
              </MuiLink>
            ) : (
              order.client.name
            )}{' '}
            · {order.product.name} · {order.quantity} шт.
          </Typography>
        </Box>
        {canModify && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={openEdit}>
              Редагувати
            </Button>
            <Button color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmDelete(true)}>
              Видалити
            </Button>
          </Stack>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <BatchStageCard order={order} canChange={isOwner} onChanged={load} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 2.5, alignItems: 'start' }}>
          <Stack spacing={2.5}>
            {isOwner && <BatchPriceCard order={order} canModify={isOwner} onSaved={load} />}
            {isOwner && <BatchAnnexCard order={order} canModify={canModify} onChanged={load} onError={setError} />}
            {isOwner && <BatchInvoicesCard order={order} onChanged={load} onError={setError} />}
            {isOwner && <BatchPurchasesCard order={order} onChanged={load} onError={setError} />}
            <BatchPrepCard order={order} onChanged={load} onError={setError} />
            {stageIndex(order.stage) >= stageIndex('qc') && <BatchQcCard active={order.stage === 'qc'} />}
            <BatchShippingCard order={order} canModify={isOwner} onChanged={load} />

            <Paper sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Файли партії</Typography>
                {canModify && (
                  <>
                    <Button
                      size="small"
                      startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileIcon />}
                      disabled={uploading}
                      onClick={() => fileInput.current?.click()}
                    >
                      Додати файли
                    </Button>
                    <input ref={fileInput} type="file" multiple hidden onChange={handleFiles} />
                  </>
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                BOM, програма P&P, термопрофіль, фото: працівники партії бачать ці файли.
              </Typography>
              <DocumentList
                documents={order.documents}
                showType
                onChangeType={canModify ? changeDocumentType : undefined}
                onDetach={canModify ? (docId) => setDocuments(order.documents.filter((d) => d._id !== docId).map((d) => d._id)) : undefined}
                emptyText="Файлів ще немає"
                onError={setError}
              />
            </Paper>
          </Stack>

          <Stack spacing={2.5}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Партія
              </Typography>
              <Field label="Опис">
                <Box component="span" sx={{ whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                  {order.description || '—'}
                </Box>
              </Field>
              <Field label="Відповідальний">{order.manager?.name ?? '—'}</Field>
              <Field label="Працівники">
                {order.assignedEmployees.length > 0 ? order.assignedEmployees.map((e) => e.name).join(', ') : '—'}
              </Field>
              <Field label="Термін виконання">
                <Box component="span" sx={{ color: order.isOverdue ? 'error.main' : undefined }}>
                  {formatDate(order.dueDate)}
                </Box>
              </Field>
              <Field label="Створено">{formatDate(order.createdAt)}</Field>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Монтаж
              </Typography>
              <LinearProgress
                variant="determinate"
                value={order.quantity > 0 ? (done / order.quantity) * 100 : 0}
                sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
              />
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Counter label="Готово" value={order.progress.completed} />
                <Counter label="Залишилось" value={order.progress.remaining} />
                <Counter label="Виправити" value={order.progress.needsRework} color={order.progress.needsRework ? 'error.main' : undefined} />
                <Counter label="Не допаяно" value={order.progress.partiallyAssembled} />
              </Stack>
            </Paper>

            <StageHistory events={order.history} />
          </Stack>
        </Box>
      </Stack>

      {editData && (
        <OrderDialog
          products={editData.products}
          documentPool={editData.documents}
          managers={editData.managers}
          employees={editData.employees}
          initialValue={order}
          onSubmit={handleSubmit}
          onClose={() => setEditData(null)}
          onUploadDocument={(file) => uploadDocument(file)}
        />
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Видалити партію № {order.number}?</DialogTitle>
        <DialogContent>Партія зникне разом з історією. Скасовану партію краще залишити — для історії.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Назад</Button>
          <Button color="error" onClick={handleDelete}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
