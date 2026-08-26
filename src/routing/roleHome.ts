import type { Role } from '../types/auth';

export function roleHome(role: Role): '/dashboard' | '/progress' {
  return role === 'employee' ? '/progress' : '/dashboard';
}
