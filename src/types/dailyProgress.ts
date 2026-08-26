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
}

export interface DailyProgressInput {
  order: string;
  date: string;
  completed: number;
  needsRework: number;
  partiallyAssembled: number;
  notes: string;
}
