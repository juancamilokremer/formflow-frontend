import { FormDetail } from '../../forms/models/form.model';
import { ManualCandidateDraft } from '../models/convocatoria.model';

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
