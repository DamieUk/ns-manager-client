import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import {
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { PdfViewerDialog } from '../components/PdfViewerDialog';
import { StatCard } from '../components/StatCard';
import { INVOICE_KIND_LABELS, invoiceState } from '../constants/finance';
import type { InvoiceListItem } from '../types/finance';
import { formatDate, formatMoney } from '../utils/format';

type Filter = 'open' | 'paid' | 'cancelled' | 'all';

const sum = (list: InvoiceListItem[], pick: (i: InvoiceListItem) => number) => list.reduce((acc, i) => acc + pick(i), 0);

// Every invoice across batches: what we are waiting for, what is overdue, what has come in.
export function InvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('open');
  const [preview, setPreview] = useState<InvoiceListItem | null>(null);

  useEffect(() => {
    apiClient
      .get<InvoiceListItem[]>('/invoices')
      .then((res) => setInvoices(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(
    () => invoices.filter((i) => filter === 'all' || (filter === 'open' ? i.status === 'issued' : i.status === filter)),
    [invoices, filter]
  );

  const open = invoices.filter((i) => i.status === 'issued');
  const overdue = open.filter((i) => i.isOverdue);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const paidThisMonth = invoices.filter((i) => i.paidAt && new Date(i.paidAt) >= monthStart);

  if (loading) return <CircularProgress />;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Рахунки
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <StatCard
          label="Очікуємо оплат, грн"
          value={Math.round(sum(open, (i) => i.total - (i.paidAmount ?? 0)))}
          icon={<PaymentsOutlinedIcon fontSize="small" sx={{ color: '#fff' }} />}
          highlight
        />
        <StatCard
          label="Протерміновано, грн"
          value={Math.round(sum(overdue, (i) => i.total - (i.paidAmount ?? 0)))}
          icon={<AssignmentLateOutlinedIcon fontSize="small" color="error" />}
        />
        <StatCard
          label="Отримано цього місяця, грн"
          value={Math.round(sum(paidThisMonth, (i) => i.paidAmount ?? 0))}
          icon={<TaskAltOutlinedIcon fontSize="small" color="success" />}
        />
      </Stack>

      <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 2 }}>
        <Tab value="open" label={`Очікують оплати (${open.length})`} />
        <Tab value="paid" label="Оплачені" />
        <Tab value="cancelled" label="Скасовані" />
        <Tab value="all" label="Усі" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Рахунок</TableCell>
              <TableCell>Клієнт</TableCell>
              <TableCell>Партія</TableCell>
              <TableCell>Призначення</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Сплатити до</TableCell>
              <TableCell align="right">До сплати</TableCell>
              <TableCell>Стан</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((i) => {
              const state = invoiceState(i);
              return (
                <TableRow key={i.id} hover onClick={() => navigate(`/orders/${i.order.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>№ {i.number}</TableCell>
                  <TableCell>{i.client.name}</TableCell>
                  <TableCell>
                    № {i.order.number} · {i.order.product.name}
                  </TableCell>
                  <TableCell>{INVOICE_KIND_LABELS[i.kind]}</TableCell>
                  <TableCell>{formatDate(i.issuedAt)}</TableCell>
                  <TableCell sx={{ color: i.isOverdue ? 'error.main' : undefined }}>{formatDate(i.dueAt)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                    {formatMoney(i.total)}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" color={state.color} variant={i.status === 'paid' ? 'filled' : 'outlined'} label={state.label} />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" title="PDF" onClick={() => setPreview(i)}>
                      <PictureAsPdfIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {shown.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography color="text.secondary">Рахунків немає</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PdfViewerDialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        src={preview ? `/invoices/${preview.id}/pdf` : null}
        title={preview ? `Рахунок № ${preview.number}` : ''}
        fileName={preview ? `Рахунок ${preview.number}.pdf` : undefined}
      />
    </>
  );
}
