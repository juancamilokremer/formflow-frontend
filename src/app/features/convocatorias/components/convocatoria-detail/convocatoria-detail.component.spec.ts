import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ConvocatoriaDetailComponent } from './convocatoria-detail.component';
import { ConvocatoriaService } from '../../services/convocatoria.service';
import { FormsService } from '../../../forms/services/forms.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Candidate, ConvocatoriaDetail, ConvocatoriaForm, ConvocatoriaStats, RankingEntry } from '../../models/convocatoria.model';
import { Form, FormDetail } from '../../../forms/models/form.model';

const DRAFT_CONVOCATORIA: ConvocatoriaDetail = {
  id: 'c1', tenantId: 't1', name: 'RRHH', type: 'CANDIDATES', status: 'DRAFT',
  scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [], forms: [],
};

const CONV_FORM_1: ConvocatoriaForm = {
  id: 'cf1', formId: 'f1', weight: 100, categoryWeights: [], minScore: null, position: 0,
};

const SURVEY_CONVOCATORIA: ConvocatoriaDetail = {
  ...DRAFT_CONVOCATORIA, type: 'REGISTRATION',
};

const FORM_1: Form = {
  id: 'f1', name: 'Evaluación técnica', description: null, type: 'CANDIDATES', status: 'ACTIVE',
  version: 1, sectionCount: 2, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '',
};

const FORM_1_DETAIL: FormDetail = { ...FORM_1, sections: [], timeLimitSeconds: null };

function buildComponent(options: {
  convocatoria?: ConvocatoriaDetail;
  updateImpl?: ReturnType<typeof vi.fn>;
  getByIdImpl?: ReturnType<typeof vi.fn>;
  reorderFormsImpl?: ReturnType<typeof vi.fn>;
  queryParams?: Record<string, string>;
} = {}) {
  const initial = options.convocatoria ?? DRAFT_CONVOCATORIA;
  const mockConvocatoriaService = {
    getById: options.getByIdImpl ?? vi.fn().mockReturnValue(of(initial)),
    update: options.updateImpl ?? vi.fn().mockReturnValue(of(initial)),
    reorderForms: options.reorderFormsImpl ?? vi.fn().mockReturnValue(of([])),
    delete: vi.fn().mockReturnValue(of(undefined)),
    getRanking: vi.fn().mockReturnValue(of([] as RankingEntry[])),
    getStats: vi.fn().mockReturnValue(of({
      convocatoriaId: 'c1', convocatoriaName: 'RRHH', total: 0, notStarted: 0, inProgress: 0,
      responded: 0, aptoCount: 0, revisarCount: 0, noAptoCount: 0, participationPct: 0,
    } satisfies ConvocatoriaStats)),
  };
  const mockFormsService = {
    getAll: vi.fn().mockReturnValue(of([] as Form[])),
    getById: vi.fn().mockReturnValue(of(FORM_1_DETAIL)),
    getResponses: vi.fn().mockReturnValue(of({ items: [], totalElements: 0, totalPages: 0, page: 0, size: 20 })),
    getResponseDetail: vi.fn().mockReturnValue(of(null)),
  };
  const mockCategoryService = {
    getAll: vi.fn().mockReturnValue(of([])),
  };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaDetailComponent],
    providers: [
      provideRouter([]),
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: FormsService, useValue: mockFormsService },
      { provide: CategoryService, useValue: mockCategoryService },
      { provide: Router, useValue: mockRouter },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: () => 'c1' },
            queryParamMap: { get: (key: string) => options.queryParams?.[key] ?? null },
          },
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaDetailComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService, mockFormsService, mockRouter };
}

