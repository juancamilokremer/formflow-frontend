import { FormQuestion } from '../../forms/models/form.model';

// FormQuestion.timeLimitSeconds already covers what this used to redeclare.
export type PublicQuestion = FormQuestion;

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

export interface PublicCandidateForm {
  candidateName: string;
  convocatoriaName: string;
  endDate: string | null;
  alreadyResponded: boolean;
  form: PublicForm;
}

export interface CandidateChecklistFormItem {
  formId: string;
  name: string;
  completed: boolean;
}

export interface CandidateChecklist {
  candidateName: string;
  convocatoriaName: string;
  endDate: string | null;
  allCompleted: boolean;
  forms: CandidateChecklistFormItem[];
}
