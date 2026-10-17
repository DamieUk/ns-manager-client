import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { Box, Button, IconButton, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import type { OrderDetail } from '../types/orders';
import { formatDate } from '../utils/format';
import { PdfViewerDialog } from './PdfViewerDialog';
import { ShipmentDialog } from './ShipmentDialog';

// Boards shipped so far and the delivery notes they went out on. A batch is done once all its
// boards are on delivery notes.
export function BatchShippingCard({ order, canModify, onChanged }: { order: OrderDetail; canModify: boolean; onChanged: () => void }) {
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<{ id: string; number: string } | null>(null);
  const { shipped, remaining, notes } = order.shipping;
  const canShip = canModify && order.stage === 'shipping' && remaining > 0;

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6">Відвантаження</Typography>
        {canModify && (
          <Button size="small" startIcon={<AddIcon />} disabled={!canShip} onClick={() => setCreating(true)}>
            Видаткова накладна
          </Button>
        )}
      </Stack>
      <LinearProgress
        variant="determinate"
        value={order.quantity ? Math.min((shipped / order.quantity) * 100, 100) : 0}
        color="success"
        sx={{ height: 8, borderRadius: 4, mb: 1 }}
      />
      <Typography variant="body2" sx={{ mb: 1 }}>
        Відвантажено <b>{shipped}</b> з {order.quantity} шт.{remaining > 0 ? ` · залишилось ${remaining}` : ''}
      </Typography>
      {canModify && order.stage !== 'shipping' && remaining > 0 && (
        <Typography variant="caption" color="text.secondary">
          Накладні створюють на етапі «Відвантаження».
        </Typography>
      )}
      <Stack>
        {notes.map((n) => (
          <Stack key={n.id} direction="row" spacing={1} sx={{ alignItems: 'center', py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Накладна № {n.number}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                від {formatDate(n.shippedAt)} · {n.quantity} шт. з цієї партії
              </Typography>
            </Box>
            {canModify && (
              <IconButton size="small" title="PDF" onClick={() => setPreview({ id: n.id, number: n.number })}>
                <PictureAsPdfIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>

      {creating && (
        <ShipmentDialog
          client={order.client}
          orderId={order.id}
          vatRate={order.payments?.vatRate ?? 0}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            onChanged();
          }}
        />
      )}
      <PdfViewerDialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        src={preview ? `/shipments/${preview.id}/pdf` : null}
        title={preview ? `Видаткова накладна № ${preview.number}` : ''}
        fileName={preview ? `Видаткова накладна ${preview.number}.pdf` : undefined}
      />
    </Paper>
  );
}
