import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { SetPasswordDialog } from '../components/SetPasswordDialog';
import { UserForm } from '../components/UserForm';
import { ROLE_OPTIONS, STATUS_OPTIONS } from '../constants/users';
import type { UserInput, TeamMember } from '../types/users';

const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<TeamMember | null>(null);

  function loadUsers() {
    setLoading(true);
    apiClient
      .get<TeamMember[]>('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadUsers, []);

  function openCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(u: TeamMember) {
    setEditingUser(u);
    setFormOpen(true);
  }

  async function handleSubmit(values: UserInput) {
    setSubmitting(true);
    setError(null);
    try {
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, values);
      } else {
        await apiClient.post('/users', values);
      }
      setFormOpen(false);
      loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.status === 'deleted') {
        await apiClient.delete(`/users/${deleteTarget.id}`);
      } else {
        await apiClient.put(`/users/${deleteTarget.id}`, { status: 'deleted' });
      }
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <CircularProgress />;

  const canModify = hasPermission(currentUser, 'USERS', 'modify');

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Користувачі</Typography>
        {canModify && (
          <Button variant="contained" onClick={openCreate}>
            Новий користувач
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ім'я</TableCell>
              <TableCell>Посада</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Рівень доступу</TableCell>
              <TableCell>Статус</TableCell>
              {canModify && <TableCell align="right">Дії</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  {u.firstName} {u.lastName}
                </TableCell>
                <TableCell>{u.jobTitle}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{ROLE_LABELS[u.role]}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={STATUS_LABELS[u.status]}
                    color={
                      u.status === 'working'
                        ? 'success'
                        : u.status === 'vacation'
                          ? 'warning'
                          : u.status === 'deleted'
                            ? 'error'
                            : 'default'
                    }
                  />
                </TableCell>
                {canModify && (
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(u)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title="Скинути пароль" onClick={() => setPasswordTarget(u)}>
                      <VpnKeyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" disabled={u.id === currentUser?.id} onClick={() => setDeleteTarget(u)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={canModify ? 7 : 6}>
                  <Typography color="text.secondary">Немає користувачів</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} key={editingUser?.id ?? 'new'}>
        <DialogTitle>{editingUser ? 'Редагувати користувача' : 'Новий користувач'}</DialogTitle>
        <DialogContent>
          <UserForm
            initialValue={editingUser}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        {deleteTarget?.status === 'deleted' ? (
          <>
            <DialogTitle>Видалити користувача назавжди?</DialogTitle>
            <DialogContent>
              Цю дію неможливо скасувати. Історія прогресу цього користувача теж буде видалена.
            </DialogContent>
          </>
        ) : (
          <>
            <DialogTitle>Позначити користувача як видаленого?</DialogTitle>
            <DialogContent>
              Вхід для цього користувача буде заблоковано, але історія його прогресу залишиться. Пізніше його можна
              відновити або видалити назавжди.
            </DialogContent>
          </>
        )}
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Скасувати</Button>
          <Button color="error" onClick={handleDelete}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>

      <SetPasswordDialog user={passwordTarget} onClose={() => setPasswordTarget(null)} />
    </>
  );
}
