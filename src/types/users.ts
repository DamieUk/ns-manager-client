import type { Permission, Role } from './auth';

export type UserStatus = 'working' | 'fired' | 'vacation' | 'deleted';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  status: UserStatus;
  role: Role;
  permissions: Permission[];
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  // The approved leave the user is on today, if any.
  onLeave?: { kind: 'vacation' | 'sick' | 'unpaid' | 'other'; until: string } | null;
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
