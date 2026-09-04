import type { Role } from '../types/auth';
import type { UserStatus } from '../types/users';

export const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'executive', label: 'Виконавець' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'employee', label: 'Працівник' },
];

export const STATUS_OPTIONS: Array<{ value: UserStatus; label: string }> = [
  { value: 'working', label: 'Працює' },
  { value: 'vacation', label: 'У відпустці' },
  { value: 'fired', label: 'Звільнений' },
];
