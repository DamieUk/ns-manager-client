import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import type { FormEvent, ReactNode } from 'react';

interface FormDialogProps {
  title: ReactNode;
  subtitle?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  submitting?: boolean;
  submitLabel?: string;
  submitColor?: 'primary' | 'error';
  // A server error for this form: shown at the top of the dialog, not behind it.
  error?: string | null;
  // A button on the left of the action row (e.g. "Скасувати оплату").
  secondaryAction?: ReactNode;
  onClose: () => void;
  onSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

// The frame of every form dialog: wide, scrolling content between a fixed title and action row.
// Validation is Formik's (fields turn red with a hint under them), so the browser's own
// validation popups are switched off with noValidate.
export function FormDialog({
  title,
  subtitle,
  maxWidth = 'sm',
  submitting = false,
  submitLabel = 'Зберегти',
  submitColor = 'primary',
  error,
  secondaryAction,
  onClose,
  onSubmit,
  children,
}: FormDialogProps) {
  return (
    <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth={maxWidth} scroll="paper">
      <Box
        component="form"
        noValidate
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          onSubmit(e);
        }}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: '1 1 auto' }}
      >
        <DialogTitle component="div" sx={{ pb: 2 }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {children}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {secondaryAction}
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={onClose} disabled={submitting}>
            Скасувати
          </Button>
          <Button type="submit" variant="contained" color={submitColor} disabled={submitting} sx={{ minWidth: 128 }}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
