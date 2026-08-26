import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { ClientOrdersSection } from '../components/ClientOrdersSection';
import type { ClientDetail } from '../types/clients';

export function ClientDetailPage() {
  const { user } = useAuth();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadContractId, setUploadContractId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadClient() {
    setLoading(true);
    apiClient
      .get<ClientDetail>(`/clients/${clientId}`)
      .then((res) => setClient(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadClient, [clientId]);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadContractId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('relatedType', 'Contract');
    formData.append('relatedId', uploadContractId);

    try {
      await apiClient.post('/documents', formData);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadClient();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDeleteDocument(id: string) {
    try {
      await apiClient.delete(`/documents/${id}`);
      loadClient();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDownload(id: string, originalName: string) {
    try {
      const res = await apiClient.get(`/documents/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!client) return null;

  const canModify = hasPermission(user, 'ORDERS', 'modify');

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          {client.name}
        </Typography>
        {client.code && <Chip label={client.code} />}
      </Stack>
      {client.contactName && <Typography color="text.secondary">{client.contactName}</Typography>}

      <ClientOrdersSection clientId={client._id} canModify={canModify} />

      <Typography variant="h6" sx={{ mt: 3 }}>
        Контракти
      </Typography>
      <List component={Paper} sx={{ mb: 3 }}>
        {client.contracts.map((contract) => (
          <ListItem key={contract._id}>
            <ListItemText primary={contract.title} secondary={contract.status} />
          </ListItem>
        ))}
        {client.contracts.length === 0 && (
          <ListItem>
            <ListItemText primary="Немає контрактів" />
          </ListItem>
        )}
      </List>

      <Typography variant="h6">Документи</Typography>
      <List component={Paper}>
        {client.documents.map((doc) => (
          <ListItem
            key={doc._id}
            secondaryAction={
              <>
                <IconButton onClick={() => handleDownload(doc._id, doc.originalName)}>
                  <DownloadIcon />
                </IconButton>
                {canModify && (
                  <IconButton onClick={() => handleDeleteDocument(doc._id)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </>
            }
          >
            <ListItemText primary={doc.originalName} />
          </ListItem>
        ))}
        {client.documents.length === 0 && (
          <ListItem>
            <ListItemText primary="Немає документів" />
          </ListItem>
        )}
      </List>

      {canModify && client.contracts.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              select
              label="Контракт"
              value={uploadContractId}
              onChange={(e) => setUploadContractId(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {client.contracts.map((contract) => (
                <MenuItem key={contract._id} value={contract._id}>
                  {contract.title}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" component="label" disabled={!uploadContractId}>
              Завантажити документ
              <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
}
