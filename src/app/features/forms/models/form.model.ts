export type FormType   = 'CANDIDATES' | 'DIAGNOSTIC' | 'REGISTRATION';
export type FormStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type QuestionType = 'text' | 'single' | 'multiple' | 'scale' | 'date' | 'file' | 'matrix' | 'nps' | 'info';

export type LogicOperator    = 'AND' | 'OR';
export type ConditionOperator =
  | 'EQUALS' | 'NOT_EQUALS'
  | 'CONTAINS' | 'NOT_CONTAINS'
  | 'GREATER_THAN' | 'LESS_THAN'
  | 'IS_EMPTY' | 'IS_NOT_EMPTY';

export interface Condition {
  questionId: string;
  operator:   ConditionOperator;
  value:      string | null;
}

export interface ConditionalLogicConfig {
  logicOperator: LogicOperator;
  conditions:    Condition[];
}

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
  conditionalLogic?: ConditionalLogicConfig | null;
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
  conditionalLogic?: ConditionalLogicConfig | null;
}

export interface QuestionMovedEvent {
  questionId: string;
  fromSectionId: string;
  toSectionId: string;
  orderedToIds: string[];
}

export interface CanvasQuestionChangedEvent {
  questionId: string;
  sectionId: string;
  change: Partial<FormQuestion>;
}
