import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useState, type FormEvent } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { CONTRACT_TYPE_OPTIONS } from '../constants/documents';
import type { Contract, ContractType } from '../types/clients';
import type { OrderSummary } from '../types/orders';
import { toDateInput } from '../utils/format';
import { FileDropzone } from './FileDropzone';

interface ContractDialogProps {
  clientId: string;
  // Edit this contract; otherwise create a new one of `defaultType`.
  contract: Contract | null;
  defaultType: ContractType;
  orders: Array<Pick<OrderSummary, 'id' | 'number' | 'product' | 'quantity'>>;
  // For a new annex opened from a batch page: that batch, and no other type to choose.
  defaultOrder?: string;
  lockType?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const TITLE_HINT: Record<ContractType, string> = {
  nda: 'NDA',
  framework: 'Рамковий договір',
  annex: 'Додаток до договору',
};

// NDA, framework contract or an annex for one batch, with its number, signing date and the
// signed scans. Saving with a signing date marks the contract as in force.
export function ContractDialog({ clientId, contract, defaultType, orders, defaultOrder, lockType, onClose, onSaved }: ContractDialogProps) {
  const [type, setType] = useState<ContractType>(contract?.type ?? defaultType);
  const [number, setNumber] = useState(contract?.number ?? '');
  const [signedAt, setSignedAt] = useState(toDateInput(contract?.signedAt));
  const [order, setOrder] = useState(contract?.order ?? defaultOrder ?? '');
  const [title, setTitle] = useState(contract?.title ?? '');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData();
    data.append('client', clientId);
    data.append('type', type);
    data.append('number', number.trim());
    data.append('signedAt', signedAt);
    data.append('order', type === 'annex' ? order : '');
    if (title.trim()) data.append('title', title.trim());
    files.forEach((f) => data.append('files', f));
    try {
      if (contract) await apiClient.put(`/contracts/${contract._id}`, data);
      else await apiClient.post('/contracts', data);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{contract ? contract.title : `Новий документ: ${TITLE_HINT[type]}`}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField select label="Тип" value={type} onChange={(e) => setType(e.target.value as ContractType)} disabled={lockType}>
            {CONTRACT_TYPE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          {type === 'annex' && (
            <TextField select label="Партія" value={order} onChange={(e) => setOrder(e.target.value)} disabled={lockType}>
              <MenuItem value="">Не прив'язано</MenuItem>
              {orders.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  № {o.number} · {o.product.name} × {o.quantity}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField label="Номер" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="наприклад 12/2026" />
          <TextField
            type="date"
            label="Дата підпису"
            value={signedAt}
            onChange={(e) => setSignedAt(e.target.value)}
            helperText="Порожньо — ще не підписано"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Назва"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Якщо порожньо — «${TITLE_HINT[type]}${number.trim() ? ` № ${number.trim()}` : ''}»`}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FileDropzone
            label={contract ? 'Додати скани (підписаний примірник тощо)' : 'Скан документа (PDF, фото)'}
            multiple
            files={files}
            onChange={setFiles}
          />
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button onClick={onClose} disabled={submitting}>
              Скасувати
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : 'Зберегти'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
