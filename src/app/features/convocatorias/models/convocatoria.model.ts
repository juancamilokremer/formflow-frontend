import { Form } from '../../forms/models/form.model';

export type ConvocatoriaStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type ProcessType = 'CANDIDATES' | 'DIAGNOSTIC';

export const PROCESS_TYPE_LABEL_KEYS: Record<ProcessType, string> = {
  CANDIDATES: 'convocatorias.create.type_candidates',
  DIAGNOSTIC: 'convocatorias.create.type_diagnostic',
};

export interface CategoryWeight {
  categoryId: string;
  weight: number;
}

export interface ScoringConfig {
  aptoMin: number;
  revisarMin: number;
}

export type CandidateStatus = 'INVITED' | 'IN_PROGRESS' | 'RESPONDED' | 'EXPIRED';

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

export interface ConvocatoriaForm {
  id: string;
  formId: string;
  weight: number;
  categoryWeights: CategoryWeight[];
  minScore: number | null;
  position: number;
}

export interface FormAddedEvent {
  convocatoriaForm: ConvocatoriaForm;
  form: Form;
}

export interface ConvocatoriaDetail {
  id: string;
  tenantId: string;
  name: string;
  type: ProcessType;
  status: ConvocatoriaStatus;
  scoringConfig: ScoringConfig;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  candidates: Candidate[];
  forms: ConvocatoriaForm[];
}

export interface CreateConvocatoriaRequest {
  name: string;
  type: ProcessType;
  formId?: string;
  categoryWeights?: CategoryWeight[];
  scoringConfig?: ScoringConfig;
}

export interface UpdateConvocatoriaRequest {
  name: string;
  scoringConfig?: ScoringConfig;
}

export interface AddConvocatoriaFormRequest {
  formId: string;
  weight: number;
  categoryWeights?: CategoryWeight[];
  minScore?: number | null;
}

export interface UpdateConvocatoriaFormRequest {
  weight: number;
  categoryWeights?: CategoryWeight[];
  minScore?: number | null;
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

export type CandidateClassification = 'APTO' | 'REVISAR' | 'NO_APTO';

export interface RankingFormScore {
  formId: string;
  formName: string;
  weight: number;
  score: number | null;
  completed: boolean;
}

export interface RankingEntry {
  candidateId: string;
  name: string;
  email: string;
  token: string | null;
  status: CandidateStatus;
  responseId: string | null;
  rank: number | null;
  totalScore: number | null;
  classification: CandidateClassification | null;
  scoresByCategory: Record<string, number>;
  respondedAt: string | null;
  formScores: RankingFormScore[];
}

export interface ConvocatoriaStats {
  convocatoriaId: string;
  convocatoriaName: string;
  total: number;
  notStarted: number;
  inProgress: number;
  responded: number;
  aptoCount: number;
  revisarCount: number;
  noAptoCount: number;
  participationPct: number;
}
