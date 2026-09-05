import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import type { DailyProgress } from '../types/dailyProgress';

interface ReportDetailDialogProps {
  entry: DailyProgress | null;
  onClose: () => void;
  onEdit: (entry: DailyProgress) => void;
  onDelete: (entry: DailyProgress) => void;
}

export function ReportDetailDialog({ entry, onClose, onEdit, onDelete }: ReportDetailDialogProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  useEffect(() => {
    if (!entry?.photo) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    setLoadingPhoto(true);

    apiClient.get(`/documents/${entry.photo._id}/download`, { responseType: 'blob' }).then((res) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(res.data as Blob);
      setPhotoUrl(objectUrl);
      setLoadingPhoto(false);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPhotoUrl(null);
    };
  }, [entry?.photo]);

  return (
    <Dialog open={entry !== null} onClose={onClose} maxWidth="xs" fullWidth>
      {entry && (
        <>
          <DialogTitle>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{new Date(entry.date).toLocaleDateString()}</span>
              <Stack direction="row">
                <IconButton size="small" onClick={() => onEdit(entry)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(entry)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={onClose}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {entry.order.client.name} — {entry.order.product.name}
            </Typography>
            <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Готово
                </Typography>
                <Typography variant="h6">{entry.completed}</Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Потребує виправлення
                </Typography>
                <Typography variant="h6" color={entry.needsRework > 0 ? 'error' : 'inherit'}>
                  {entry.needsRework}
                </Typography>
              </Stack>
            </Stack>
            {entry.notes && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {entry.notes}
              </Typography>
            )}
            {entry.photo && (
              <Box sx={{ textAlign: 'center' }}>
                {loadingPhoto && <CircularProgress size={24} />}
                {!loadingPhoto && photoUrl && (
                  <img src={photoUrl} alt={entry.photo.originalName} style={{ maxWidth: '100%', borderRadius: 8 }} />
                )}
              </Box>
            )}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
