import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import { Box, Button, Chip, IconButton, LinearProgress, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { INVOICE_KIND_LABELS, invoiceState } from '../constants/finance';
import { stageIndex } from '../constants/stages';
import type { Invoice } from '../types/finance';
import type { OrderDetail } from '../types/orders';
import { formatDate, formatMoney } from '../utils/format';
import { InvoiceDialog } from './InvoiceDialog';
import { PaymentDialog } from './PaymentDialog';

interface BatchInvoicesCardProps {
  order: OrderDetail;
  onChanged: () => void;
  onError: (message: string) => void;
}

// The batch's invoices in UAH and what has been paid. A paid prepayment opens procurement.
export function BatchInvoicesCard({ order, onChanged, onError }: BatchInvoicesCardProps) {
  const [editing, setEditing] = useState<{ invoice: Invoice | null } | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; invoice: Invoice } | null>(null);

  const invoices = order.invoices ?? [];
  const payments = order.payments ?? { invoiced: 0, invoicedWithVat: 0, paid: 0, toInvoice: 0, awaiting: 0, vatRate: 0 };
  const total = order.total ?? 0;
  const canIssue = order.stage !== 'cancelled' && stageIndex(order.stage) >= stageIndex('invoicing') && total > 0;

  async function update(invoice: Invoice, body: object) {
    setMenu(null);
    try {
      await apiClient.put(`/invoices/${invoice.id}`, body);
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  async function remove(invoice: Invoice) {
    setMenu(null);
    try {
      await apiClient.delete(`/invoices/${invoice.id}`);
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Рахунки</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          disabled={!canIssue || payments.toInvoice <= 0}
          onClick={() => setEditing({ invoice: null })}
        >
          Виставити рахунок
        </Button>
      </Stack>

      {!canIssue && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Рахунки виставляють з етапу «Оплата»: після підписання додатку й фіксації ціни.
        </Typography>
      )}

      {total > 0 && invoices.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={payments.invoicedWithVat > 0 ? Math.min((payments.paid / payments.invoicedWithVat) * 100, 100) : 0}
            color="success"
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 0.5 }}>
            <Typography variant="body2">
              Виставлено <b>{formatMoney(payments.invoiced)}</b> з {formatMoney(total)} без ПДВ
            </Typography>
            <Typography variant="body2">
              Оплачено <b>{formatMoney(payments.paid)}</b>
            </Typography>
            <Typography variant="body2" color={payments.awaiting > 0 ? 'warning.main' : 'success.main'}>
              Очікуємо <b>{formatMoney(payments.awaiting)}</b>
            </Typography>
          </Stack>
        </Box>
      )}

      <Stack>
        {invoices.map((inv) => {
          const state = invoiceState(inv);
          return (
            <Stack
              key={inv.id}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', py: 1, borderTop: '1px solid', borderColor: 'divider', opacity: inv.status === 'cancelled' ? 0.55 : 1 }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  № {inv.number} · {INVOICE_KIND_LABELS[inv.kind]} · {formatMoney(inv.total)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  від {formatDate(inv.issuedAt)}
                  {inv.dueAt ? ` · сплатити до ${formatDate(inv.dueAt)}` : ''}
                  {inv.vatRate ? ` · без ПДВ ${formatMoney(inv.amount)}, ПДВ ${formatMoney(inv.vatAmount)}` : ''}
                  {inv.note ? ` · ${inv.note}` : ''}
                </Typography>
              </Box>
              <Chip size="small" color={state.color} variant={inv.status === 'paid' ? 'filled' : 'outlined'} label={state.label} />
              {inv.status !== 'cancelled' && (
                <IconButton size="small" title="Оплата" onClick={() => setPaying(inv)}>
                  <PaymentsIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" onClick={(e) => setMenu({ anchor: e.currentTarget, invoice: inv })}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>
          );
        })}
      </Stack>

      <Menu anchorEl={menu?.anchor} open={menu !== null} onClose={() => setMenu(null)}>
        {menu && menu.invoice.paidAmount === null && menu.invoice.status !== 'cancelled' && (
          <MenuItem
            onClick={() => {
              setEditing({ invoice: menu.invoice });
              setMenu(null);
            }}
          >
            Редагувати
          </MenuItem>
        )}
        {menu && menu.invoice.status !== 'cancelled' && menu.invoice.paidAmount === null && (
          <MenuItem onClick={() => update(menu.invoice, { status: 'cancelled' })}>Скасувати рахунок</MenuItem>
        )}
        {menu && menu.invoice.status === 'cancelled' && (
          <MenuItem onClick={() => update(menu.invoice, { status: 'issued' })}>Відновити рахунок</MenuItem>
        )}
        {menu && menu.invoice.paidAmount === null && (
          <MenuItem onClick={() => remove(menu.invoice)} sx={{ color: 'error.main' }}>
            Видалити
          </MenuItem>
        )}
        {menu && menu.invoice.paidAmount !== null && <MenuItem disabled>Оплачений рахунок не змінюють</MenuItem>}
      </Menu>

      {editing && (
        <InvoiceDialog
          order={order}
          invoice={editing.invoice}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      )}
      {paying && (
        <PaymentDialog
          invoice={paying}
          onClose={() => setPaying(null)}
          onSaved={() => {
            setPaying(null);
            onChanged();
          }}
        />
      )}
    </Paper>
  );
}
