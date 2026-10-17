import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import { Box, Button, CircularProgress, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useRef, useState, type ChangeEvent } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { OrderDetail, PrepItem, PrepItemKey, PrepStatus } from '../types/orders';
import { formatDateTime } from '../utils/format';
import { DocumentList } from './DocumentList';

const ITEMS: Record<PrepItemKey, { label: string; hint: string; withFile: boolean }> = {
  pnp_program: { label: 'Програма pick-and-place', hint: 'Координати й компоненти для автомата', withFile: true },
  stencil: { label: 'Трафарет', hint: 'Отримано або є з попередньої партії', withFile: false },
  thermal_profile: { label: 'Термопрофіль печі', hint: 'Профіль оплавлення для цієї плати', withFile: true },
};

const STATUS_OPTIONS: Array<{ value: PrepStatus; label: string }> = [
  { value: 'pending', label: 'Очікує' },
  { value: 'done', label: 'Готово' },
  { value: 'not_needed', label: 'Не потрібно' },
];

function StatusIcon({ status }: { status: PrepStatus }) {
  if (status === 'done') return <CheckCircleIcon color="success" />;
  if (status === 'not_needed') return <RemoveCircleOutlineIcon color="disabled" />;
  return <RadioButtonUncheckedIcon color="warning" />;
}

function PrepRow({ order, prep, onChanged, onError }: { order: OrderDetail; prep: PrepItem; onChanged: () => void; onError: (m: string) => void }) {
  const info = ITEMS[prep.item];
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function send(data: FormData) {
    setBusy(true);
    try {
      await apiClient.put(`/orders/${order.id}/prep/${prep.item}`, data);
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function setStatus(status: PrepStatus) {
    const data = new FormData();
    data.append('status', status);
    send(data);
  }

  function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    send(data);
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ py: 1.25, borderTop: '1px solid', borderColor: 'divider', alignItems: { sm: 'center' } }}>
      <Stack direction="row" spacing={1.5} sx={{ flexGrow: 1, minWidth: 0, alignItems: 'flex-start' }}>
        <Box sx={{ pt: 0.25 }}>
          <StatusIcon status={prep.status} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {info.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {prep.updatedBy ? `${prep.updatedBy.name}, ${formatDateTime(prep.updatedAt)}` : info.hint}
          </Typography>
          {prep.document && <DocumentList documents={[prep.document]} dense onError={onError} />}
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {busy && <CircularProgress size={18} />}
        {info.withFile && (
          <>
            <Button size="small" startIcon={<UploadFileIcon />} disabled={busy} onClick={() => input.current?.click()}>
              {prep.document ? 'Замінити' : 'Файл'}
            </Button>
            <input ref={input} type="file" hidden onChange={upload} />
          </>
        )}
        <TextField
          select
          size="small"
          value={prep.status}
          onChange={(e) => setStatus(e.target.value as PrepStatus)}
          disabled={busy}
          sx={{ minWidth: 140, '& .MuiInputBase-input': { py: 0.75, fontSize: 13 } }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  );
}

// What has to be ready before assembly. Owners and the batch's employees tick it off; a file
// attached here also joins the batch's files.
export function BatchPrepCard({ order, onChanged, onError }: { order: OrderDetail; onChanged: () => void; onError: (m: string) => void }) {
  const pending = order.prep.filter((p) => p.status === 'pending').length;
  const active = order.stage === 'prep';
  return (
    <Paper sx={{ p: 2.5, ...(active && { borderColor: 'primary.light', borderWidth: 2 }) }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Підготовка</Typography>
        <Typography variant="caption" color={pending ? 'warning.main' : 'success.main'}>
          {pending ? `Залишилось: ${pending}` : 'Усе готово до монтажу'}
        </Typography>
      </Stack>
      {order.prep.map((p) => (
        <PrepRow key={p.item} order={order} prep={p} onChanged={onChanged} onError={onError} />
      ))}
    </Paper>
  );
}
