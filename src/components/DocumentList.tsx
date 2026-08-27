import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { ClientDocument } from '../types/clients';
import { PdfViewerDialog } from './PdfViewerDialog';

interface DocumentListProps {
  documents: ClientDocument[];
  onDelete?: (docId: string) => void;
  onDetach?: (docId: string) => void;
  emptyText?: string;
  dense?: boolean;
  onError?: (message: string) => void;
}

export function DocumentList({ documents, onDelete, onDetach, emptyText = 'Немає документів', dense, onError }: DocumentListProps) {
  const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);

  async function handleDownload(doc: ClientDocument) {
    try {
      const res = await apiClient.get(`/documents/${doc._id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      onError?.(getErrorMessage(err));
    }
  }

  if (documents.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {emptyText}
      </Typography>
    );
  }

  return (
    <>
      <List dense={dense}>
        {documents.map((doc) => (
          <ListItem
            key={doc._id}
            disableGutters
            secondaryAction={
              <>
                {doc.mimeType === 'application/pdf' && (
                  <IconButton size="small" onClick={() => setPreviewDoc(doc)} title="Переглянути">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => handleDownload(doc)} title="Завантажити">
                  <DownloadIcon fontSize="small" />
                </IconButton>
                {onDetach && (
                  <IconButton size="small" onClick={() => onDetach(doc._id)} title="Прибрати із замовлення">
                    <LinkOffIcon fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton size="small" onClick={() => onDelete(doc._id)} title="Видалити назавжди">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            }
          >
            <ListItemText primary={doc.originalName} />
          </ListItem>
        ))}
      </List>

      <PdfViewerDialog
        open={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        documentId={previewDoc?._id ?? null}
        title={previewDoc?.originalName ?? ''}
      />
    </>
  );
}
