import { deriveCategoryIds, draftFromDetail, parseCsvPreview } from './convocatoria-wizard.model';
import { FormDetail, FormQuestion, FormSection } from '../../forms/models/form.model';
import { ConvocatoriaDetail } from './convocatoria.model';

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

describe('parseCsvPreview', () => {
  it('skips the header row and parses name,email pairs', () => {
    const text = 'nombre,email\nAna,ana@x.com\nCarlos,carlos@x.com';
    expect(parseCsvPreview(text)).toEqual([
      { name: 'Ana', email: 'ana@x.com' },
      { name: 'Carlos', email: 'carlos@x.com' },
    ]);
  });

  it('trims whitespace around each cell', () => {
    const text = 'nombre,email\n  Ana  ,  ana@x.com  ';
    expect(parseCsvPreview(text)).toEqual([{ name: 'Ana', email: 'ana@x.com' }]);
  });

  it('skips blank lines', () => {
    const text = 'nombre,email\nAna,ana@x.com\n\n\nCarlos,carlos@x.com';
    expect(parseCsvPreview(text)).toEqual([
      { name: 'Ana', email: 'ana@x.com' },
      { name: 'Carlos', email: 'carlos@x.com' },
    ]);
  });

  it('returns an empty array for an empty file', () => {
    expect(parseCsvPreview('')).toEqual([]);
  });

  it('returns an empty array for a header-only file', () => {
    expect(parseCsvPreview('nombre,email')).toEqual([]);
  });

  it('skips rows missing a name or email', () => {
    const text = 'nombre,email\nAna,\n,carlos@x.com';
    expect(parseCsvPreview(text)).toEqual([]);
  });
});

describe('draftFromDetail', () => {
  function detail(overrides: Partial<ConvocatoriaDetail> = {}): ConvocatoriaDetail {
    return {
      id: 'c1', tenantId: 't1', formId: 'f1', name: 'Analista RRHH', type: 'CANDIDATES',
      status: 'DRAFT', categoryWeights: [], scoringConfig: { aptoMin: 70, revisarMin: 50 },
      startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [],
      ...overrides,
    };
  }

  it('maps scalar fields directly', () => {
    const draft = draftFromDetail(detail());
    expect(draft.name).toBe('Analista RRHH');
    expect(draft.processType).toBe('CANDIDATES');
    expect(draft.formId).toBe('f1');
    expect(draft.aptoMin).toBe(70);
    expect(draft.revisarMin).toBe(50);
  });

  it('maps categoryWeights into a categoryId -> weight record', () => {
    const draft = draftFromDetail(detail({
      categoryWeights: [{ categoryId: 'cat1', weight: 60 }, { categoryId: 'cat2', weight: 40 }],
    }));
    expect(draft.weights).toEqual({ cat1: 60, cat2: 40 });
  });

  it('leaves candidates and csv state empty', () => {
    const draft = draftFromDetail(detail());
    expect(draft.manualCandidates).toEqual([]);
    expect(draft.csvFile).toBeNull();
    expect(draft.csvPreviewRows).toEqual([]);
  });

  it('preserves a null formId', () => {
    const draft = draftFromDetail(detail({ formId: null }));
    expect(draft.formId).toBeNull();
  });

  it('produces an empty weights record when categoryWeights is empty', () => {
    const draft = draftFromDetail(detail({ categoryWeights: [] }));
    expect(draft.weights).toEqual({});
  });
});
