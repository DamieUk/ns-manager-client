import LockIcon from '@mui/icons-material/LockOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { useAuth } from '../auth/useAuth';
import { OPEN_STAGES, STAGES, type StageInfo } from '../constants/stages';
import type { OrderStage, OrderSummary } from '../types/orders';
import { daysSince, formatDate, formatMoney } from '../utils/format';
import { useIsPhone } from '../utils/useIsPhone';

// On phones a column takes most of the screen, with the next one peeking in.
const COLUMN_WIDTH = { xs: '82vw', sm: 264 };

function BatchCard({ order, onOpen }: { order: OrderSummary; onOpen: () => void }) {
  const blockers = order.blockers ?? [];
  return (
    <Paper
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', order.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onOpen}
      sx={{ p: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.light' }, '&:active': { cursor: 'grabbing' } }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>
          № {order.number}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {order.isOverdue && <Chip size="small" color="error" label="Термін" sx={{ height: 20, fontSize: 11 }} />}
          {blockers.length > 0 && (
            <Tooltip title={blockers.join(' · ')}>
              <LockIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            </Tooltip>
          )}
        </Stack>
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={order.client.name}>
        {order.client.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap title={order.product.name}>
        {order.product.name} · {order.quantity} шт.
      </Typography>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1, gap: 1 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          {order.manager?.name ?? 'Без відповідального'}
        </Typography>
        <Typography variant="caption" color={order.isOverdue ? 'error' : 'text.secondary'} noWrap>
          {order.dueDate ? `до ${formatDate(order.dueDate)}` : daysSince(order.stageChangedAt)}
        </Typography>
      </Stack>
      {order.total != null && (
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mt: 0.25 }}>
          {formatMoney(order.total)} без ПДВ
        </Typography>
      )}
    </Paper>
  );
}

function Column({
  stage,
  orders,
  dropActive,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpen,
}: {
  stage: StageInfo;
  orders: OrderSummary[];
  dropActive: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onOpen: (order: OrderSummary) => void;
}) {
  return (
    <Box
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        width: COLUMN_WIDTH,
        scrollSnapAlign: 'start',
        flexShrink: 0,
        bgcolor: dropActive ? stage.tint : 'background.default',
        border: '1px solid',
        borderColor: dropActive ? stage.color : 'divider',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, borderTop: `4px solid ${stage.color}`, borderRadius: '12px 12px 0 0' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: stage.color }}>
            {stage.label}
          </Typography>
          <Chip size="small" label={orders.length} sx={{ height: 20, bgcolor: stage.tint, color: stage.color }} />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
          {stage.hint}
        </Typography>
      </Box>
      <Stack spacing={1} sx={{ p: 1, overflowY: 'auto', minHeight: 80 }}>
        {orders.map((o) => (
          <BatchCard key={o.id} order={o} onOpen={() => onOpen(o)} />
        ))}
      </Stack>
    </Box>
  );
}

// The owners' board: every open batch in its stage column. Dragging a card to another column
// moves the batch there — the API refuses moves whose requirements aren't met.
export function BoardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [manager, setManager] = useState<'all' | 'me' | 'none'>('all');
  const [showClosed, setShowClosed] = useState(false);
  const [dropTarget, setDropTarget] = useState<OrderStage | null>(null);
  const isPhone = useIsPhone();

  function load() {
    apiClient
      .get<OrderSummary[]>('/orders')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const columns = showClosed ? STAGES : OPEN_STAGES;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (manager === 'me' && o.manager?.id !== user?.id) return false;
      if (manager === 'none' && o.manager) return false;
      if (!q) return true;
      return [o.number, o.client.name, o.product.name].some((v) => v.toLowerCase().includes(q));
    });
  }, [orders, search, manager, user?.id]);

  async function moveTo(orderId: string, stage: OrderStage) {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.stage === stage) return;
    try {
      const res = await apiClient.post<OrderSummary>(`/orders/${orderId}/stage`, { stage });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
    } catch (err) {
      const blockers = axios.isAxiosError<{ blockers?: string[] }>(err) ? err.response?.data?.blockers : undefined;
      setNotice(blockers?.length ? `№ ${order.number}: ${blockers.join('. ')}` : getErrorMessage(err));
    }
  }

  if (loading) return <CircularProgress />;

  return (
    // Fills the screen below the page padding (and the top bar on phones), so columns scroll inside.
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'calc(100dvh - 56px - 40px)', md: 'calc(100vh - 64px)' } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4">Партії</Typography>
          <Typography variant="body2" color="text.secondary">
            {isPhone ? 'Гортайте колонки вбік; відкрийте картку, щоб змінити етап' : 'Перетягніть картку в іншу колонку, щоб змінити етап'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
          <TextField
            size="small"
            placeholder="№, клієнт, продукт"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField select size="small" label="Відповідальний" value={manager} onChange={(e) => setManager(e.target.value as typeof manager)} sx={{ minWidth: 180 }}>
            <MenuItem value="all">Усі</MenuItem>
            <MenuItem value="me">Мої</MenuItem>
            <MenuItem value="none">Без відповідального</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Switch checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />}
            label="Завершені й скасовані"
          />
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ flexGrow: 1, minHeight: 0, overflowX: 'auto', pb: 1, alignItems: 'stretch', scrollSnapType: { xs: 'x mandatory', sm: 'none' } }}
      >
        {columns.map((stage) => (
          <Column
            key={stage.value}
            stage={stage}
            orders={visible.filter((o) => o.stage === stage.value)}
            dropActive={dropTarget === stage.value}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDropTarget(stage.value);
            }}
            onDragLeave={() => setDropTarget((t) => (t === stage.value ? null : t))}
            onDrop={(e) => {
              e.preventDefault();
              setDropTarget(null);
              moveTo(e.dataTransfer.getData('text/plain'), stage.value);
            }}
            onOpen={(o) => navigate(`/orders/${o.id}`)}
          />
        ))}
      </Stack>

      <Snackbar
        open={notice !== null}
        autoHideDuration={6000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" icon={<LockIcon />} onClose={() => setNotice(null)} sx={{ maxWidth: 560 }}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
