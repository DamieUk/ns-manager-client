import type { Invoice } from '../types/finance';

// Procurement opens once an advance (or the full price) is paid — as the API checks it.
export const isPrepaid = (invoices: Invoice[] = []) =>
  invoices.some((i) => i.status === 'paid' && (i.kind === 'prepayment' || i.kind === 'full'));
