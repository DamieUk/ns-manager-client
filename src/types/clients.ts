export interface Client {
  _id: string;
  name: string;
  code: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Contract {
  _id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

export interface ClientDocument {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface ClientDetail extends Client {
  contracts: Contract[];
  documents: ClientDocument[];
}
