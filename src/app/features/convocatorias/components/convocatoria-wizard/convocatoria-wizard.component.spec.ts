import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConvocatoriaWizardComponent } from './convocatoria-wizard.component';
import { ConvocatoriaService } from '../../services/convocatoria.service';
import { CategoryService } from '../../services/category.service';
import { FormsService } from '../../../forms/services/forms.service';
import { ConvocatoriaDetail } from '../../models/convocatoria.model';
import { FormDetail, FormSection } from '../../../forms/models/form.model';
import { Category } from '../../models/category.model';

const MOCK_CONVOCATORIA: ConvocatoriaDetail = {
  id: 'c1', tenantId: 't1', formId: 'f1', name: 'Analista de RRHH', status: 'ACTIVE',
  categoryWeights: [], scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '',
  candidates: [{ id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't', status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '' }],
};

function buildComponent(overrides: {
  create?: unknown; addCandidate?: unknown; importCandidates?: unknown; launch?: unknown;
} = {}) {
  const callOrder: string[] = [];

  const mockConvocatoriaService = {
    getAll: vi.fn().mockReturnValue(of([])),
    create: overrides.create ?? vi.fn().mockImplementation(() => { callOrder.push('create'); return of(MOCK_CONVOCATORIA); }),
    addCandidate: overrides.addCandidate ?? vi.fn().mockImplementation(() => { callOrder.push('addCandidate'); return of({}); }),
    importCandidates: overrides.importCandidates ?? vi.fn().mockImplementation(() => { callOrder.push('importCandidates'); return of({ imported: 1, skipped: 0, errors: [] }); }),
    launch: overrides.launch ?? vi.fn().mockImplementation(() => { callOrder.push('launch'); return of(MOCK_CONVOCATORIA); }),
    close: vi.fn(),
    delete: vi.fn(),
  };

  const mockCategoryService = {
    getAll: vi.fn().mockReturnValue(of([] as Category[])),
  };

  const mockFormsService = {
    getAll: vi.fn().mockReturnValue(of([])),
    getById: vi.fn().mockReturnValue(of({} as FormDetail)),
  };

  TestBed.overrideProvider(ConvocatoriaService, { useValue: mockConvocatoriaService });
  TestBed.overrideProvider(CategoryService, { useValue: mockCategoryService });
  TestBed.overrideProvider(FormsService, { useValue: mockFormsService });

  const fixture = TestBed.createComponent(ConvocatoriaWizardComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService, mockCategoryService, mockFormsService, callOrder };
}

