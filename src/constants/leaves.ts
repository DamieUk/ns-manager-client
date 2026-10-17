import type { LeaveKind, LeaveStatus } from '../types/leaves';

export const LEAVE_KIND_OPTIONS: Array<{ value: LeaveKind; label: string }> = [
  { value: 'vacation', label: 'Відпустка' },
  { value: 'sick', label: 'Лікарняний' },
  { value: 'unpaid', label: 'За власний рахунок' },
  { value: 'other', label: 'Інше' },
];

export const LEAVE_KIND_LABELS = Object.fromEntries(LEAVE_KIND_OPTIONS.map((o) => [o.value, o.label])) as Record<LeaveKind, string>;

export const LEAVE_STATUS: Record<LeaveStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Очікує рішення', color: 'warning' },
  approved: { label: 'Погоджено', color: 'success' },
  rejected: { label: 'Відхилено', color: 'error' },
  cancelled: { label: 'Скасовано', color: 'default' },
};
