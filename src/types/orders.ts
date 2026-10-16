import type { ClientDocument, Contract } from './clients';
import type { BatchPayments, Invoice, Purchase } from './finance';

export type OrderStage =
  | 'quote'
  | 'agreement'
  | 'invoicing'
  | 'procurement'
  | 'prep'
  | 'assembly'
  | 'washing'
  | 'qc'
  | 'shipping'
  | 'done'
  | 'cancelled';

export type Currency = 'USD' | 'EUR' | 'UAH';

type Person = { id: string; name: string };

// A batch (партія). Prices (per board, without VAT), the next stage and its blockers come only
// for owners; `total` is quantity × unitPrice.
export interface OrderSummary {
  id: string;
  number: string;
  client: { id: string; name: string };
  product: { id: string; name: string };
  quantity: number;
  description: string;
  status: string;
  stage: OrderStage;
  stageChangedAt: string;
  dueDate: string | null;
  isOverdue: boolean;
  manager: Person | null;
  assignedEmployees: Person[];
  createdAt: string;
  unitQuote?: number | null;
  quoteCurrency?: Currency | null;
  exchangeRate?: number | null;
  unitPrice?: number | null;
  total?: number | null;
  priceLocked?: boolean;
  nextStage?: OrderStage | null;
  blockers?: string[];
}

export interface StageEvent {
  id: string;
  fromStage: OrderStage | null;
  toStage: OrderStage;
  user: Person | null;
  note: string | null;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  documents: ClientDocument[];
  progress: { completed: number; needsRework: number; partiallyAssembled: number; remaining: number };
  history: StageEvent[];
  annexes?: Contract[];
  invoices?: Invoice[];
  payments?: BatchPayments;
  purchases?: Purchase[];
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
  dueDate?: string | null;
  manager?: string | null;
  assignedEmployees?: string[];
  documents?: string[];
}

export interface PriceInput {
  unitQuote: number | null;
  quoteCurrency: Currency | null;
  exchangeRate: number | null;
  unitPrice: number | null;
}