describe('ConvocatoriaWizardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvocatoriaWizardComponent],
      providers: [provideRouter([]), provideTranslateService({ lang: 'es' })],
    }).compileComponents();
  });

  describe('per-step validity', () => {
    it('step1Valid requires a non-empty name', () => {
      const { component } = buildComponent();
      expect(component['step1Valid']()).toBe(false);
      component['draft'].update((d) => ({ ...d, name: '  ' }));
      expect(component['step1Valid']()).toBe(false);
      component['draft'].update((d) => ({ ...d, name: 'RRHH' }));
      expect(component['step1Valid']()).toBe(true);
    });

    it('step2Valid requires a selected formId', () => {
      const { component } = buildComponent();
      expect(component['step2Valid']()).toBe(false);
      component['draft'].update((d) => ({ ...d, formId: 'f1' }));
      expect(component['step2Valid']()).toBe(true);
    });

    it('step3Valid accepts a total weight of exactly 0 or 100, nothing in between', () => {
      const { component } = buildComponent();
      component['draft'].update((d) => ({ ...d, weights: {} }));
      expect(component['step3Valid']()).toBe(true);

      component['draft'].update((d) => ({ ...d, weights: { c1: 40, c2: 60 } }));
      expect(component['step3Valid']()).toBe(true);

      component['draft'].update((d) => ({ ...d, weights: { c1: 40, c2: 40 } }));
      expect(component['step3Valid']()).toBe(false);
    });

    it('step4Valid requires revisarMin strictly below aptoMin', () => {
      const { component } = buildComponent();
      component['draft'].update((d) => ({ ...d, aptoMin: 70, revisarMin: 50 }));
      expect(component['step4Valid']()).toBe(true);
      component['draft'].update((d) => ({ ...d, aptoMin: 70, revisarMin: 70 }));
      expect(component['step4Valid']()).toBe(false);
    });

    it('step5Valid requires manual candidates or a staged csv file', () => {
      const { component } = buildComponent();
      expect(component['step5Valid']()).toBe(false);
      component['draft'].update((d) => ({ ...d, manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }] }));
      expect(component['step5Valid']()).toBe(true);
    });
  });

  describe('buildCreateRequest', () => {
    it('omits categoryWeights when the total weight is 0', () => {
      const { component } = buildComponent();
      component['draft'].update((d) => ({ ...d, name: 'RRHH', formId: 'f1', weights: {} }));
      const req = component['buildCreateRequest']();
      expect(req.categoryWeights).toBeUndefined();
      expect(req.scoringConfig).toEqual({ aptoMin: 70, revisarMin: 50 });
    });

    it('includes only weights greater than 0', () => {
      const { component } = buildComponent();
      component['draft'].update((d) => ({
        ...d, name: 'RRHH', formId: 'f1', weights: { c1: 40, c2: 60, c3: 0 },
      }));
      const req = component['buildCreateRequest']();
      expect(req.categoryWeights).toEqual([
        { categoryId: 'c1', weight: 40 },
        { categoryId: 'c2', weight: 60 },
      ]);
    });
  });

  describe('loadFormCategories', () => {
    it('resolves derived category ids against the full category list and seeds weights', () => {
      const categories: Category[] = [
        { id: 'c1', name: 'Técnicas', color: '#000', description: null, createdAt: '', updatedAt: '' },
        { id: 'c2', name: 'Blandas', color: '#000', description: null, createdAt: '', updatedAt: '' },
      ];
      const formDetail: FormDetail = {
        id: 'f1', name: 'Form', description: null, type: 'CANDIDATES', status: 'ACTIVE',
        version: 1, sectionCount: 1, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '',
        timeLimitSeconds: null,
        sections: [{
          id: 's1', title: 's1', position: 0,
          questions: [
            { id: 'q1', type: 'text', title: 'q1', description: null, position: 0, required: false, categoryId: 'c2', config: {} },
            { id: 'q2', type: 'text', title: 'q2', description: null, position: 1, required: false, categoryId: 'c1', config: {} },
          ],
        } satisfies FormSection],
      };

      const { component, mockCategoryService, mockFormsService } = buildComponent();
      mockFormsService.getById.mockReturnValue(of(formDetail));
      mockCategoryService.getAll.mockReturnValue(of(categories));

      component['draft'].update((d) => ({ ...d, formId: 'f1', weights: { c2: 35 } }));
      component['loadFormCategories']();

      expect(component['formCategories']().map((c) => c.id)).toEqual(['c2', 'c1']);
      expect(component['draft']().weights).toEqual({ c2: 35, c1: 0 });
      expect(component['loadingCategories']()).toBe(false);
    });
  });

  describe('onLaunchRequested orchestration', () => {
    function withOneCandidate(component: ConvocatoriaWizardComponent) {
      component['draft'].update((d) => ({
        ...d, name: 'RRHH', formId: 'f1',
        manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }],
      }));
    }

    it('creates, adds candidates, then launches in that order', () => {
      const { component, callOrder } = buildComponent();
      withOneCandidate(component);

      component['onLaunchRequested']();

      expect(callOrder).toEqual(['create', 'addCandidate', 'launch']);
      expect(component['launchResult']()).toEqual(MOCK_CONVOCATORIA);
      expect(component['submitting']()).toBe(false);
    });

    it('uses the csv import endpoint instead of addCandidate when a csv file is staged', () => {
      const { component, callOrder, mockConvocatoriaService } = buildComponent();
      component['draft'].update((d) => ({
        ...d, name: 'RRHH', formId: 'f1', csvFile: new File(['a'], 'c.csv'),
      }));

      component['onLaunchRequested']();

      expect(callOrder).toEqual(['create', 'importCandidates', 'launch']);
      expect(mockConvocatoriaService.addCandidate).not.toHaveBeenCalled();
    });

    it('does not re-create the convocatoria on retry after a later-stage failure', () => {
      let launchCalls = 0;
      const launch = vi.fn().mockImplementation(() => {
        launchCalls += 1;
        return launchCalls === 1 ? throwError(() => new Error('boom')) : of(MOCK_CONVOCATORIA);
      });
      const { component, mockConvocatoriaService } = buildComponent({ launch });
      withOneCandidate(component);

      component['onLaunchRequested']();
      expect(component['submitError']()).toBe('convocatorias.wizard.review.error_launch');
      expect(mockConvocatoriaService.create).toHaveBeenCalledTimes(1);

      component['onLaunchRequested']();
      expect(mockConvocatoriaService.create).toHaveBeenCalledTimes(1);
      expect(component['launchResult']()).toEqual(MOCK_CONVOCATORIA);
    });

    it('still launches when some manual candidates fail as long as one succeeds', () => {
      let call = 0;
      const addCandidate = vi.fn().mockImplementation(() => {
        call += 1;
        return call === 1 ? throwError(() => new Error('duplicate')) : of({});
      });
      const { component, callOrder } = buildComponent({ addCandidate });
      component['draft'].update((d) => ({
        ...d, name: 'RRHH', formId: 'f1',
        manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }, { name: 'Bea', email: 'bea@x.com' }],
      }));

      component['onLaunchRequested']();

      expect(callOrder).toEqual(['create', 'launch']);
      expect(component['candidateAddFailures']().length).toBe(1);
      expect(component['launchResult']()).toEqual(MOCK_CONVOCATORIA);
    });

    it('aborts before launch when all candidate adds fail', () => {
      const addCandidate = vi.fn().mockReturnValue(throwError(() => new Error('duplicate')));
      const { component, callOrder } = buildComponent({ addCandidate });
      withOneCandidate(component);

      component['onLaunchRequested']();

      expect(callOrder).toEqual(['create']);
      expect(component['submitError']()).toBe('convocatorias.wizard.review.error_candidates');
      expect(component['launchResult']()).toBeNull();
    });

    it('does nothing when step5 is invalid', () => {
      const { component, callOrder } = buildComponent();
      component['onLaunchRequested']();
      expect(callOrder).toEqual([]);
    });
  });
});
