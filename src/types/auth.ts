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

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AcceptInviteInput {
  token: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}
