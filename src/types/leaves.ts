export type LeaveKind = 'vacation' | 'sick' | 'unpaid' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

type Person = { id: string; name: string; jobTitle: string };

export interface LeaveRequest {
  id: string;
  user: Person;
  kind: LeaveKind;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  decidedBy: Person | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  createdAt: string;
  vacationDaysThisYear: number;
}
