import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { Alert, AppBar, Box, Button, CircularProgress, Dialog, IconButton, Toolbar, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';

interface PdfViewerDialogProps {
  open: boolean;
  onClose: () => void;
  // API path of the PDF: a stored file (/documents/:id/download) or a generated document
  // (/invoices/:id/pdf, /shipments/:id/pdf).
  src: string | null;
  title: string;
  // Offers a download under this name.
  fileName?: string;
}

// An error answer to a blob request arrives as a Blob too: read the JSON message out of it.
async function blobErrorMessage(err: unknown): Promise<string> {
  if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
    try {
      const body = JSON.parse(await err.response.data.text()) as { message?: string };
      if (body.message) return body.message;
    } catch {
      // not JSON
    }
  }
  return getErrorMessage(err);
}

export function PdfViewerDialog({ open, onClose, src, title, fileName }: PdfViewerDialogProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !src) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setError(null);

    apiClient
      .get(src, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data as Blob);
        setBlobUrl(objectUrl);
      })
      .catch(async (err) => {
        const message = await blobErrorMessage(err);
        if (!cancelled) setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setBlobUrl(null);
    };
  }, [open, src]);

  function download() {
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName ?? `${title}.pdf`;
    link.click();
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            {title}
          </Typography>
          {blobUrl && (
            <Button color="inherit" startIcon={<DownloadIcon />} onClick={download}>
              Завантажити
            </Button>
          )}
          <IconButton color="inherit" onClick={onClose} aria-label="Закрити">
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
        {error && (
          <Box sx={{ m: 'auto', maxWidth: 560, p: 2 }}>
            <Alert severity="warning">{error}</Alert>
          </Box>
        )}
        {!loading && blobUrl && <iframe src={blobUrl} title={title} style={{ border: 'none', width: '100%', height: '100%' }} />}
      </Box>
    </Dialog>
  );
}
