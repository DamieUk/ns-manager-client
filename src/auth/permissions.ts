import type { AuthUser, PermissionAction, PermissionKey } from '../types/auth';

const ACTION_RANK: Record<PermissionAction, number> = {
  none: 0,
  view: 1,
  modify: 2,
};

export function hasPermission(user: AuthUser | null, key: PermissionKey, minAction: PermissionAction): boolean {
  if (!user) return false;
  const entry = user.permissions.find((p) => p.key === key);
  const actual: PermissionAction = entry?.action ?? 'none';
  return ACTION_RANK[actual] >= ACTION_RANK[minAction];
}
