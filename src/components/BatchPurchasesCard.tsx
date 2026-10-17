import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Alert, Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { PURCHASE_CATEGORY_LABELS } from '../constants/finance';
import type { Purchase, PurchaseStatus } from '../types/finance';
import type { OrderDetail } from '../types/orders';
import { isPrepaid } from '../utils/finance';
import { formatDate, formatMoney } from '../utils/format';
import { PurchaseDialog } from './PurchaseDialog';
import { PurchaseStatusSelect } from './PurchaseStatusSelect';

interface BatchPurchasesCardProps {
  order: OrderDetail;
  onChanged: () => void;
  onError: (message: string) => void;
}

// What is bought for the batch. Ordering waits for the prepayment; assembly waits until every
// purchase has arrived (or is cancelled).
export function BatchPurchasesCard({ order, onChanged, onError }: BatchPurchasesCardProps) {
  const [editing, setEditing] = useState<{ purchase: Purchase | null } | null>(null);
  const purchases = order.purchases ?? [];
  const prepaid = isPrepaid(order.invoices);
  const open = purchases.filter((p) => p.status !== 'received' && p.status !== 'cancelled').length;

  async function setStatus(purchase: Purchase, status: PurchaseStatus) {
    try {
      await apiClient.put(`/purchases/${purchase.id}`, { status });
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  async function remove(purchase: Purchase) {
    try {
      await apiClient.delete(`/purchases/${purchase.id}`);
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6">Закупівля</Typography>
          {purchases.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {open > 0 ? `Очікуємо: ${open} з ${purchases.length}` : 'Усе отримано'}
            </Typography>
          )}
        </Box>
        {order.stage !== 'cancelled' && (
          <Button size="small" startIcon={<AddIcon />} onClick={() => setEditing({ purchase: null })}>
            Додати
          </Button>
        )}
      </Stack>

      {!prepaid && order.stage !== 'cancelled' && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Чекаємо передоплату: замовляти в постачальників можна після оплати рахунку.
        </Alert>
      )}

      {purchases.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Плати, компоненти, трафарет: JLCPCB, LCSC, PCBWay, підрядники.
        </Typography>
      )}

      <Stack>
        {purchases.map((p) => (
          <Stack
            key={p.id}
            direction="row"
            sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.75, py: 1, borderTop: '1px solid', borderColor: 'divider', opacity: p.status === 'cancelled' ? 0.55 : 1 }}
          >
            <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {PURCHASE_CATEGORY_LABELS[p.category]} · {p.supplier}
                {p.cost != null ? ` · ${formatMoney(p.cost, p.currency ?? 'UAH')}` : ''}
              </Typography>
              {p.description && (
                <Typography variant="body2" color="text.secondary" noWrap title={p.description}>
                  {p.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {[
                  p.supplierOrderNo && `замовлення ${p.supplierOrderNo}`,
                  p.trackingNumber && `трек ${p.trackingNumber}`,
                  p.receivedAt ? `отримано ${formatDate(p.receivedAt)}` : p.expectedAt && `очікуємо ${formatDate(p.expectedAt)}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Box>
            {p.isLate && <Chip size="small" color="error" label="Затримка" />}
            <PurchaseStatusSelect value={p.status} onChange={(status) => setStatus(p, status)} />
            <IconButton size="small" title="Редагувати" onClick={() => setEditing({ purchase: p })}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" title="Видалити" onClick={() => remove(p)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      {editing && (
        <PurchaseDialog
          orderId={order.id}
          orderNumber={order.number}
          purchase={editing.purchase}
          prepaid={prepaid}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      )}
    </Paper>
  );
}
