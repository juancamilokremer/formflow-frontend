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

export type ExportFormat = 'excel' | 'csv';

export interface ExportedFile {
  blob: Blob;
  filename: string;
}

export type ResponsePreset = '7d' | '30d' | 'all';

export interface DateRangeFilter {
  from: string | undefined;
  to: string | undefined;
}

/**
 * Local yyyy-mm-dd (the native <input type="date"> format), not an ISO instant —
 * converting to an ISO bound happens later, once, from that string, so presets and
 * hand-typed custom dates go through the exact same from-date-string-to-instant path
 * and neither can drift a day off local midnight the way pre-converting here would.
 */
export function resolvePresetDateFrom(preset: ResponsePreset, referenceDate = new Date()): string | undefined {
  if (preset === 'all') return undefined;

  const days = preset === '7d' ? 7 : 30;
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  const year = cutoff.getFullYear();
  const month = String(cutoff.getMonth() + 1).padStart(2, '0');
  const day = String(cutoff.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Converts a yyyy-mm-dd date-input value to an ISO instant at local midnight (inclusive lower bound). */
export function dateInputToIsoStart(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00`).toISOString();
}

/** Converts a yyyy-mm-dd date-input value to an ISO instant at local end-of-day (inclusive upper bound). */
export function dateInputToIsoEnd(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return new Date(`${value}T23:59:59.999`).toISOString();
}
