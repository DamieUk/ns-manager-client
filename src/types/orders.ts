export interface OrderSummary {
  id: string;
  client: { id: string; name: string };
  product: { id: string; name: string };
  quantity: number;
  status: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
}

export interface OrderInput {
  client: string;
  product: string;
  quantity: number;
  status?: string;
}

