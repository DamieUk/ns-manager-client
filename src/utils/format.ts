export function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleDateString('uk-UA') : '—';
}

// <input type="date"> value (YYYY-MM-DD) for an ISO date, in UTC like the API stores it.
export function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}
