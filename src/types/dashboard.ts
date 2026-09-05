export interface DashboardResponse {
  generatedAt: string;
  orders: Array<{
    orderId: string;
    product: { id: string; name: string };
    client: { id: string; name: string };
    quantity: number;
    description: string;
    status: string;
    dueDate: string | null;
    isOverdue: boolean;
    manager: { id: string; name: string } | null;
    assignedEmployees: Array<{ id: string; name: string }>;
    totals: { completed: number; needsRework: number; partiallyAssembled: number };
    remaining: number;
    entries: Array<{
      id: string;
      employee: { id: string; name: string };
      date: string;
      completed: number;
      needsRework: number;
      partiallyAssembled: number;
      notes: string;
    }>;
  }>;
}
