import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconButton, List, ListItem, ListItemText, MenuItem, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_OPTIONS } from '../constants/documents';
import type { ClientDocument, DocumentType } from '../types/clients';
import { PdfViewerDialog } from './PdfViewerDialog';

interface DocumentListProps {
  documents: ClientDocument[];
  onDelete?: (docId: string) => void;
  onDetach?: (docId: string) => void;
  emptyText?: string;
  dense?: boolean;
  onError?: (message: string) => void;
  // Show each file's type; with onChangeType it becomes editable.
  showType?: boolean;
  onChangeType?: (docId: string, type: DocumentType) => void;
}

export function DocumentList({
  documents,
  onDelete,
  onDetach,
  emptyText = 'Немає документів',
  dense,
  onError,
  showType,
  onChangeType,
}: DocumentListProps) {
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
            <ListItemText
              primary={doc.originalName}
              secondary={
                showType && onChangeType ? (
                  <TextField
                    select
                    variant="standard"
                    size="small"
                    value={doc.type ?? 'other'}
                    onChange={(e) => onChangeType(doc._id, e.target.value as DocumentType)}
                    slotProps={{ htmlInput: { 'aria-label': 'Тип документа' } }}
                    sx={{ minWidth: 180, '& .MuiInputBase-input': { fontSize: 13 } }}
                  >
                    {DOCUMENT_TYPE_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : showType ? (
                  DOCUMENT_TYPE_LABELS[doc.type ?? 'other']
                ) : undefined
              }
              slotProps={{ secondary: { component: 'div' } }}
              sx={{ pr: 14 }}
            />
          </ListItem>
        ))}
      </List>

      <PdfViewerDialog
        open={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        src={previewDoc ? `/documents/${previewDoc._id}/download` : null}
        title={previewDoc?.originalName ?? ''}
        fileName={previewDoc?.originalName}
      />
    </>
  );
}
