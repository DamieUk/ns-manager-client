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

// "3 дні" / "5 днів" since the given moment.
export function daysSince(value: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return 'сьогодні';
  const mod10 = days % 10;
  const mod100 = days % 100;
  const word = mod10 === 1 && mod100 !== 11 ? 'день' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'дні' : 'днів';
  return `${days} ${word}`;
}
