export type ClientStatus = 'active' | 'deleted';

export type DocumentType =
  | 'nda'
  | 'framework_contract'
  | 'annex'
  | 'bom'
  | 'quote'
  | 'invoice'
  | 'delivery_note'
  | 'pnp_program'
  | 'thermal_profile'
  | 'photo'
  | 'other';

export type ContractType = 'nda' | 'framework' | 'annex';

// Requisites printed on generated invoices and delivery notes.
export interface ClientRequisites {
  legalName?: string;
  edrpou?: string;
  legalAddress?: string;
  iban?: string;
  bankName?: string;
  vatNumber?: string;
  signatory?: string;
}

export interface PaperState {
  contractId: string;
  number: string | null;
  signedAt: string | null;
}

export interface ClientPapers {
  nda: PaperState | null;
  framework: PaperState | null;
}

export interface Client extends ClientRequisites {
  _id: string;
  name: string;
  code: string;
  status: ClientStatus;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  papers?: ClientPapers;
}

export interface ClientInput extends Required<ClientRequisites> {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export interface ClientDocument {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  type?: DocumentType;
  createdAt: string;
}

export interface Contract {
  _id: string;
  title: string;
  type: ContractType;
  number?: string;
  signedAt?: string;
  order?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  documents: ClientDocument[];
}

export interface ClientDetail extends Client {
  papers: ClientPapers;
  contracts: Contract[];
  documents: ClientDocument[];
}
