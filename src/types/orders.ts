export interface OrderSummary {
  id: string;
  client: { id: string; name: string };
  product: { id: string; name: string };
  quantity: number;
  status: string;
}
