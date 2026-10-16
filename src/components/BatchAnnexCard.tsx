import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { CONTRACT_STATUS_LABELS } from '../constants/documents';
import type { Contract } from '../types/clients';
import type { OrderDetail } from '../types/orders';
import { formatDate } from '../utils/format';
import { ContractDialog } from './ContractDialog';
import { DocumentList } from './DocumentList';

interface BatchAnnexCardProps {
  order: OrderDetail;
  canModify: boolean;
  onChanged: () => void;
  onError: (message: string) => void;
}

// The annex to the framework contract that covers this batch (its price and terms). A signed
// annex is required before the batch can be invoiced.
export function BatchAnnexCard({ order, canModify, onChanged, onError }: BatchAnnexCardProps) {
  const [dialog, setDialog] = useState<{ contract: Contract | null } | null>(null);
  const annexes = order.annexes ?? [];

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Додаток до договору</Typography>
        {canModify && (
          <Button size="small" startIcon={<AddIcon />} onClick={() => setDialog({ contract: null })}>
            Додати
          </Button>
        )}
      </Stack>

      {annexes.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Додатку ще немає. Підписаний додаток потрібен, щоб виставити рахунок.
        </Typography>
      )}

      <Stack spacing={1.5}>
        {annexes.map((c) => (
          <Box key={c._id} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {c.title}
              </Typography>
              {canModify && (
                <IconButton size="small" title="Редагувати" onClick={() => setDialog({ contract: c })}>
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
            </Stack>
            <DocumentList documents={c.documents} dense emptyText="Скану ще немає" onError={onError} />
          </Box>
        ))}
      </Stack>

      {dialog && (
        <ContractDialog
          clientId={order.client.id}
          contract={dialog.contract}
          defaultType="annex"
          orders={[order]}
          defaultOrder={order.id}
          lockType
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            onChanged();
          }}
        />
      )}
    </Paper>
  );
}
