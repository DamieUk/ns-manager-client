import AddIcon from '@mui/icons-material/Add';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { useAuth } from '../auth/useAuth';
import { LeaveDecisionDialog } from '../components/LeaveDecisionDialog';
import { LeaveDialog } from '../components/LeaveDialog';
import { StatCard } from '../components/StatCard';
import { LEAVE_KIND_LABELS, LEAVE_STATUS } from '../constants/leaves';
import type { LeaveRequest } from '../types/leaves';
import { dayInput, formatDate } from '../utils/format';

type Tab = 'pending' | 'away' | 'mine' | 'all';

const isoDay = (iso: string) => iso.slice(0, 10);

// Leave requests. Everyone files and follows their own; owners also decide on everyone's and see
// who is away now and soon.
export function LeavesPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'executive';
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(isOwner ? 'pending' : 'mine');
  const [creating, setCreating] = useState(false);
  const [deciding, setDeciding] = useState<{ leave: LeaveRequest; decision: 'approved' | 'rejected' } | null>(null);

  function load() {
    apiClient
      .get<LeaveRequest[]>('/leaves')
      .then((res) => setLeaves(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancel(leave: LeaveRequest) {
    try {
      await apiClient.post(`/leaves/${leave.id}/cancel`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const today = dayInput();
  const pending = leaves.filter((l) => l.status === 'pending');
  const away = leaves
    .filter((l) => l.status === 'approved' && isoDay(l.endDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const awayNow = away.filter((l) => isoDay(l.startDate) <= today);
  const mine = leaves.filter((l) => l.user.id === user?.id);

  const shown = useMemo(() => {
    if (tab === 'pending') return pending;
    if (tab === 'away') return away;
    if (tab === 'mine') return mine;
    return leaves;
  }, [tab, leaves, pending, away, mine]);

  if (loading) return <CircularProgress />;

  const year = new Date().getFullYear();
  const myVacationDays = mine
    .filter((l) => l.status === 'approved' && l.kind === 'vacation' && l.startDate.startsWith(String(year)))
    .reduce((sum, l) => sum + l.days, 0);

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4">Відпустки</Typography>
          <Typography color="text.secondary">Відпустки, лікарняні та відсутність за власний рахунок</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
          Нова заявка
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {isOwner && (
          <>
            <StatCard label="Очікують рішення" value={pending.length} icon={<HourglassEmptyOutlinedIcon fontSize="small" sx={{ color: '#fff' }} />} highlight />
            <StatCard label="Відсутні сьогодні" value={awayNow.length} icon={<EventBusyOutlinedIcon fontSize="small" color="action" />} />
          </>
        )}
        <StatCard label={`Мої дні відпустки у ${year}`} value={myVacationDays} icon={<BeachAccessOutlinedIcon fontSize="small" color="action" />} />
      </Stack>

      {isOwner && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab value="pending" label={`Очікують рішення (${pending.length})`} />
          <Tab value="away" label="Відсутні зараз і незабаром" />
          <Tab value="mine" label="Мої" />
          <Tab value="all" label="Усі" />
        </Tabs>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {isOwner && <TableCell>Хто</TableCell>}
              <TableCell>Тип</TableCell>
              <TableCell>Дати</TableCell>
              <TableCell align="right">Днів</TableCell>
              <TableCell>Коментар</TableCell>
              <TableCell>Стан</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((l) => {
              const state = LEAVE_STATUS[l.status];
              const own = l.user.id === user?.id;
              const now = l.status === 'approved' && isoDay(l.startDate) <= today && isoDay(l.endDate) >= today;
              const canCancel = own && (l.status === 'pending' || (l.status === 'approved' && isoDay(l.startDate) > today));
              return (
                <TableRow key={l.id}>
                  {isOwner && (
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {l.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {l.user.jobTitle}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>{LEAVE_KIND_LABELS[l.kind]}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDate(l.startDate)} – {formatDate(l.endDate)}
                    {now && <Chip size="small" color="info" label="зараз" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell align="right">{l.days}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2">{l.reason ?? '—'}</Typography>
                    {l.decisionNote && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {l.decidedBy?.name}: {l.decisionNote}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" color={state.color} variant={l.status === 'approved' ? 'filled' : 'outlined'} label={state.label} />
                    {l.decidedBy && !l.decisionNote && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {l.decidedBy.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {isOwner && l.status === 'pending' && (
                      <>
                        <Button size="small" variant="contained" onClick={() => setDeciding({ leave: l, decision: 'approved' })}>
                          Погодити
                        </Button>
                        <Button size="small" color="error" onClick={() => setDeciding({ leave: l, decision: 'rejected' })} sx={{ ml: 1 }}>
                          Відхилити
                        </Button>
                      </>
                    )}
                    {isOwner && l.status === 'approved' && !own && (
                      <Button size="small" color="error" onClick={() => setDeciding({ leave: l, decision: 'rejected' })}>
                        Скасувати
                      </Button>
                    )}
                    {canCancel && (
                      <Button size="small" onClick={() => cancel(l)}>
                        Відкликати
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {shown.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">{tab === 'pending' ? 'Нових заявок немає' : 'Заявок немає'}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {creating && (
        <LeaveDialog
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            if (isOwner) setTab('mine');
            load();
          }}
        />
      )}
      {deciding && (
        <LeaveDecisionDialog
          leave={deciding.leave}
          decision={deciding.decision}
          onClose={() => setDeciding(null)}
          onSaved={() => {
            setDeciding(null);
            load();
          }}
        />
      )}
    </>
  );
}
