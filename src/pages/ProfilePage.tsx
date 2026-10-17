import { Alert, Avatar, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { FormSection } from '../components/form/FormSection';
import { MIN_PASSWORD_LENGTH } from '../components/NewPasswordForm';
import { ROLE_OPTIONS, STATUS_OPTIONS } from '../constants/users';
import type { Profile } from '../types/leaves';
import { fieldProps, REQUIRED } from '../utils/formik';
import { daysWord, formatDate } from '../utils/format';

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function ContactsForm({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const formik = useFormik({
    initialValues: { phone: profile.phone, address: profile.address },
    validate: (v) => {
      const errors: Partial<Record<'phone' | 'address', string>> = {};
      if (!v.phone.trim()) errors.phone = REQUIRED;
      if (!v.address.trim()) errors.address = REQUIRED;
      return errors;
    },
    onSubmit: async (v) => {
      setError(null);
      setSaved(false);
      try {
        await apiClient.put('/profile', v);
        formik.resetForm({ values: v });
        setSaved(true);
        onSaved();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  return (
    <Paper component="form" noValidate onSubmit={formik.handleSubmit} sx={{ p: 3 }}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {saved && (
          <Alert severity="success" onClose={() => setSaved(false)}>
            Збережено
          </Alert>
        )}
        <FormSection title="Контакти" hint="Тримайте їх актуальними: так з вами зв’яжуться">
          <TextField label="Телефон" {...fieldProps(formik, 'phone')} required />
          <TextField label="Адреса" {...fieldProps(formik, 'address')} required />
        </FormSection>
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting || !formik.dirty} sx={{ minWidth: 128 }}>
            {formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Зберегти'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const formik = useFormik<PasswordValues>({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: (v) => {
      const errors: Partial<Record<keyof PasswordValues, string>> = {};
      if (!v.currentPassword) errors.currentPassword = REQUIRED;
      if (!v.newPassword) errors.newPassword = REQUIRED;
      else if (v.newPassword.length < MIN_PASSWORD_LENGTH) errors.newPassword = `Щонайменше ${MIN_PASSWORD_LENGTH} символів`;
      if (v.confirmPassword !== v.newPassword) errors.confirmPassword = 'Паролі не збігаються';
      return errors;
    },
    onSubmit: async (v) => {
      setError(null);
      setSaved(false);
      try {
        await apiClient.put('/profile/password', { currentPassword: v.currentPassword, newPassword: v.newPassword });
        formik.resetForm();
        setSaved(true);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  return (
    <Paper component="form" noValidate onSubmit={formik.handleSubmit} sx={{ p: 3 }}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {saved && (
          <Alert severity="success" onClose={() => setSaved(false)}>
            Пароль змінено. Інші пристрої, де ви були в системі, вийшли з неї.
          </Alert>
        )}
        <FormSection title="Пароль" columns={3}>
          <TextField type="password" label="Поточний пароль" autoComplete="current-password" {...fieldProps(formik, 'currentPassword')} required />
          <TextField
            type="password"
            label="Новий пароль"
            autoComplete="new-password"
            {...fieldProps(formik, 'newPassword', `Щонайменше ${MIN_PASSWORD_LENGTH} символів`)}
            required
          />
          <TextField type="password" label="Ще раз" autoComplete="new-password" {...fieldProps(formik, 'confirmPassword')} required />
        </FormSection>
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting} sx={{ minWidth: 128 }}>
            {formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Змінити пароль'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

// One's own card: what the owners keep about you, your contacts and password.
export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiClient
      .get<Profile>('/profile')
      .then((res) => setProfile(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, []);

  if (!profile) return error ? <Alert severity="error">{error}</Alert> : <CircularProgress />;

  const role = ROLE_OPTIONS.find((r) => r.value === profile.role)?.label ?? profile.role;
  const status = STATUS_OPTIONS.find((s) => s.value === profile.status)?.label ?? profile.status;

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 920 }}>
      <Typography variant="h4">Мій профіль</Typography>

      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
          <Avatar src={profile.avatarUrl ?? undefined} sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }}>
            {profile.firstName.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5">
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography color="text.secondary">
              {profile.jobTitle} · {role}
            </Typography>
          </Box>
          <Button component={Link} to="/leaves" variant="outlined">
            Відпустки
          </Button>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mt: 3 }}>
          <Info label="Email" value={profile.email} />
          <Info label="Статус" value={status} />
          <Info label="У команді з" value={formatDate(profile.createdAt)} />
          <Info label={`Відпустка у ${new Date().getFullYear()}`} value={daysWord(profile.vacationDaysThisYear)} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Ім’я, посаду й рівень доступу змінює власник.
        </Typography>
      </Paper>

      <ContactsForm profile={profile} onSaved={load} />
      <PasswordForm />
    </Stack>
  );
}
