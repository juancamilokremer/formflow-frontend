import type { ProcessType } from './convocatoria-wizard.model';

export type ConvocatoriaStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface CategoryWeight {
  categoryId: string;
  weight: number;
}

export interface ScoringConfig {
  aptoMin: number;
  revisarMin: number;
}

export type CandidateStatus = 'INVITED' | 'RESPONDED' | 'EXPIRED';

export interface CandidateScores {
  total: number;
  byCategory: Record<string, number>;
}

export interface Candidate {
  id: string;
  convocatoriaId: string;
  name: string;
  email: string;
  token: string;
  status: CandidateStatus;
  responseId: string | null;
  scores: CandidateScores | null;
  invitedAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface ConvocatoriaDetail {
  id: string;
  tenantId: string;
  formId: string | null;
  name: string;
  type: ProcessType;
  status: ConvocatoriaStatus;
  categoryWeights: CategoryWeight[];
  scoringConfig: ScoringConfig;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  candidates: Candidate[];
}

export interface CreateConvocatoriaRequest {
  name: string;
  type: ProcessType;
  formId?: string;
  categoryWeights?: CategoryWeight[];
  scoringConfig?: ScoringConfig;
}

export interface AddCandidateRequest {
  name: string;
  email: string;
}

export interface ImportResponse {
  imported: number;
  skipped: number;
  errors: string[];
}

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
