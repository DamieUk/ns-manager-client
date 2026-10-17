import type { Currency } from './orders';

export type InvoiceKind = 'prepayment' | 'balance' | 'full';
export type InvoiceStatus = 'issued' | 'paid' | 'cancelled';

export interface Invoice {
  id: string;
  number: string;
  order: string;
  kind: InvoiceKind;
  description: string | null; // the printed line; null: derived from the batch
  amount: number; // without VAT
  vatRate: number;
  vatAmount: number;
  total: number; // with VAT: what the client pays
  issuedAt: string;
  dueAt: string | null;
  status: InvoiceStatus;
  paidAmount: number | null;
  paidAt: string | null;
  isOverdue: boolean;
  note: string | null;
  createdAt: string;
}

type BatchRef = { id: string; number: string; product: { id: string; name: string } };

// An invoice or purchase in the overall lists, with its batch and client.
export interface InvoiceListItem extends Omit<Invoice, 'order'> {
  order: BatchRef;
  client: { id: string; name: string };
}

// Invoiced and toInvoice are without VAT (against the batch price); invoicedWithVat, paid and
// awaiting are what the client pays. vatRate is the one new invoices get.
export interface BatchPayments {
  invoiced: number;
  invoicedWithVat: number;
  paid: number;
  toInvoice: number;
  awaiting: number;
  vatRate: number;
}

export type PurchaseCategory = 'pcb' | 'components' | 'stencil' | 'service' | 'other';
export type PurchaseStatus = 'planned' | 'ordered' | 'shipped' | 'received' | 'cancelled';

export interface Purchase {
  id: string;
  order: string;
  category: PurchaseCategory;
  supplier: string;
  description: string | null;
  supplierOrderNo: string | null;
  trackingNumber: string | null;
  cost: number | null;
  currency: Currency | null;
  status: PurchaseStatus;
  orderedAt: string | null;
  expectedAt: string | null;
  receivedAt: string | null;
  isLate: boolean;
  createdAt: string;
}

export interface PurchaseListItem extends Omit<Purchase, 'order'> {
  order: BatchRef;
  client: { id: string; name: string };
}

// Our own company's requisites for invoices and delivery notes.
export interface Company {
  name: string;
  legalName: string;
  edrpou: string;
  legalAddress: string;
  iban: string;
  bankName: string;
  bankMfo: string;
  bankEdrpou: string;
  vatPayer: boolean;
  vatNumber: string;
  taxNote: string;
  signatory: string;
  phone: string;
  email: string;
  updatedAt: string;
}

// A delivery note (видаткова накладна): lines from one client's batches; prices without VAT.
export interface ShipmentLine {
  order: { id: string; number: string };
  description: string;
  quantity: number;
  unitPrice: number;
  sum: number;
}

export interface Shipment {
  id: string;
  number: string;
  client: { id: string; name: string };
  shippedAt: string;
  carrier: string | null;
  trackingNumber: string | null;
  note: string | null;
  lines: ShipmentLine[];
  net: number;
  vatRate: number;
  vat: number;
  total: number;
  createdAt: string;
}
