import { FormDetail } from '../../forms/models/form.model';
import { ConvocatoriaDetail } from './convocatoria.model';

export type WizardStep = 1 | 2 | 3 | 4 | 5;
export type ProcessType = 'CANDIDATES' | 'DIAGNOSTIC';

export const PROCESS_TYPE_LABEL_KEYS: Record<ProcessType, string> = {
  CANDIDATES: 'convocatorias.wizard.basic_info.type_candidates',
  DIAGNOSTIC: 'convocatorias.wizard.basic_info.type_diagnostic',
};

export interface ManualCandidateDraft {
  name: string;
  email: string;
}

export interface CandidateAddFailure {
  ok: false;
  candidate: ManualCandidateDraft;
  error: unknown;
}

export type LaunchStage = 'create' | 'candidates' | 'launch';

export interface LaunchError {
  stage: LaunchStage;
  convocatoriaId?: string;
  failures?: CandidateAddFailure[];
}

export interface LaunchResult {
  launched: ConvocatoriaDetail;
  convocatoriaId: string;
  failures: CandidateAddFailure[];
}

export interface ConvocatoriaDraft {
  name: string;
  processType: ProcessType;
  formId: string | null;
  weights: Record<string, number>;
  aptoMin: number;
  revisarMin: number;
  manualCandidates: ManualCandidateDraft[];
  csvFile: File | null;
  csvPreviewRows: ManualCandidateDraft[];
}

export const DEFAULT_DRAFT: ConvocatoriaDraft = {
  name: '',
  processType: 'CANDIDATES',
  formId: null,
  weights: {},
  aptoMin: 70,
  revisarMin: 50,
  manualCandidates: [],
  csvFile: null,
  csvPreviewRows: [],
};

/**
 * Walks the form's sections/questions in their existing (position-ordered) array order,
 * collecting distinct categoryIds in first-appearance order. This is the reading order a
 * form-builder user sees, which is more intuitive for a weighting UI than alphabetical.
 */
export function deriveCategoryIds(form: FormDetail): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const section of form.sections) {
    for (const question of section.questions) {
      const id = question.categoryId;
      if (id && !seen.has(id)) {
        seen.add(id);
        ordered.push(id);
      }
    }
  }
  return ordered;
}

/**
 * Hydrates the wizard's local draft from a persisted convocatoria (early-draft flow) —
 * candidates are intentionally left out, since today they're only sent at launch time,
 * not added incrementally as the user progresses through the wizard.
 */
export function draftFromDetail(detail: ConvocatoriaDetail): ConvocatoriaDraft {
  return {
    name: detail.name,
    processType: detail.type,
    formId: detail.formId,
    weights: Object.fromEntries(detail.categoryWeights.map((w) => [w.categoryId, w.weight])),
    aptoMin: detail.scoringConfig.aptoMin,
    revisarMin: detail.scoringConfig.revisarMin,
    manualCandidates: [],
    csvFile: null,
    csvPreviewRows: [],
  };
}

/**
 * Client-side preview only — the backend re-parses and validates authoritatively on import.
 * Minimal comma-split, no quoting/escaping support.
 */
export function parseCsvPreview(text: string): ManualCandidateDraft[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
  if (lines.length === 0) return [];

  const rows = lines.slice(1); // skip header row (nombre, email)
  const result: ManualCandidateDraft[] = [];
  for (const line of rows) {
    const [name, email] = line.split(',').map((cell) => cell?.trim() ?? '');
    if (name && email) {
      result.push({ name, email });
    }
  }
  return result;
}
