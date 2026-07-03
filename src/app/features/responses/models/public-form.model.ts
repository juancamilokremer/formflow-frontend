import { FormQuestion } from '../../forms/models/form.model';

export type PublicQuestion = FormQuestion & { timeLimitSeconds?: number | null };

export interface PublicSection {
  id: string;
  title: string;
  description: string | null;
  position: number;
  timeLimitSeconds?: number | null;
  questions: PublicQuestion[];
}

export interface PublicForm {
  formId: string;
  name: string;
  type: string;
  timeLimitSeconds: number | null;
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantPrimaryColor: string | null;
  sections: PublicSection[];
}

export interface AnswerPayload {
  questionId: string;
  value: unknown;
}

export interface SubmitPublicResponsePayload {
  answers: AnswerPayload[];
  startedAt: string | null;
}

export interface SubmitPublicResponseResult {
  respondentToken: string;
}
