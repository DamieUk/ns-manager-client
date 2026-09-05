export interface MyOrder {
  id: string;
  client: { id: string; name: string };
  product: { id: string; name: string };
  quantity: number;
  status: string;
  dueDate: string | null;
  completed: number;
  remaining: number;
  isOverdue: boolean;
}
