export interface ResponseSummary {
  id: string;
  respondentToken: string;
  convocatoriaId: string | null;
  candidateId: string | null;
  totalScore: number | null;
  submittedAt: string;
  startedAt: string | null;
}

export interface ResponsePage {
  items: ResponseSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface AnswerDetail {
  questionId: string;
  questionTitle: string;
  questionType: string;
  value: unknown;
  displayValue: string | null;
}

export interface CategoryScoreDetail {
  categoryId: string;
  categoryName: string;
  score: number;
}

export interface ResponseDetail {
  id: string;
  formId: string;
  respondentToken: string;
  convocatoriaId: string | null;
  candidateId: string | null;
  totalScore: number | null;
  categoryScores: CategoryScoreDetail[] | null;
  answers: AnswerDetail[];
  submittedAt: string;
  startedAt: string | null;
}
