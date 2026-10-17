export function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleDateString('uk-UA') : '—';
}

export function formatDateTime(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' }) : '—';
}

// <input type="date"> value (YYYY-MM-DD) for an ISO date, in UTC like the API stores it.
export function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}

export function formatMoney(value: number | null | undefined, currency: string = 'UAH'): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

// 1 день, 2 дні, 5 днів, 11 днів, 21 день.
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export const daysWord = (n: number) => `${n} ${plural(n, 'день', 'дні', 'днів')}`;

// "3 дні" / "5 днів" since the given moment.
export function daysSince(value: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  return days === 0 ? 'сьогодні' : daysWord(days);
}

// Today (plus `days`) as an <input type="date"> value, in local time.
export function dayInput(days = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
}

