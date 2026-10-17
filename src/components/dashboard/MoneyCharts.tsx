import { Box, Stack, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import type { Overview } from '../../types/overview';
import { formatMoney } from '../../utils/format';
import { ChartCard } from './ChartCard';
import { CHART, monthLabel, moneyShort, SERIES } from './palette';

// Invoiced (by issue date) next to received (by payment date), VAT included, month by month.
export function MoneyByMonthChart({ months }: { months: Overview['money']['months'] }) {
  const paid = months.reduce((sum, m) => sum + m.paid, 0);
  const invoiced = months.reduce((sum, m) => sum + m.invoiced, 0);
  return (
    <ChartCard
      title="Рахунки й оплати"
      insight={`За 6 місяців виставлено ${moneyShort(invoiced)}, отримано ${moneyShort(paid)} (з ПДВ)`}
      to="/invoices"
      action="Рахунки"
      span={{ md: 7 }}
      empty={invoiced === 0 && paid === 0}
      emptyText="Рахунків ще не було"
    >
      <BarChart
        height={280}
        dataset={months.map((m) => ({ ...m, label: monthLabel(m.month) }))}
        xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
        yAxis={[{ valueFormatter: (v: number) => moneyShort(v), width: 72 }]}
        series={[
          { dataKey: 'invoiced', label: 'Виставлено', color: CHART.forestSoft, valueFormatter: (v) => formatMoney(v ?? 0) },
          { dataKey: 'paid', label: 'Отримано', color: CHART.mint, valueFormatter: (v) => formatMoney(v ?? 0) },
        ]}
        borderRadius={4}
        grid={{ horizontal: true }}
        margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
        slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
      />
    </ChartCard>
  );
}

const SIZE = 210;

// A doughnut with the total in its hole and a legend with each part's amount and share.
export function Donut({
  data,
  center,
  caption,
  format = formatMoney,
}: {
  data: Array<{ id: string; value: number; label: string; color: string }>;
  center: string;
  caption: string;
  format?: (n: number) => string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
        <PieChart
          width={SIZE}
          height={SIZE}
          hideLegend
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          series={[{ data, innerRadius: 70, outerRadius: 100, paddingAngle: 2, cornerRadius: 4, valueFormatter: (item) => format(item.value) }]}
        />
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.15 }}>{center}</Typography>
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Stack spacing={1.5} sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
        {data.map((d) => (
          <Stack key={d.id} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0, mt: 0.6 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                {d.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {format(d.value)}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
                  {total ? Math.round((d.value / total) * 100) : 0}%
                </Typography>
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

// What clients owe: on time vs overdue.
export function ReceivablesChart({ receivables }: { receivables: Overview['money']['receivables'] }) {
  const total = receivables.notDue + receivables.overdue;
  return (
    <ChartCard
      title="Очікуємо оплат"
      insight={
        receivables.overdue > 0
          ? `Протерміновано ${receivables.overdueCount} рах. на ${moneyShort(receivables.overdue)}`
          : 'Протермінованих рахунків немає'
      }
      to="/invoices"
      action="Рахунки"
      span={{ md: 5 }}
      empty={total === 0}
      emptyText="Усі рахунки оплачені"
    >
      <Donut
        format={moneyShort}
        center={moneyShort(total)}
        caption="до отримання"
        data={[
          { id: 'notDue', value: receivables.notDue, label: 'У строк', color: CHART.amber },
          { id: 'overdue', value: receivables.overdue, label: 'Протерміновано', color: CHART.coral },
        ]}
      />
    </ChartCard>
  );
}

// Who brought the money in over the last 12 months.
export function ClientsShareChart({ byClient }: { byClient: Overview['money']['byClient'] }) {
  const top = byClient.slice(0, 5);
  const rest = byClient.slice(5).reduce((sum, c) => sum + c.paid, 0);
  const data = [...top.map((c, i) => ({ id: c.client, value: c.paid, label: c.client, color: SERIES[i] })), ...(rest > 0 ? [{ id: 'rest', value: rest, label: 'Інші', color: CHART.grey }] : [])];
  const total = byClient.reduce((sum, c) => sum + c.paid, 0);
  return (
    <ChartCard
      title="Оплати за клієнтами"
      insight={top[0] ? `За рік: найбільше від ${top[0].client} (${Math.round((top[0].paid / total) * 100)}%)` : 'Отримане за 12 місяців'}
      to="/clients"
      action="Клієнти"
      span={{ md: 5 }}
      empty={total === 0}
      emptyText="Оплат ще не було"
    >
      <Donut center={moneyShort(total)} caption="за 12 місяців" data={data} format={moneyShort} />
    </ChartCard>
  );
}
