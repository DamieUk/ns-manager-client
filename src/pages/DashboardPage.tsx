import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import { Alert, Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { ProcurementChart, ShippingChart, TeamToday } from '../components/dashboard/FlowCharts';
import { KpiTile } from '../components/dashboard/KpiTile';
import { ClientsShareChart, MoneyByMonthChart, ReceivablesChart } from '../components/dashboard/MoneyCharts';
import { moneyShort } from '../components/dashboard/palette';
import { PipelineChart, StageDurationsChart } from '../components/dashboard/PipelineChart';
import { BatchProgressChart, DailyOutputChart, EmployeesChart, QualityGauge } from '../components/dashboard/ProductionCharts';
import { ProductionReports } from '../components/dashboard/ProductionReports';
import type { Overview } from '../types/overview';
import { formatDateTime } from '../utils/format';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 2.5, mt: 0.5 }}>{children}</Box>
    </Box>
  );
}

// The owners' dashboard: headline numbers, then the pipeline, money, production, flow and team as
// charts, and the daily reports per batch at the bottom.
export function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiClient
      .get<Overview>('/dashboard/overview')
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (!data) return error ? <Alert severity="error">{error}</Alert> : <CircularProgress />;
  const k = data.kpis;

  return (
    <Stack spacing={3.5}>
      <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4">Дашборд</Typography>
          <Typography color="text.secondary">Як іде робота: від прорахунку до відвантаження й оплати</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Оновлено {formatDateTime(data.generatedAt)}
          </Typography>
          <IconButton size="small" onClick={load} disabled={loading} aria-label="Оновити">
            {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2 }}>
        <KpiTile
          label="Партії в роботі"
          value={String(k.activeBatches)}
          caption={`${moneyShort(k.pipelineValue)} без ПДВ`}
          icon={<Inventory2OutlinedIcon fontSize="small" sx={{ color: '#fff' }} />}
          tone="primary"
          to="/board"
        />
        <KpiTile label="Плат у виробництві" value={String(k.boardsInWork)} caption="від закупівлі до відвантаження" icon={<MemoryOutlinedIcon fontSize="small" color="action" />} to="/board" />
        <KpiTile
          label="Протерміновано"
          value={String(k.overdueBatches)}
          caption={k.overdueAmount ? `і рахунків на ${moneyShort(k.overdueAmount)}` : 'партій після терміну'}
          icon={<AssignmentLateOutlinedIcon fontSize="small" color={k.overdueBatches || k.overdueAmount ? 'error' : 'action'} />}
          tone={k.overdueBatches || k.overdueAmount ? 'alert' : 'default'}
          to="/board"
        />
        <KpiTile label="Очікуємо оплат" value={moneyShort(k.awaiting)} caption="за виставленими рахунками" icon={<PaymentsOutlinedIcon fontSize="small" color="action" />} to="/invoices" />
        <KpiTile label="Отримано за місяць" value={moneyShort(k.paidThisMonth)} caption="з ПДВ" icon={<TaskAltOutlinedIcon fontSize="small" color="success" />} to="/invoices" />
        <KpiTile label="Відвантажено за місяць" value={`${k.shippedThisMonth} шт.`} caption="плат за накладними" icon={<LocalShippingOutlinedIcon fontSize="small" color="action" />} to="/shipments" />
      </Box>

      <Section title="Партії">
        <PipelineChart pipeline={data.pipeline} />
        <ReceivablesChart receivables={data.money.receivables} />
      </Section>

      <Section title="Гроші">
        <MoneyByMonthChart months={data.money.months} />
        <ClientsShareChart byClient={data.money.byClient} />
      </Section>

      <Section title="Виробництво">
        <DailyOutputChart daily={data.production.daily} completed={k.completed30} reworkRate={k.reworkRate30} />
        <QualityGauge reworkRate={k.reworkRate30} completed={k.completed30} />
        <BatchProgressChart batches={data.production.batches} />
        <EmployeesChart byEmployee={data.production.byEmployee} />
      </Section>

      <Section title="Потік">
        <StageDurationsChart durations={data.stageDurations} />
        <ProcurementChart procurement={data.procurement} />
        <ShippingChart months={data.shipping.months} shippedThisMonth={k.shippedThisMonth} />
        <TeamToday team={data.team} />
      </Section>

      <ProductionReports />
    </Stack>
  );
}
