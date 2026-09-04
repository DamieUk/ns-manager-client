import type { Permission, Role } from './auth';

export type UserStatus = 'working' | 'fired' | 'vacation';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  googleEmail: string;
  phone: string;
  address: string;
  status: UserStatus;
  role: Role;
  permissions: Permission[];
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UserInput {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  status: UserStatus;
  role: Role;
}
