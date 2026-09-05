import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import {
  Alert,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { DashboardOrderRow } from '../components/DashboardOrderRow';
import { StatCard } from '../components/StatCard';
import type { DashboardResponse } from '../types/dashboard';
import type { TeamMember } from '../types/users';

export function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    apiClient
      .get<TeamMember[]>('/users')
      .then((res) => setEmployees(res.data.filter((u) => u.role === 'employee')))
      .catch(() => setEmployees([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get<DashboardResponse>('/dashboard', { params: selectedEmployee ? { employee: selectedEmployee } : {} })
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [selectedEmployee]);

  function toggle(orderId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          select
          label="Працівник"
          size="small"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="">Усі працівники</MenuItem>
          {employees.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
              {emp.status === 'deleted' ? ' (видалено)' : ''}
            </MenuItem>
          ))}
        </TextField>

        {data && (
          <Typography variant="caption" color="text.secondary">
            Оновлено: {new Date(data.generatedAt).toLocaleString()}
          </Typography>
        )}
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading && <CircularProgress />}

      {!loading && data && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <StatCard
            label="Активні замовлення"
            value={data.orders.length}
            icon={<Inventory2OutlinedIcon fontSize="small" sx={{ color: '#fff' }} />}
            highlight
          />
          <StatCard
            label="Протерміновано"
            value={data.orders.filter((o) => o.isOverdue).length}
            icon={<AssignmentLateOutlinedIcon fontSize="small" color="error" />}
          />
          <StatCard
            label="Потребує виправлення"
            value={data.orders.reduce((sum, o) => sum + o.totals.needsRework, 0)}
            icon={<BuildOutlinedIcon fontSize="small" color="action" />}
          />
          <StatCard
            label="Залишилось плат"
            value={data.orders.reduce((sum, o) => sum + o.remaining, 0)}
            icon={<PlaylistAddCheckOutlinedIcon fontSize="small" color="action" />}
          />
        </Stack>
      )}

      {!loading && data && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Клієнт</TableCell>
                <TableCell>Продукт</TableCell>
                <TableCell>Термін виконання</TableCell>
                <TableCell align="right">К-сть</TableCell>
                <TableCell align="right">Залишилось</TableCell>
                <TableCell align="right">Готово</TableCell>
                <TableCell align="right">Потребує виправлення</TableCell>
                <TableCell align="right">Не допаяно</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.orders.map((order) => (
                <DashboardOrderRow
                  key={order.orderId}
                  order={order}
                  expanded={expandedIds.has(order.orderId)}
                  onToggle={() => toggle(order.orderId)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
