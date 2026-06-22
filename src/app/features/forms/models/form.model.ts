export type FormType = 'CANDIDATES' | 'DIAGNOSTIC' | 'REGISTRATION';
export type FormStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

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

export interface CreateFormRequest {
  name: string;
  type: FormType;
  description?: string;
}
