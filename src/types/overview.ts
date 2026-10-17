import type { LeaveKind } from './leaves';
import type { OrderStage } from './orders';

export interface Overview {
  generatedAt: string;
  kpis: {
    activeBatches: number;
    boardsInWork: number;
    overdueBatches: number;
    awaiting: number;
    overdueAmount: number;
    paidThisMonth: number;
    shippedThisMonth: number;
    completed30: number;
    reworkRate30: number;
    pipelineValue: number;
  };
  pipeline: Array<{ stage: OrderStage; batches: number; boards: number; value: number }>;
  money: {
    months: Array<{ month: string; invoiced: number; paid: number }>;
    receivables: { notDue: number; overdue: number; overdueCount: number };
    byClient: Array<{ client: string; paid: number }>;
  };
  production: {
    daily: Array<{ date: string; completed: number; needsRework: number }>;
    batches: Array<{
      id: string;
      number: string;
      client: string;
      product: string;
      stage: OrderStage;
      quantity: number;
      completed: number;
      shipped: number;
      dueDate: string | null;
      isOverdue: boolean;
    }>;
    byEmployee: Array<{ employee: string; completed: number; needsRework: number }>;
  };
  stageDurations: Array<{ stage: OrderStage; averageDays: number; currentDays: number }>;
  procurement: { planned: number; ordered: number; shipped: number; late: number };
  shipping: { months: Array<{ month: string; boards: number }> };
  team: { employees: number; pendingLeaves: number; away: Array<{ name: string; kind: LeaveKind; until: string }> };
}
