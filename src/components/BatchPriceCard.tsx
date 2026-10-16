import EditIcon from '@mui/icons-material/EditOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import { Box, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import type { OrderDetail } from '../types/orders';
import { formatMoney } from '../utils/format';
import { withVat } from '../utils/money';
import { PriceDialog } from './PriceDialog';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', py: 0.75, borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 800 : 600, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}

// The price per board (quote in the client's currency, agreed UAH price without VAT) and what the
// batch comes to. Locked from the invoicing stage on.
export function BatchPriceCard({ order, canModify, onSaved }: { order: OrderDetail; canModify: boolean; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const vatRate = order.payments?.vatRate ?? 0;
  const hasQuote = order.unitQuote != null && order.quoteCurrency;

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

      {!hasQuote && order.unitPrice == null ? (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Прорахунку ще немає. Вкажіть ціну за плату у валюті клієнта.
          </Typography>
        </Box>
      ) : (
        <>
          <Row label="Прорахунок за плату" value={hasQuote ? formatMoney(order.unitQuote, order.quoteCurrency!) : '—'} />
          {order.quoteCurrency && order.quoteCurrency !== 'UAH' && (
            <Row label="Курс" value={order.exchangeRate != null ? `${order.exchangeRate} грн за 1 ${order.quoteCurrency}` : 'не зафіксовано'} />
          )}
          <Row label="Ціна за плату, без ПДВ" value={formatMoney(order.unitPrice)} />
          {order.total != null && (
            <>
              <Row label={`Партія: ${order.quantity} шт., без ПДВ`} value={formatMoney(order.total)} strong />
              {vatRate > 0 && <Row label={`З ПДВ ${vatRate}%`} value={formatMoney(withVat(order.total, vatRate))} />}
            </>
          )}
        </>
      )}
      {order.priceLocked && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Ціну й кількість змінюють, повернувши партію на етап «Погодження».
        </Typography>
      )}

      {editing && (
        <PriceDialog
          order={order}
          vatRate={vatRate}
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
