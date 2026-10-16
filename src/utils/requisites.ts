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
