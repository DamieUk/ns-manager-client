import type { Invoice, InvoiceKind, PurchaseCategory, PurchaseStatus } from '../types/finance';
import { formatDate, formatMoney } from '../utils/format';

export const INVOICE_KIND_OPTIONS: Array<{ value: InvoiceKind; label: string }> = [
  { value: 'prepayment', label: 'Передоплата' },
  { value: 'balance', label: 'Доплата' },
  { value: 'full', label: 'Повна оплата' },
];

export const INVOICE_KIND_LABELS = Object.fromEntries(INVOICE_KIND_OPTIONS.map((o) => [o.value, o.label])) as Record<InvoiceKind, string>;

// How an invoice stands, for its chip: label and MUI color.
export function invoiceState(i: Pick<Invoice, 'status' | 'paidAmount' | 'paidAt' | 'isOverdue'>): {
  label: string;
  color: 'default' | 'success' | 'warning' | 'error' | 'info';
} {
  if (i.status === 'cancelled') return { label: 'Скасовано', color: 'default' };
  if (i.status === 'paid') return { label: `Оплачено ${formatDate(i.paidAt)}`, color: 'success' };
  if (i.paidAmount) return { label: `Частково: ${formatMoney(i.paidAmount)}`, color: 'info' };
  if (i.isOverdue) return { label: 'Протерміновано', color: 'error' };
  return { label: 'Очікує оплати', color: 'warning' };
}

export const PURCHASE_CATEGORY_OPTIONS: Array<{ value: PurchaseCategory; label: string }> = [
  { value: 'pcb', label: 'Друковані плати' },
  { value: 'components', label: 'Компоненти' },
  { value: 'stencil', label: 'Трафарет' },
  { value: 'service', label: 'Підрядник' },
  { value: 'other', label: 'Інше' },
];

export const PURCHASE_CATEGORY_LABELS = Object.fromEntries(PURCHASE_CATEGORY_OPTIONS.map((o) => [o.value, o.label])) as Record<
  PurchaseCategory,
  string
>;

export const PURCHASE_STATUS_OPTIONS: Array<{ value: PurchaseStatus; label: string; color: 'default' | 'info' | 'warning' | 'success' }> = [
  { value: 'planned', label: 'Заплановано', color: 'default' },
  { value: 'ordered', label: 'Замовлено', color: 'info' },
  { value: 'shipped', label: 'В дорозі', color: 'warning' },
  { value: 'received', label: 'Отримано', color: 'success' },
  { value: 'cancelled', label: 'Скасовано', color: 'default' },
];

export const PURCHASE_STATUS = Object.fromEntries(PURCHASE_STATUS_OPTIONS.map((o) => [o.value, o])) as Record<
  PurchaseStatus,
  (typeof PURCHASE_STATUS_OPTIONS)[number]
>;

export const SUPPLIER_SUGGESTIONS = ['JLCPCB', 'LCSC', 'PCBWay', 'Mouser', 'DigiKey', 'TME', 'Farnell'];
