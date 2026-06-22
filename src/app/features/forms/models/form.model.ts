export type FormType = 'CANDIDATES' | 'DIAGNOSTIC' | 'REGISTRATION';

export interface Form {
  id: string;
  name: string;
  description: string | null;
  type: FormType;
  version: number;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormRequest {
  name: string;
  type: FormType;
  description?: string;
}
