export type Role = 'executive' | 'manager' | 'employee';
export type PermissionKey = 'ORDERS' | 'USERS' | 'PRODUCTS';
export type PermissionAction = 'none' | 'view' | 'modify';

export interface Permission {
  key: PermissionKey;
  action: PermissionAction;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  avatarUrl: string | null;
  createdAt: string;
}
