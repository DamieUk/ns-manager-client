import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { ClientDocument } from '../types/clients';
import { DocumentList } from './DocumentList';
import { FileDropzone } from './FileDropzone';

interface ClientDocumentsSectionProps {
  clientId: string;
  documents: ClientDocument[];
  canModify: boolean;
  onRefreshClient: () => void;
}

export function ClientDocumentsSection({ clientId, documents, canModify, onRefreshClient }: ClientDocumentsSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(files: File[]) {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('client', clientId);
      await apiClient.post('/documents', formData);
      onRefreshClient();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    try {
      await apiClient.delete(`/documents/${docId}`);
      onRefreshClient();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Документи
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {canModify && (
        <Stack sx={{ mb: 2, maxWidth: 420 }}>
          <FileDropzone
            label={uploading ? 'Завантаження...' : 'Перетягніть файл сюди або натисніть, щоб обрати'}
            files={[]}
            onChange={handleUpload}
          />
        </Stack>
      )}

      <Paper sx={{ p: 2 }}>
        <DocumentList documents={documents} onDelete={canModify ? handleDelete : undefined} onError={setError} />
      </Paper>
    </Box>
  );
}
