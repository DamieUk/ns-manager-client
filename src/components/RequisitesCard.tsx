import EditIcon from '@mui/icons-material/EditOutlined';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { REQUISITE_FIELDS } from '../constants/documents';
import type { Client, ClientInput } from '../types/clients';
import { EditClientForm } from './EditClientForm';

interface RequisitesCardProps {
  client: Client;
  canModify: boolean;
  onSaved: () => void;
}

// Client's requisites as they'll appear on invoices and delivery notes.
export function RequisitesCard({ client, canModify, onSaved }: RequisitesCardProps) {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filled = REQUISITE_FIELDS.filter((f) => client[f.name]).length;

  async function handleSubmit(values: ClientInput) {
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.put(`/clients/${client._id}`, values);
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>Реквізити</Typography>
          <Typography variant="caption" color={filled === REQUISITE_FIELDS.length ? 'text.secondary' : 'warning.main'}>
            {filled === 0 ? 'Не заповнено — знадобляться для рахунків і накладних' : `Заповнено ${filled} з ${REQUISITE_FIELDS.length}`}
          </Typography>
        </Box>
        {canModify && (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => {
              setError(null);
              setEditing(true);
            }}
          >
            Редагувати
          </Button>
        )}
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, columnGap: 2, rowGap: 0.75 }}>
        {REQUISITE_FIELDS.map((f) => (
          <Box key={f.name} sx={{ display: 'contents' }}>
            <Typography variant="body2" color="text.secondary">
              {f.label}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {f.name === 'iban' && client.iban ? client.iban.replace(/(.{4})/g, '$1 ').trim() : client[f.name] || '—'}
            </Typography>
          </Box>
        ))}
      </Box>

      <Dialog open={editing} onClose={() => setEditing(false)}>
        <DialogTitle>Редагувати клієнта</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <EditClientForm client={client} submitting={submitting} onSubmit={handleSubmit} onCancel={() => setEditing(false)} requisitesExpanded />
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