describe('ConvocatoriaDetailComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('hydrates from getById and seeds thresholds', () => {
    const withThresholds: ConvocatoriaDetail = {
      ...DRAFT_CONVOCATORIA,
      scoringConfig: { aptoMin: 80, revisarMin: 40 },
    };
    const { component } = buildComponent({ convocatoria: withThresholds });

    expect(component['convocatoria']()).toEqual(withThresholds);
    expect(component['aptoMin']()).toBe(80);
    expect(component['revisarMin']()).toBe(40);
    expect(component['loading']()).toBe(false);
  });

  it('isDraft reflects the convocatoria status', () => {
    const { component } = buildComponent({ convocatoria: { ...DRAFT_CONVOCATORIA, status: 'ACTIVE' } });
    expect(component['isDraft']()).toBe(false);
  });

  describe('setActiveTab', () => {
    it('defaults to the ranking tab and switches on demand', () => {
      const { component } = buildComponent({ convocatoria: { ...DRAFT_CONVOCATORIA, status: 'ACTIVE' } });

      expect(component['activeTab']()).toBe('ranking');

      component['setActiveTab']('formularios');
      expect(component['activeTab']()).toBe('formularios');

      component['setActiveTab']('stats');
      expect(component['activeTab']()).toBe('stats');
    });

    it('starts on the tab given in the ?tab query param, e.g. after returning from a form preview', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_CONVOCATORIA, status: 'ACTIVE' },
        queryParams: { tab: 'formularios' },
      });

      expect(component['activeTab']()).toBe('formularios');
    });

    it('ignores an invalid ?tab query param and falls back to ranking', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_CONVOCATORIA, status: 'ACTIVE' },
        queryParams: { tab: 'not-a-real-tab' },
      });

      expect(component['activeTab']()).toBe('ranking');
    });
  });

  describe('draftTabs', () => {
    it('marks formularios as pending with no forms', () => {
      const { component } = buildComponent();
      const formsTab = component['draftTabs']().find((t) => t.id === 'formularios');
      expect(formsTab?.badge).toBe('pending');
    });

    it('marks formularios as pending when weights do not sum to 100', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_CONVOCATORIA, forms: [{ ...CONV_FORM_1, weight: 60 }] },
      });
      const formsTab = component['draftTabs']().find((t) => t.id === 'formularios');
      expect(formsTab?.badge).toBe('pending');
    });

    it('marks formularios as complete with at least one form and weights summing to 100', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_CONVOCATORIA, forms: [CONV_FORM_1] },
      });
      const formsTab = component['draftTabs']().find((t) => t.id === 'formularios');
      expect(formsTab?.badge).toBe('complete');
    });

    it('marks candidatos as pending with no candidates and complete with at least one', () => {
      const { component } = buildComponent();
      expect(component['draftTabs']().find((t) => t.id === 'candidatos')?.badge).toBe('pending');

      component['onCandidateAdded']({
        id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't',
        status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '',
      });

      expect(component['draftTabs']().find((t) => t.id === 'candidatos')?.badge).toBe('complete');
    });

    it('umbrales and lanzar have no badge', () => {
      const { component } = buildComponent();
      expect(component['draftTabs']().find((t) => t.id === 'umbrales')?.badge).toBeUndefined();
      expect(component['draftTabs']().find((t) => t.id === 'lanzar')?.badge).toBeUndefined();
    });
  });

  describe('setDraftTab', () => {
    it('defaults to formularios and switches on demand', () => {
      const { component } = buildComponent();

      expect(component['draftActiveTab']()).toBe('formularios');

      component['setDraftTab']('candidatos');
      expect(component['draftActiveTab']()).toBe('candidatos');

      component['setDraftTab']('lanzar');
      expect(component['draftActiveTab']()).toBe('lanzar');
    });
  });

  describe('simple mode (REGISTRATION surveys)', () => {
    it('detailTabs replaces ranking with respuestas and omits stats', () => {
      const { component } = buildComponent({
        convocatoria: { ...SURVEY_CONVOCATORIA, status: 'ACTIVE', forms: [CONV_FORM_1] },
      });
      const ids = component['detailTabs']().map((t) => t.id);
      expect(ids).toEqual(['respuestas', 'per-question', 'formularios']);
    });

    it('leaves detailTabs unchanged for non-survey types', () => {
      const { component } = buildComponent({ convocatoria: { ...DRAFT_CONVOCATORIA, status: 'ACTIVE' } });
      const ids = component['detailTabs']().map((t) => t.id);
      expect(ids).toEqual(['ranking', 'stats', 'per-question', 'formularios']);
    });

    it('effectiveTab clamps the ranking fallback to respuestas once a survey loads', () => {
      const { component } = buildComponent({
        convocatoria: { ...SURVEY_CONVOCATORIA, status: 'ACTIVE', forms: [CONV_FORM_1] },
      });
      expect(component['activeTab']()).toBe('ranking');
      expect(component['effectiveTab']()).toBe('respuestas');
    });

    it('draftTabs omits umbrales and relabels candidatos to destinatarios', () => {
      const { component } = buildComponent({ convocatoria: SURVEY_CONVOCATORIA });
      const tabs = component['draftTabs']();
      expect(tabs.find((t) => t.id === 'umbrales')).toBeUndefined();
      expect(tabs.find((t) => t.id === 'candidatos')?.label).toBe('convocatorias.detail.draft_tabs.destinatarios');
    });

    it('draftTabs marks formularios complete with one form regardless of weight', () => {
      const { component } = buildComponent({
        convocatoria: { ...SURVEY_CONVOCATORIA, forms: [{ ...CONV_FORM_1, weight: 40 }] },
      });
      expect(component['draftTabs']().find((t) => t.id === 'formularios')?.badge).toBe('complete');
    });
  });

  it('backToListPath points at the convocatorias list', () => {
    const { component } = buildComponent();
    expect(component['backToListPath']).toEqual(['/', 'convocatorias']);
  });

  it('debounces thresholds changes into a single update() call with name + scoringConfig only', () => {
    vi.useFakeTimers();
    const { component, mockConvocatoriaService } = buildComponent();

    component['onThresholdsChanged']({ aptoMin: 75, revisarMin: 45 });
    component['onThresholdsChanged']({ aptoMin: 78, revisarMin: 48 });

    expect(mockConvocatoriaService.update).not.toHaveBeenCalled();
    vi.advanceTimersByTime(600);

    expect(mockConvocatoriaService.update).toHaveBeenCalledTimes(1);
    expect(mockConvocatoriaService.update).toHaveBeenCalledWith('c1', {
      name: 'RRHH',
      scoringConfig: { aptoMin: 78, revisarMin: 48 },
    });
  });

  it('onNameBlur persists immediately when the name changed', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    const input = document.createElement('input');
    input.value = 'Nuevo nombre';

    component['onNameBlur']({ target: input } as unknown as FocusEvent);

    expect(mockConvocatoriaService.update).toHaveBeenCalledWith('c1', expect.objectContaining({ name: 'Nuevo nombre' }));
  });

  it('onNameBlur does nothing when the name is unchanged', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    const input = document.createElement('input');
    input.value = 'RRHH';

    component['onNameBlur']({ target: input } as unknown as FocusEvent);

    expect(mockConvocatoriaService.update).not.toHaveBeenCalled();
  });

  it('onCandidateAdded appends the candidate to the local list', () => {
    const { component } = buildComponent();
    const candidate: Candidate = {
      id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't',
      status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '',
    };

    component['onCandidateAdded'](candidate);

    expect(component['convocatoria']()?.candidates).toEqual([candidate]);
  });

  it('onLaunched replaces the local convocatoria with the launched detail', () => {
    const { component } = buildComponent();
    const launched: ConvocatoriaDetail = { ...DRAFT_CONVOCATORIA, status: 'ACTIVE' };

    component['onLaunched'](launched);

    expect(component['convocatoria']()).toEqual(launched);
  });

  describe('forms list wiring', () => {
    it('onFormAdded appends the new ConvocatoriaForm and the underlying Form to their respective lists', () => {
      const { component } = buildComponent();

      component['onFormAdded']({ convocatoriaForm: CONV_FORM_1, form: FORM_1 });

      expect(component['convocatoria']()?.forms).toEqual([CONV_FORM_1]);
      expect(component['forms']()).toEqual([FORM_1]);
    });

    it('onFormUpdated replaces the matching form in place', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_CONVOCATORIA, forms: [CONV_FORM_1] },
      });
      const updated: ConvocatoriaForm = { ...CONV_FORM_1, weight: 60 };

      component['onFormUpdated'](updated);

      expect(component['convocatoria']()?.forms).toEqual([updated]);
    });

    it('onFormRemoved filters the form out of the list', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_CONVOCATORIA, forms: [CONV_FORM_1] },
      });

      component['onFormRemoved']('cf1');

      expect(component['convocatoria']()?.forms).toEqual([]);
    });

    it('onFormsReordered optimistically reorders locally, then reconciles with the backend response', () => {
      const cf2: ConvocatoriaForm = { ...CONV_FORM_1, id: 'cf2', position: 1 };
      const reordered = [cf2, CONV_FORM_1];
      const { component, mockConvocatoriaService } = buildComponent({
        convocatoria: { ...DRAFT_CONVOCATORIA, forms: [CONV_FORM_1, cf2] },
        reorderFormsImpl: vi.fn().mockReturnValue(of(reordered)),
      });

      component['onFormsReordered'](['cf2', 'cf1']);

      expect(component['convocatoria']()?.forms.map((f) => f.id)).toEqual(['cf2', 'cf1']);
      expect(mockConvocatoriaService.reorderForms).toHaveBeenCalledWith('c1', ['cf2', 'cf1']);
      expect(component['convocatoria']()?.forms).toEqual(reordered);
    });
  });

  it('confirmDelete deletes and navigates to the list', () => {
    const { component, mockConvocatoriaService, mockRouter } = buildComponent();

    component['confirmDelete']();

    expect(mockConvocatoriaService.delete).toHaveBeenCalledWith('c1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias']);
  });
});
