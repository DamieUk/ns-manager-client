export interface DashboardResponse {
  generatedAt: string;
  orders: Array<{
    orderId: string;
    product: { id: string; name: string };
    client: { id: string; name: string };
    quantity: number;
    status: string;
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
