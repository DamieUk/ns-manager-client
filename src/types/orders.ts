import type { ClientDocument } from './clients';

export interface OrderSummary {
  id: string;
  client: { id: string; name: string };
  product: { id: string; name: string };
  quantity: number;
  description: string;
  status: string;
}

export interface OrderDetail extends OrderSummary {
  documents: ClientDocument[];
}

export type ProductType = 'PCB' | 'Component' | 'Other';

export interface Product {
  _id: string;
  client: string;
  name: string;
  sku: string;
  type: ProductType;
  description?: string;
  bomFile?: ClientDocument;
  additionalFiles: ClientDocument[];
}

export interface OrderInput {
  client: string;
  product: string;
  quantity: number;
  description: string;
  status?: string;
  documents?: string[];
}
