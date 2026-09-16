import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { EncuestaDetailComponent } from './encuesta-detail.component';
import { ConvocatoriaService } from '../../../convocatorias/services/convocatoria.service';
import { FormsService } from '../../../forms/services/forms.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Candidate, ConvocatoriaDetail, ConvocatoriaForm } from '../../../convocatorias/models/convocatoria.model';
import { Form, FormDetail } from '../../../forms/models/form.model';

const DRAFT_ENCUESTA: ConvocatoriaDetail = {
  id: 'c1', tenantId: 't1', name: 'Clima laboral', type: 'REGISTRATION', status: 'DRAFT',
  scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [], forms: [],
};

const CONV_FORM_1: ConvocatoriaForm = {
  id: 'cf1', formId: 'f1', weight: 100, categoryWeights: [], minScore: null, position: 0,
};

const FORM_1: Form = {
  id: 'f1', name: 'Encuesta de clima', description: null, type: 'REGISTRATION', status: 'ACTIVE',
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
  const initial = options.convocatoria ?? DRAFT_ENCUESTA;
  const mockConvocatoriaService = {
    getById: options.getByIdImpl ?? vi.fn().mockReturnValue(of(initial)),
    update: options.updateImpl ?? vi.fn().mockReturnValue(of(initial)),
    reorderForms: options.reorderFormsImpl ?? vi.fn().mockReturnValue(of([])),
    delete: vi.fn().mockReturnValue(of(undefined)),
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
    imports: [EncuestaDetailComponent],
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

  const fixture = TestBed.createComponent(EncuestaDetailComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService, mockFormsService, mockRouter };
}

describe('EncuestaDetailComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('hydrates from getById', () => {
    const { component } = buildComponent();
    expect(component['convocatoria']()).toEqual(DRAFT_ENCUESTA);
    expect(component['loading']()).toBe(false);
  });

  it('isDraft reflects the encuesta status', () => {
    const { component } = buildComponent({ convocatoria: { ...DRAFT_ENCUESTA, status: 'ACTIVE' } });
    expect(component['isDraft']()).toBe(false);
  });

  it('detailTabs is the fixed encuesta tab set (respuestas, no ranking/stats/umbrales)', () => {
    const { component } = buildComponent({ convocatoria: { ...DRAFT_ENCUESTA, status: 'ACTIVE' } });
    const ids = component['detailTabs'].map((t) => t.id);
    expect(ids).toEqual(['respuestas', 'per-question', 'formularios']);
  });

  describe('setActiveTab', () => {
    it('defaults to the respuestas tab and switches on demand', () => {
      const { component } = buildComponent({ convocatoria: { ...DRAFT_ENCUESTA, status: 'ACTIVE' } });

      expect(component['activeTab']()).toBe('respuestas');

      component['setActiveTab']('formularios');
      expect(component['activeTab']()).toBe('formularios');
    });

    it('starts on the tab given in the ?tab query param', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_ENCUESTA, status: 'ACTIVE' },
        queryParams: { tab: 'formularios' },
      });

      expect(component['activeTab']()).toBe('formularios');
    });

    it('ignores an invalid ?tab query param and falls back to respuestas', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_ENCUESTA, status: 'ACTIVE' },
        queryParams: { tab: 'not-a-real-tab' },
      });

      expect(component['activeTab']()).toBe('respuestas');
    });
  });

  describe('draftTabs', () => {
    it('omits umbrales and relabels candidatos to destinatarios', () => {
      const { component } = buildComponent();
      const tabs = component['draftTabs']();
      expect(tabs.find((t) => t.id === 'umbrales')).toBeUndefined();
      expect(tabs.map((t) => t.id)).toEqual(['formularios', 'destinatarios', 'lanzar']);
    });

    it('marks formularios complete with one form regardless of weight', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_ENCUESTA, forms: [{ ...CONV_FORM_1, weight: 40 }] },
      });
      expect(component['draftTabs']().find((t) => t.id === 'formularios')?.badge).toBe('complete');
    });

    it('marks destinatarios as pending with none and complete with at least one', () => {
      const { component } = buildComponent();
      expect(component['draftTabs']().find((t) => t.id === 'destinatarios')?.badge).toBe('pending');

      component['onCandidateAdded']({
        id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't',
        status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '',
      });

      expect(component['draftTabs']().find((t) => t.id === 'destinatarios')?.badge).toBe('complete');
    });
  });

  describe('setDraftTab', () => {
    it('defaults to formularios and switches on demand', () => {
      const { component } = buildComponent();

      expect(component['draftActiveTab']()).toBe('formularios');

      component['setDraftTab']('destinatarios');
      expect(component['draftActiveTab']()).toBe('destinatarios');

      component['setDraftTab']('lanzar');
      expect(component['draftActiveTab']()).toBe('lanzar');
    });
  });

  it('backToListPath points at the encuestas list', () => {
    const { component } = buildComponent();
    expect(component['backToListPath']).toEqual(['/', 'encuestas']);
  });

  it('onNameBlur persists immediately when the name changed', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    const input = document.createElement('input');
    input.value = 'Nuevo nombre';

    component['onNameBlur']({ target: input } as unknown as FocusEvent);

    expect(mockConvocatoriaService.update).toHaveBeenCalledWith('c1', { name: 'Nuevo nombre' });
  });

  it('onNameBlur does nothing when the name is unchanged', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    const input = document.createElement('input');
    input.value = 'Clima laboral';

    component['onNameBlur']({ target: input } as unknown as FocusEvent);

    expect(mockConvocatoriaService.update).not.toHaveBeenCalled();
  });

  it('onCandidateAdded appends the recipient to the local list', () => {
    const { component } = buildComponent();
    const candidate: Candidate = {
      id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't',
      status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '',
    };

    component['onCandidateAdded'](candidate);

    expect(component['convocatoria']()?.candidates).toEqual([candidate]);
  });

  it('onLaunched replaces the local encuesta with the launched detail', () => {
    const { component } = buildComponent();
    const launched: ConvocatoriaDetail = { ...DRAFT_ENCUESTA, status: 'ACTIVE' };

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
        convocatoria: { ...DRAFT_ENCUESTA, forms: [CONV_FORM_1] },
      });
      const updated: ConvocatoriaForm = { ...CONV_FORM_1, weight: 60 };

      component['onFormUpdated'](updated);

      expect(component['convocatoria']()?.forms).toEqual([updated]);
    });

    it('onFormRemoved filters the form out of the list', () => {
      const { component } = buildComponent({
        convocatoria: { ...DRAFT_ENCUESTA, forms: [CONV_FORM_1] },
      });

      component['onFormRemoved']('cf1');

      expect(component['convocatoria']()?.forms).toEqual([]);
    });

    it('onFormsReordered optimistically reorders locally, then reconciles with the backend response', () => {
      const cf2: ConvocatoriaForm = { ...CONV_FORM_1, id: 'cf2', position: 1 };
      const reordered = [cf2, CONV_FORM_1];
      const { component, mockConvocatoriaService } = buildComponent({
        convocatoria: { ...DRAFT_ENCUESTA, forms: [CONV_FORM_1, cf2] },
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
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'encuestas']);
  });
});
