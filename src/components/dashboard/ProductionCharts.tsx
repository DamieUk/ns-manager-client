import { Chip, Stack, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { Link } from 'react-router-dom';
import type { Overview } from '../../types/overview';
import { StageChip } from '../StageChip';
import { ChartCard } from './ChartCard';
import { CHART, dayLabel } from './palette';

// Boards assembled per day over the last 30 days, and those sent back for rework.
export function DailyOutputChart({ daily, completed, reworkRate }: { daily: Overview['production']['daily']; completed: number; reworkRate: number }) {
  const best = daily.reduce((max, d) => Math.max(max, d.completed), 0);
  const workingDays = daily.filter((d) => d.completed > 0).length;
  return (
    <ChartCard
      title="Монтаж за 30 днів"
      insight={`Зібрано ${completed} плат · у середньому ${workingDays ? Math.round(completed / workingDays) : 0} за робочий день · рекорд ${best} · брак ${reworkRate}%`}
      span={{ md: 8 }}
      empty={daily.every((d) => d.completed === 0 && d.needsRework === 0)}
      emptyText="За 30 днів звітів про монтаж немає"
    >
      <BarChart
        height={280}
        dataset={daily.map((d) => ({ ...d, label: dayLabel(d.date) }))}
        xAxis={[{ scaleType: 'band', dataKey: 'label', tickInterval: (_v: string, i: number) => i % 3 === 0, categoryGapRatio: 0.35 }]}
        yAxis={[{ width: 40, tickMinStep: 1 }]}
        series={[
          { dataKey: 'completed', label: 'Зібрано', stack: 'day', color: CHART.mint },
          { dataKey: 'needsRework', label: 'На виправлення', stack: 'day', color: CHART.coral },
        ]}
        borderRadius={3}
        grid={{ horizontal: true }}
        margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
        slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
      />
    </ChartCard>
  );
}

// The share of boards sent back for rework over 30 days, as a dial.
export function QualityGauge({ reworkRate, completed }: { reworkRate: number; completed: number }) {
  const max = Math.max(10, Math.ceil(reworkRate / 5) * 5);
  const color = reworkRate <= 2 ? CHART.mint : reworkRate <= 5 ? CHART.amber : CHART.coral;
  return (
    <ChartCard title="Якість монтажу" insight="Частка плат на виправлення за 30 днів" span={{ md: 4 }} empty={completed === 0} emptyText="Звітів ще немає">
      <Stack sx={{ alignItems: 'center' }}>
        <Gauge
          width={240}
          height={180}
          value={reworkRate}
          valueMax={max}
          startAngle={-110}
          endAngle={110}
          innerRadius="72%"
          cornerRadius="50%"
          text={`${reworkRate}%`}
          sx={{
            [`& .${gaugeClasses.valueText}`]: { fontSize: 32, fontWeight: 800 },
            [`& .${gaugeClasses.valueArc}`]: { fill: color },
            [`& .${gaugeClasses.referenceArc}`]: { fill: '#ECEEF1' },
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 700, color }}>
          {reworkRate <= 2 ? 'Чудово' : reworkRate <= 5 ? 'Варто придивитися' : 'Забагато браку'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          з {completed} зібраних плат · ціль до 2%
        </Typography>
      </Stack>
    </ChartCard>
  );
}

// Every batch in production: shipped, assembled and still to do, as one stacked bar each.
export function BatchProgressChart({ batches }: { batches: Overview['production']['batches'] }) {
  const rows = batches.slice(0, 12);
  const height = Math.max(160, rows.length * 38 + 60);
  return (
    <ChartCard
      title="Партії у виробництві"
      insight={`${batches.length} партій від підготовки до відвантаження${batches.some((b) => b.isOverdue) ? ` · ${batches.filter((b) => b.isOverdue).length} протерміновано` : ''}`}
      to="/board"
      action="Дошка"
      span={{ md: 7 }}
      empty={batches.length === 0}
      emptyText="Зараз нічого не збирається"
    >
      <BarChart
        height={height}
        layout="horizontal"
        dataset={rows.map((b) => ({
          label: `№ ${b.number}${b.isOverdue ? ' ⚠' : ''}`,
          shipped: b.shipped,
          assembled: Math.max(b.completed - b.shipped, 0),
          left: Math.max(b.quantity - Math.max(b.completed, b.shipped), 0),
        }))}
        yAxis={[{ scaleType: 'band', dataKey: 'label', width: 88 }]}
        xAxis={[{ tickMinStep: 1, label: 'плат' }]}
        series={[
          { dataKey: 'shipped', label: 'Відвантажено', stack: 'boards', color: CHART.forest },
          { dataKey: 'assembled', label: 'Зібрано', stack: 'boards', color: CHART.mint },
          { dataKey: 'left', label: 'Залишилось', stack: 'boards', color: CHART.grey },
        ]}
        borderRadius={4}
        margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
        slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
      />
      <Stack spacing={0.5} sx={{ mt: 1 }}>
        {rows.map((b) => (
          <Stack key={b.id} direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography
              component={Link}
              to={`/orders/${b.id}`}
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', minWidth: 64 }}
            >
              № {b.number}
            </Typography>
            <StageChip stage={b.stage} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {b.client} · {b.product} · {b.completed}/{b.quantity}
            </Typography>
            {b.isOverdue && <Chip size="small" color="error" label="термін" sx={{ height: 18, fontSize: 10 }} />}
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  );
}

// Boards each employee assembled over 30 days, with those sent back.
export function EmployeesChart({ byEmployee }: { byEmployee: Overview['production']['byEmployee'] }) {
  const rows = byEmployee.slice(0, 10);
  return (
    <ChartCard
      title="Працівники за 30 днів"
      insight={rows[0] ? `Найбільше зібрав(-ла) ${rows[0].employee}: ${rows[0].completed} плат` : 'Хто скільки зібрав'}
      to="/users"
      action="Люди"
      span={{ md: 5 }}
      empty={rows.length === 0}
      emptyText="Звітів за 30 днів немає"
    >
      <BarChart
        height={Math.max(180, rows.length * 40 + 60)}
        layout="horizontal"
        dataset={rows}
        yAxis={[{ scaleType: 'band', dataKey: 'employee', width: 120 }]}
        xAxis={[{ tickMinStep: 1 }]}
        series={[
          { dataKey: 'completed', label: 'Зібрано', stack: 'e', color: CHART.mint },
          { dataKey: 'needsRework', label: 'На виправлення', stack: 'e', color: CHART.coral },
        ]}
        borderRadius={4}
        margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
        slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
      />
    </ChartCard>
  );
}
