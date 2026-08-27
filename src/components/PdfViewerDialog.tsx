import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Box, CircularProgress, Dialog, IconButton, Toolbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';

interface PdfViewerDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  title: string;
}

export function PdfViewerDialog({ open, onClose, documentId, title }: PdfViewerDialogProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !documentId) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);

    apiClient.get(`/documents/${documentId}/download`, { responseType: 'blob' }).then((res) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(res.data as Blob);
      setBlobUrl(objectUrl);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setBlobUrl(null);
    };
  }, [open, documentId]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, display: 'flex', height: '100%' }}>
        {loading && (
          <Box sx={{ m: 'auto' }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && blobUrl && (
          <iframe src={blobUrl} title={title} style={{ border: 'none', width: '100%', height: '100%' }} />
        )}
      </Box>
    </Dialog>
  );
}
