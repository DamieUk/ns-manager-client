import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LEAVE_KIND_LABELS } from '../../constants/leaves';
import type { Overview } from '../../types/overview';
import { formatDate } from '../../utils/format';
import { ChartCard } from './ChartCard';
import { Donut } from './MoneyCharts';
import { CHART, monthLabel } from './palette';

// Purchases not received yet, by status, and how many are late.
export function ProcurementChart({ procurement }: { procurement: Overview['procurement'] }) {
  const open = procurement.planned + procurement.ordered + procurement.shipped;
  return (
    <ChartCard
      title="Закупівлі"
      insight={procurement.late ? `${procurement.late} затримується понад очікувану дату` : `${open} в процесі, затримок немає`}
      to="/purchases"
      action="Закупівлі"
      span={{ md: 5 }}
      empty={open === 0}
      emptyText="Нічого не очікуємо"
    >
      <Donut
        center={String(open)}
        caption="в процесі"
        format={(n) => `${n} шт.`}
        data={[
          { id: 'planned', value: procurement.planned, label: 'Заплановано', color: CHART.grey },
          { id: 'ordered', value: procurement.ordered, label: 'Замовлено', color: CHART.blue },
          { id: 'shipped', value: procurement.shipped, label: 'В дорозі', color: CHART.amber },
        ]}
      />
      {procurement.late > 0 && <Chip size="small" color="error" variant="outlined" label={`Затримується: ${procurement.late}`} sx={{ mt: 1.5 }} />}
    </ChartCard>
  );
}

// Boards shipped month by month.
export function ShippingChart({ months, shippedThisMonth }: { months: Overview['shipping']['months']; shippedThisMonth: number }) {
  const total = months.reduce((sum, m) => sum + m.boards, 0);
  return (
    <ChartCard
      title="Відвантаження"
      insight={`Цього місяця ${shippedThisMonth} плат · за 6 місяців ${total}`}
      to="/shipments"
      action="Накладні"
      span={{ md: 6 }}
      empty={total === 0}
      emptyText="Відвантажень ще не було"
    >
      <BarChart
        height={240}
        dataset={months.map((m) => ({ ...m, label: monthLabel(m.month) }))}
        xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
        yAxis={[{ width: 40, tickMinStep: 1 }]}
        series={[{ dataKey: 'boards', label: 'Плат', color: CHART.forest }]}
        borderRadius={6}
        grid={{ horizontal: true }}
        hideLegend
        margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
      />
    </ChartCard>
  );
}

// Who is away today and what waits for an owner's answer.
export function TeamToday({ team }: { team: Overview['team'] }) {
  const present = Math.max(team.employees - team.away.length, 0);
  return (
    <ChartCard
      title="Команда сьогодні"
      insight={`${present} з ${team.employees} працівників на місці${team.pendingLeaves ? ` · ${team.pendingLeaves} заявок чекають рішення` : ''}`}
      to="/leaves"
      action="Відпустки"
      span={{ md: 6 }}
    >
      <Stack direction="row" spacing={3} sx={{ alignItems: 'center', mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', bgcolor: '#ECEEF1' }}>
            <Box sx={{ width: `${team.employees ? (present / team.employees) * 100 : 0}%`, bgcolor: CHART.mint }} />
            <Box sx={{ width: `${team.employees ? (team.away.length / team.employees) * 100 : 0}%`, bgcolor: CHART.amber }} />
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              ● <Box component="span" sx={{ color: CHART.mint }}>на місці {present}</Box>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ● <Box component="span" sx={{ color: CHART.amber }}>відсутні {team.away.length}</Box>
            </Typography>
          </Stack>
        </Box>
        {team.pendingLeaves > 0 && <Chip color="warning" label={`Заявок: ${team.pendingLeaves}`} />}
      </Stack>
      {team.away.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Сьогодні всі на місці.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {team.away.map((a) => (
            <Stack key={a.name} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: CHART.amber, fontSize: 14 }}>{a.name.charAt(0)}</Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {a.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {LEAVE_KIND_LABELS[a.kind]} до {formatDate(a.until)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </ChartCard>
  );
}
