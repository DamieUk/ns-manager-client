import type { ClientDocument } from './clients';

export interface DailyProgress {
  id: string;
  order: {
    id: string;
    client: { id: string; name: string };
    product: { id: string; name: string };
  };
  employee: { id: string; name: string };
  date: string;
  completed: number;
  needsRework: number;
  partiallyAssembled: number;
  notes: string;
  photo: ClientDocument | null;
}

export interface DailyProgressInput {
  order: string;
  completed: number;
  needsRework: number;
  notes: string;
  photo?: File | null;
}
