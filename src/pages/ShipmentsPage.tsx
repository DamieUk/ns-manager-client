import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link as MuiLink,
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
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { PdfViewerDialog } from '../components/PdfViewerDialog';
import type { Shipment } from '../types/finance';
import { formatDate, formatMoney } from '../utils/format';

// Every delivery note, newest first. New notes are made from a batch's page at the shipping stage.
export function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Shipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shipment | null>(null);

  function load() {
    apiClient
      .get<Shipment[]>('/shipments')
      .then((res) => setShipments(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/shipments/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteTarget(null);
    }
  }

  if (loading) return <CircularProgress />;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Відвантаження
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Видаткові накладні. Нову створюють на сторінці партії, коли вона на етапі «Відвантаження».
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Накладна</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Клієнт</TableCell>
              <TableCell>Партії</TableCell>
              <TableCell>ТТН</TableCell>
              <TableCell align="right">Всього з ПДВ</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {shipments.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>№ {s.number}</TableCell>
                <TableCell>{formatDate(s.shippedAt)}</TableCell>
                <TableCell>{s.client.name}</TableCell>
                <TableCell>
                  {s.lines.map((l, i) => (
                    <Typography key={i} variant="body2">
                      <MuiLink component={Link} to={`/orders/${l.order.id}`} underline="hover">
                        № {l.order.number}
                      </MuiLink>{' '}
                      · {l.quantity} шт.
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>{s.trackingNumber ?? '—'}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                  {formatMoney(s.total)}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" title="PDF" onClick={() => setPreview(s)}>
                    <PictureAsPdfIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" title="Видалити" onClick={() => setDeleteTarget(s)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {shipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">Накладних ще немає</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PdfViewerDialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        src={preview ? `/shipments/${preview.id}/pdf` : null}
        title={preview ? `Видаткова накладна № ${preview.number}` : ''}
        fileName={preview ? `Видаткова накладна ${preview.number}.pdf` : undefined}
      />

      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Видалити накладну № {deleteTarget?.number}?</DialogTitle>
        <DialogContent>Плати з неї знову рахуватимуться невідвантаженими.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Назад</Button>
          <Button color="error" onClick={handleDelete}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
