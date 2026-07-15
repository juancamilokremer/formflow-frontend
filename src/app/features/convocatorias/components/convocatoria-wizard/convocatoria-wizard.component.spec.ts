import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConvocatoriaWizardComponent } from './convocatoria-wizard.component';
import { ConvocatoriaLaunchService } from '../../services/convocatoria-launch.service';
import { CategoryService } from '../../services/category.service';
import { FormsService } from '../../../forms/services/forms.service';
import { ConvocatoriaDetail } from '../../models/convocatoria.model';
import { LaunchError, LaunchResult } from '../../models/convocatoria-wizard.model';
import { FormDetail, FormSection } from '../../../forms/models/form.model';
import { Category } from '../../models/category.model';

const MOCK_CONVOCATORIA: ConvocatoriaDetail = {
  id: 'c1', tenantId: 't1', formId: 'f1', name: 'Analista de RRHH', status: 'ACTIVE',
  categoryWeights: [], scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '',
  candidates: [{ id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't', status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '' }],
};

const MOCK_LAUNCH_RESULT: LaunchResult = {
  launched: MOCK_CONVOCATORIA, convocatoriaId: 'c1', failures: [],
};

function buildComponent(launchImpl?: ReturnType<typeof vi.fn>) {
  const mockLaunchService = {
    launch: launchImpl ?? vi.fn().mockReturnValue(of(MOCK_LAUNCH_RESULT)),
  };

  const mockCategoryService = {
    getAll: vi.fn().mockReturnValue(of([] as Category[])),
  };

  const mockFormsService = {
    getAll: vi.fn().mockReturnValue(of([])),
    getById: vi.fn().mockReturnValue(of({} as FormDetail)),
  };

  TestBed.overrideProvider(ConvocatoriaLaunchService, { useValue: mockLaunchService });
  TestBed.overrideProvider(CategoryService, { useValue: mockCategoryService });
  TestBed.overrideProvider(FormsService, { useValue: mockFormsService });

  const fixture = TestBed.createComponent(ConvocatoriaWizardComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockLaunchService, mockCategoryService, mockFormsService };
}

function withOneCandidate(component: ConvocatoriaWizardComponent) {
  component['draft'].update((d) => ({
    ...d, name: 'RRHH', formId: 'f1',
    manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }],
  }));
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

  describe('onBasicInfoChanged', () => {
    it('keeps formId and weights when only the name changes', () => {
      const { component } = buildComponent();
      component['draft'].update((d) => ({ ...d, formId: 'f1', weights: { c1: 40 } }));

      component['onBasicInfoChanged']({ name: 'Nuevo nombre', processType: 'CANDIDATES' });

      expect(component['draft']().formId).toBe('f1');
      expect(component['draft']().weights).toEqual({ c1: 40 });
    });

    it('resets formId, weights and loaded categories when processType changes', () => {
      const { component } = buildComponent();
      component['draft'].update((d) => ({ ...d, formId: 'f1', weights: { c1: 40 } }));
      component['formCategories'].set([
        { id: 'c1', name: 'Técnicas', color: '#000', description: null, createdAt: '', updatedAt: '' },
      ]);

      component['onBasicInfoChanged']({ name: 'RRHH', processType: 'DIAGNOSTIC' });

      expect(component['draft']().formId).toBeNull();
      expect(component['draft']().weights).toEqual({});
      expect(component['formCategories']()).toEqual([]);
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

  describe('onLaunchRequested', () => {
    it('does nothing when step5 is invalid', () => {
      const { component, mockLaunchService } = buildComponent();
      component['onLaunchRequested']();
      expect(mockLaunchService.launch).not.toHaveBeenCalled();
    });

    it('delegates to ConvocatoriaLaunchService with the draft, null id and empty succeeded set on first attempt', () => {
      const { component, mockLaunchService } = buildComponent();
      withOneCandidate(component);

      component['onLaunchRequested']();

      expect(mockLaunchService.launch).toHaveBeenCalledWith(
        component['draft'](), null, new Set(),
      );
    });

    it('on success, stores the convocatoriaId, failures and launch result', () => {
      const failures = [{ ok: false as const, candidate: { name: 'Bea', email: 'bea@x.com' }, error: 'dup' }];
      const launch = vi.fn().mockReturnValue(of({ launched: MOCK_CONVOCATORIA, convocatoriaId: 'c1', failures }));
      const { component } = buildComponent(launch);
      withOneCandidate(component);

      component['onLaunchRequested']();

      expect(component['launchResult']()).toEqual(MOCK_CONVOCATORIA);
      expect(component['candidateAddFailures']()).toEqual(failures);
      expect(component['submitting']()).toBe(false);
    });

    it('on error, sets submitError according to the failed stage and remembers the convocatoriaId for retry', () => {
      const err: LaunchError = { stage: 'launch', convocatoriaId: 'c1', failures: [] };
      const launch = vi.fn().mockReturnValue(throwError(() => err));
      const { component, mockLaunchService } = buildComponent(launch);
      withOneCandidate(component);

      component['onLaunchRequested']();

      expect(component['submitError']()).toBe('convocatorias.wizard.review.error_launch');
      expect(component['submitting']()).toBe(false);

      // Retrying must reuse the convocatoriaId captured from the error, not null. Ana isn't in
      // the reported failures, so a 'launch'-stage failure implies she was already added.
      mockLaunchService.launch.mockReturnValue(of(MOCK_LAUNCH_RESULT));
      component['onLaunchRequested']();
      expect(mockLaunchService.launch).toHaveBeenLastCalledWith(
        component['draft'](), 'c1', new Set(['ana@x.com']),
      );
    });

    it('accumulates succeeded candidate emails across a launch-stage failure and passes them on retry', () => {
      const err: LaunchError = {
        stage: 'launch',
        convocatoriaId: 'c1',
        failures: [{ ok: false as const, candidate: { name: 'Bea', email: 'bea@x.com' }, error: 'dup' }],
      };
      const launch = vi.fn().mockReturnValue(throwError(() => err));
      const { component, mockLaunchService } = buildComponent(launch);
      component['draft'].update((d) => ({
        ...d, name: 'RRHH', formId: 'f1',
        manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }, { name: 'Bea', email: 'bea@x.com' }],
      }));

      component['onLaunchRequested']();

      mockLaunchService.launch.mockReturnValue(of(MOCK_LAUNCH_RESULT));
      component['onLaunchRequested']();

      // Ana succeeded in the failed round (only Bea is reported as a failure), so she must be
      // excluded from the retry's "already succeeded" set... i.e. included in it.
      expect(mockLaunchService.launch).toHaveBeenLastCalledWith(
        component['draft'](), 'c1', new Set(['ana@x.com']),
      );
    });

    it('does not mark anyone as succeeded when the create stage fails (no convocatoriaId yet)', () => {
      const err: LaunchError = { stage: 'create' };
      const launch = vi.fn().mockReturnValue(throwError(() => err));
      const { component, mockLaunchService } = buildComponent(launch);
      withOneCandidate(component);

      component['onLaunchRequested']();

      expect(component['submitError']()).toBe('convocatorias.wizard.review.error_create');
      mockLaunchService.launch.mockReturnValue(of(MOCK_LAUNCH_RESULT));
      component['onLaunchRequested']();
      expect(mockLaunchService.launch).toHaveBeenLastCalledWith(component['draft'](), null, new Set());
    });
  });
});
