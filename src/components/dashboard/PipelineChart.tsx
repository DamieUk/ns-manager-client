import { BarChart } from '@mui/x-charts/BarChart';
import { stageInfo } from '../../constants/stages';
import type { Overview } from '../../types/overview';
import { daysWord } from '../../utils/format';
import { ChartCard } from './ChartCard';
import { CHART, moneyShort } from './palette';

// Open batches per stage: the shape of the pipeline from quote to shipping.
export function PipelineChart({ pipeline }: { pipeline: Overview['pipeline'] }) {
  const labels = pipeline.map((p) => stageInfo(p.stage).label);
  const total = pipeline.reduce((sum, p) => sum + p.batches, 0);
  const boards = pipeline.reduce((sum, p) => sum + p.boards, 0);
  const value = pipeline.reduce((sum, p) => sum + p.value, 0);
  return (
    <ChartCard
      title="Воронка партій"
      insight={`${total} відкритих партій · ${boards} плат · ${moneyShort(value)} без ПДВ`}
      to="/board"
      action="Дошка"
      span={{ md: 7 }}
      empty={total === 0}
      emptyText="Відкритих партій немає"
    >
      <BarChart
        height={300}
        layout="horizontal"
        dataset={pipeline.map((p, i) => ({ ...p, label: labels[i] }))}
        yAxis={[
          {
            scaleType: 'band',
            dataKey: 'label',
            width: 110,
            colorMap: { type: 'ordinal', values: labels, colors: pipeline.map((p) => stageInfo(p.stage).color) },
          },
        ]}
        xAxis={[{ tickMinStep: 1 }]}
        series={[
          {
            dataKey: 'batches',
            label: 'Партій',
            valueFormatter: (v, { dataIndex }) => {
              const p = pipeline[dataIndex];
              return `${v} · ${p.boards} плат${p.value ? ` · ${moneyShort(p.value)}` : ''}`;
            },
          },
        ]}
        borderRadius={6}
        grid={{ vertical: true }}
        hideLegend
        margin={{ left: 0, right: 16, top: 8, bottom: 8 }}
      />
    </ChartCard>
  );
}

// Average days a finished visit to each stage took, next to how long the batches there now wait.
export function StageDurationsChart({ durations }: { durations: Overview['stageDurations'] }) {
  const labels = durations.map((d) => stageInfo(d.stage).label);
  const slowest = [...durations].sort((a, b) => b.currentDays - a.currentDays)[0];
  const hasData = durations.some((d) => d.averageDays > 0 || d.currentDays > 0);
  return (
    <ChartCard
      title="Де партії затримуються"
      insight={
        slowest && slowest.currentDays > 0
          ? `Найдовше зараз чекають на етапі «${stageInfo(slowest.stage).label}»: в середньому ${daysWord(Math.round(slowest.currentDays))}`
          : 'Скільки днів партії проводять на кожному етапі'
      }
      span={{ md: 7 }}
      empty={!hasData}
    >
      <BarChart
        height={340}
        layout="horizontal"
        dataset={durations.map((d, i) => ({ ...d, label: labels[i] }))}
        yAxis={[{ scaleType: 'band', dataKey: 'label', width: 110 }]}
        xAxis={[{ label: 'днів' }]}
        series={[
          { dataKey: 'averageDays', label: 'Зазвичай (завершені)', color: CHART.forestSoft, valueFormatter: (v) => `${v ?? 0} дн.` },
          { dataKey: 'currentDays', label: 'Зараз (ті, що на етапі)', color: CHART.amber, valueFormatter: (v) => `${v ?? 0} дн.` },
        ]}
        borderRadius={4}
        grid={{ vertical: true }}
        margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
        slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
      />
    </ChartCard>
  );
}
