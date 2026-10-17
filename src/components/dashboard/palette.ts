// Chart colours, from the portal theme: forest and mint for the main series, amber for waiting,
// coral for problems.
export const CHART = {
  forest: '#16433A',
  forestSoft: '#7FA79C',
  mint: '#34C289',
  mintSoft: '#A8E6CB',
  amber: '#E8A33D',
  coral: '#E0525C',
  blue: '#3B5BA9',
  purple: '#8A4FB8',
  grey: '#C9CED6',
} as const;

export const SERIES = [CHART.forest, CHART.mint, CHART.amber, CHART.blue, CHART.purple, CHART.coral, CHART.forestSoft];

// «2026-05» → «трав.»
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('uk-UA', { month: 'short', timeZone: 'UTC' });
}

// «2026-10-17» → «17.10»
export const dayLabel = (key: string) => `${key.slice(8, 10)}.${key.slice(5, 7)}`;

// 12 500 → «12,5 тис. ₴»
export function moneyShort(n: number): string {
  return `${new Intl.NumberFormat('uk-UA', { notation: 'compact', maximumFractionDigits: 1 }).format(n)} ₴`;
}
