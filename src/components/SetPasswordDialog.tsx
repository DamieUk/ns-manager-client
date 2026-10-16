import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { TeamMember } from '../types/users';
import { fieldProps, REQUIRED } from '../utils/formik';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { MIN_PASSWORD_LENGTH } from './NewPasswordForm';

interface SetPasswordDialogProps {
  user: TeamMember;
  onClose: () => void;
}

// An owner sets a new password for a user directly; no email is sent.
export function SetPasswordDialog({ user, onClose }: SetPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<{ password: string }>({
    initialValues: { password: '' },
    validate: (v) => {
      if (!v.password) return { password: REQUIRED };
      if (v.password.length < MIN_PASSWORD_LENGTH) return { password: `Щонайменше ${MIN_PASSWORD_LENGTH} символів` };
      return {};
    },
    onSubmit: async (v) => {
      setError(null);
      try {
        await apiClient.put(`/users/${user.id}/password`, { password: v.password });
        onClose();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  return (
    <FormDialog
      title="Скинути пароль"
      subtitle={`${user.firstName} ${user.lastName} (${user.email}). Повідомте пароль окремо: листа не надсилається.`}
      submitting={formik.isSubmitting}
      submitLabel="Встановити"
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection columns={1}>
        <TextField
          type={showPassword ? 'text' : 'password'}
          label="Новий пароль"
          autoComplete="new-password"
          {...fieldProps(formik, 'password', `Щонайменше ${MIN_PASSWORD_LENGTH} символів`)}
          autoFocus
          slotProps={{
            input: {
              endAdornment: (
                <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="Показати пароль">
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              ),
            },
          }}
        />
      </FormSection>
    </FormDialog>
  );
}
