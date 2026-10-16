import type { ContractType, DocumentType } from '../types/clients';

export const DOCUMENT_TYPE_OPTIONS: Array<{ value: DocumentType; label: string }> = [
  { value: 'nda', label: 'NDA' },
  { value: 'framework_contract', label: 'Рамковий договір' },
  { value: 'annex', label: 'Додаток до договору' },
  { value: 'bom', label: 'BOM' },
  { value: 'quote', label: 'Прорахунок' },
  { value: 'invoice', label: 'Рахунок' },
  { value: 'delivery_note', label: 'Видаткова накладна' },
  { value: 'pnp_program', label: 'Програма pick-and-place' },
  { value: 'thermal_profile', label: 'Термопрофіль' },
  { value: 'photo', label: 'Фото' },
  { value: 'other', label: 'Інше' },
];

export const DOCUMENT_TYPE_LABELS = Object.fromEntries(DOCUMENT_TYPE_OPTIONS.map((o) => [o.value, o.label])) as Record<
  DocumentType,
  string
>;

export const CONTRACT_TYPE_OPTIONS: Array<{ value: ContractType; label: string }> = [
  { value: 'nda', label: 'NDA' },
  { value: 'framework', label: 'Рамковий договір' },
  { value: 'annex', label: 'Додаток до договору' },
];

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: 'Чернетка',
  active: 'Діє',
  completed: 'Виконано',
  cancelled: 'Скасовано',
};

export const REQUISITE_FIELDS = [
  { name: 'legalName', label: 'Повна юридична назва', placeholder: 'ТОВ «…»' },
  { name: 'edrpou', label: 'ЄДРПОУ / ІПН', placeholder: '8 цифр (ФОП — 10)' },
  { name: 'vatNumber', label: 'ІПН платника ПДВ', placeholder: 'якщо платник ПДВ' },
  { name: 'legalAddress', label: 'Юридична адреса' },
  { name: 'iban', label: 'IBAN', placeholder: 'UA…' },
  { name: 'bankName', label: 'Банк' },
  { name: 'signatory', label: 'Підписант', placeholder: 'Директор Іваненко І. І.' },
] as const;
