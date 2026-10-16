import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Alert, Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { CONTRACT_STATUS_LABELS } from '../constants/documents';
import type { Contract, ContractType } from '../types/clients';
import type { OrderSummary } from '../types/orders';
import { formatDate } from '../utils/format';
import { ContractDialog } from './ContractDialog';
import { DocumentList } from './DocumentList';

const GROUPS: Array<{ type: ContractType; title: string; empty: string; hint: string }> = [
  { type: 'nda', title: 'NDA', empty: 'NDA ще не додано', hint: 'Підписуємо першим, до отримання BOM' },
  { type: 'framework', title: 'Рамковий договір', empty: 'Договору ще немає', hint: 'Після погодження першого прорахунку' },
  { type: 'annex', title: 'Додатки до договору', empty: 'Додатків ще немає', hint: 'По одному на кожну партію' },
];

interface ClientPapersSectionProps {
  clientId: string;
  contracts: Contract[];
  canModify: boolean;
  onChanged: () => void;
}

// The client's signed papers: NDA, framework contract and the annex for each batch.
export function ClientPapersSection({ clientId, contracts, canModify, onChanged }: ClientPapersSectionProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [dialog, setDialog] = useState<{ contract: Contract | null; type: ContractType } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<OrderSummary[]>('/orders', { params: { client: clientId } })
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]));
  }, [clientId]);

  const orderLabel = (id?: string) => {
    const order = orders.find((o) => o.id === id);
    return order ? `Партія: ${order.product.name} × ${order.quantity}` : null;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Папери
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {GROUPS.map((group) => {
          const items = contracts.filter((c) => c.type === group.type);
          return (
            <Paper key={group.type} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{group.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.hint}
                  </Typography>
                </Box>
                {canModify && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setDialog({ contract: null, type: group.type })}>
                    Додати
                  </Button>
                )}
              </Stack>

              {items.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  {group.empty}
                </Typography>
              )}

              <Stack spacing={1.5}>
                {items.map((c) => (
                  <Box key={c._id} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {c.title}
                      </Typography>
                      {canModify && (
                        <IconButton size="small" title="Редагувати" onClick={() => setDialog({ contract: c, type: c.type })}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5, my: 0.5 }}>
                      {c.signedAt ? (
                        <Chip size="small" color="success" variant="outlined" label={`Підписано ${formatDate(c.signedAt)}`} />
                      ) : (
                        <Chip size="small" variant="outlined" label="Не підписано" />
                      )}
                      {c.status !== 'active' && <Chip size="small" label={CONTRACT_STATUS_LABELS[c.status] ?? c.status} />}
                      {group.type === 'annex' && (
                        <Typography variant="caption" color="text.secondary">
                          {orderLabel(c.order) ?? "Не прив'язано до партії"}
                        </Typography>
                      )}
                    </Stack>
                    <DocumentList documents={c.documents} dense emptyText="Скану ще немає" onError={setError} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Box>

      {dialog && (
        <ContractDialog
          clientId={clientId}
          contract={dialog.contract}
          defaultType={dialog.type}
          orders={orders}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            onChanged();
          }}
        />
      )}
    </Box>
  );
}
