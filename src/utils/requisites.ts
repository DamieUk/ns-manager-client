import type { ClientRequisites } from '../types/clients';

export const EMPTY_REQUISITES: Required<ClientRequisites> = {
  legalName: '',
  edrpou: '',
  legalAddress: '',
  iban: '',
  bankName: '',
  vatNumber: '',
  signatory: '',
};

export function requisitesOf(source: ClientRequisites): Required<ClientRequisites> {
  return Object.fromEntries(Object.keys(EMPTY_REQUISITES).map((k) => [k, source[k as keyof ClientRequisites] ?? ''])) as Required<
    ClientRequisites
  >;
}

const digits = (s: string) => s.replace(/\s+/g, '');

// The same format checks the API makes, so a mistake shows on its field before saving.
export function validateRequisites(values: Required<ClientRequisites>): Partial<Record<keyof ClientRequisites, string>> {
  const errors: Partial<Record<keyof ClientRequisites, string>> = {};
  if (values.edrpou && !/^(\d{8}|\d{10})$/.test(digits(values.edrpou))) errors.edrpou = '8 цифр (ФОП — 10)';
  if (values.iban && !/^UA\d{27}$/.test(digits(values.iban).toUpperCase())) errors.iban = 'UA і 27 цифр';
  if (values.vatNumber && !/^\d{10,12}$/.test(digits(values.vatNumber))) errors.vatNumber = '10–12 цифр';
  return errors;
}
