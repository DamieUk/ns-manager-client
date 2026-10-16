import type { OrderStage } from './orders';

export interface MyOrder {
  id: string;
  number: string;
  client: { id: string; name: string };
  product: { id: string; name: string };
  quantity: number;
  status: string;
  stage: OrderStage;
  dueDate: string | null;
  completed: number;
  remaining: number;
  isOverdue: boolean;
}
