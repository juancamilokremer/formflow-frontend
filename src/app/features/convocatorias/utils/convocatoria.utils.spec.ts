import { deriveCategoryIds } from './convocatoria.utils';
import { FormDetail, FormQuestion, FormSection } from '../../forms/models/form.model';

function question(id: string, categoryId: string | null): FormQuestion {
  return {
    id, type: 'text', title: id, description: null, position: 0, required: false,
    categoryId, config: {},
  };
}

function section(id: string, questions: FormQuestion[]): FormSection {
  return { id, title: id, position: 0, questions };
}

function form(sections: FormSection[]): FormDetail {
  return {
    id: 'f1', name: 'Form', description: null, type: 'CANDIDATES', status: 'ACTIVE',
    version: 1, sectionCount: sections.length, responseCount: 0, lastResponseAt: null,
    createdAt: '', updatedAt: '', sections, timeLimitSeconds: null,
  };
}

describe('deriveCategoryIds', () => {
  it('collects distinct categoryIds in first-appearance order across sections', () => {
    const f = form([
      section('s1', [question('q1', 'catB'), question('q2', 'catA')]),
      section('s2', [question('q3', 'catA'), question('q4', 'catC')]),
    ]);

    expect(deriveCategoryIds(f)).toEqual(['catB', 'catA', 'catC']);
  });

  it('ignores questions with a null categoryId', () => {
    const f = form([section('s1', [question('q1', null), question('q2', 'catA')])]);
    expect(deriveCategoryIds(f)).toEqual(['catA']);
  });

  it('returns an empty array when the form has no sections', () => {
    expect(deriveCategoryIds(form([]))).toEqual([]);
  });

  it('returns an empty array when no question has a category', () => {
    const f = form([section('s1', [question('q1', null)])]);
    expect(deriveCategoryIds(f)).toEqual([]);
  });
});
