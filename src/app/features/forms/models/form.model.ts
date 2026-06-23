export type FormType   = 'CANDIDATES' | 'DIAGNOSTIC' | 'REGISTRATION';
export type FormStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type QuestionType = 'text' | 'single' | 'multiple' | 'scale' | 'date' | 'file' | 'matrix' | 'nps';

export interface Form {
  id: string;
  name: string;
  description: string | null;
  type: FormType;
  status: FormStatus;
  version: number;
  sectionCount: number;
  responseCount: number;
  lastResponseAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  score?: number;
}

export interface FormQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  position: number;
  required: boolean;
  categoryId: string | null;
  config: Record<string, unknown>;
}

export interface FormSection {
  id: string;
  title: string;
  position: number;
  questions: FormQuestion[];
}

export interface FormDetail extends Form {
  sections: FormSection[];
  timeLimitSeconds: number | null;
}

export interface CreateFormRequest {
  name: string;
  type: FormType;
  description?: string;
}

export interface CreateSectionRequest {
  title: string;
}

export interface UpdateSectionRequest {
  title: string;
}

export interface AddQuestionRequest {
  type: QuestionType;
  title: string;
  required?: boolean;
  description?: string;
  categoryId?: string;
  timeLimitSeconds?: number;
  config?: Record<string, unknown>;
}

export interface UpdateQuestionRequest {
  type: QuestionType;
  title: string;
  required: boolean;
  description?: string | null;
  categoryId?: string | null;
  timeLimitSeconds?: number | null;
  config?: Record<string, unknown>;
}
