import EditIcon from '@mui/icons-material/EditOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import { Box, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import type { OrderSummary } from '../types/orders';
import { formatMoney } from '../utils/format';
import { PriceDialog } from './PriceDialog';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 800 : 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

// The quote in the client's currency and the batch price in UAH that goes into the annex and
// invoices. Locked from the invoicing stage on.
export function BatchPriceCard({ order, canModify, onSaved }: { order: OrderSummary; canModify: boolean; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const hasQuote = order.quoteAmount != null && order.quoteCurrency;
  const perBoard = order.priceUah != null && order.quantity > 0 ? order.priceUah / order.quantity : null;

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Ціна</Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {order.priceLocked && <Chip size="small" icon={<LockIcon />} label="Зафіксовано" variant="outlined" />}
          {canModify && !order.priceLocked && (
            <IconButton size="small" title="Змінити ціну" onClick={() => setEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {!hasQuote && order.priceUah == null ? (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Прорахунку ще немає. Вкажіть суму за BOM у валюті клієнта.
          </Typography>
        </Box>
      ) : (
        <>
          <Row label="Прорахунок" value={hasQuote ? formatMoney(order.quoteAmount, order.quoteCurrency!) : '—'} />
          {order.quoteCurrency && order.quoteCurrency !== 'UAH' && (
            <Row label="Курс" value={order.exchangeRate != null ? `${order.exchangeRate} грн за 1 ${order.quoteCurrency}` : 'не зафіксовано'} />
          )}
          <Row label="Ціна партії" value={formatMoney(order.priceUah)} strong />
          {perBoard !== null && <Row label={`За плату (${order.quantity} шт.)`} value={formatMoney(perBoard)} />}
        </>
      )}
      {order.priceLocked && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Ціну змінюють, повернувши партію на етап «Погодження».
        </Typography>
      )}

      {editing && (
        <PriceDialog
          order={order}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onSaved();
          }}
        />
      )}
    </Paper>
  );
}
