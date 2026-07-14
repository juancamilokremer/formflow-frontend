export type ConvocatoriaStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface ConvocatoriaSummary {
  id: string;
  name: string;
  status: ConvocatoriaStatus;
  candidateCount: number;
  respondedCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export type ConvocatoriaListView = 'loading' | 'error' | 'ready';

export type StatusFilterOption = ConvocatoriaStatus | 'ALL';

export interface PendingConvocatoriaAction {
  type: 'close' | 'delete';
  id: string;
  name: string;
}
