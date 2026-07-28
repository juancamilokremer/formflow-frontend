import { FormDetail } from '../../forms/models/form.model';

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
