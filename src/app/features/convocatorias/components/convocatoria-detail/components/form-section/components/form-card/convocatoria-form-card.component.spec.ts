import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConvocatoriaFormCardComponent } from './convocatoria-form-card.component';
import { FormsService } from '../../../../../../../forms/services/forms.service';
import { CategoryService } from '../../../../../../../../core/services/category.service';
import { ConvocatoriaService } from '../../../../../../services/convocatoria.service';
import { ConvocatoriaForm } from '../../../../../../models/convocatoria.model';
import { FormDetail, FormSection } from '../../../../../../../forms/models/form.model';
import { Category } from '../../../../../../../../core/models/category.model';

const CONV_FORM: ConvocatoriaForm = {
  id: 'cf1', formId: 'f1', weight: 40, categoryWeights: [{ categoryId: 'cat-1', weight: 100 }], minScore: 50, position: 0,
};

const MOCK_SECTION: FormSection = {
  id: 's1', title: 'Sección 1', position: 1,
  questions: [
    { id: 'q1', type: 'text', title: 'P1', description: null, position: 1, required: false, categoryId: 'cat-1', config: {}, timeLimitSeconds: null },
  ],
};

const MOCK_FORM_DETAIL: FormDetail = {
  id: 'f1', name: 'Evaluación técnica', description: null, type: 'CANDIDATES', status: 'DRAFT',
  version: 1, sectionCount: 1, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '',
  sections: [MOCK_SECTION], timeLimitSeconds: null,
};

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
];

function buildComponent(overrides: {
  updateFormImpl?: unknown; removeFormImpl?: unknown; getByIdImpl?: unknown;
  convocatoriaForm?: ConvocatoriaForm;
} = {}) {
  const mockConvocatoriaService = {
    updateForm: overrides.updateFormImpl ?? vi.fn().mockReturnValue(of({ ...CONV_FORM, weight: 60 })),
    removeForm: overrides.removeFormImpl ?? vi.fn().mockReturnValue(of(undefined)),
  };
  const mockFormsService = {
    getById: overrides.getByIdImpl ?? vi.fn().mockReturnValue(of(MOCK_FORM_DETAIL)),
    remove: vi.fn().mockReturnValue(of(undefined)),
  };
  const mockCategoryService = {
    getAll: vi.fn().mockReturnValue(of(MOCK_CATEGORIES)),
  };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaFormCardComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: FormsService, useValue: mockFormsService },
      { provide: CategoryService, useValue: mockCategoryService },
      { provide: Router, useValue: mockRouter },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaFormCardComponent);
  fixture.componentRef.setInput('convocatoriaId', 'c1');
  fixture.componentRef.setInput('convocatoriaForm', overrides.convocatoriaForm ?? CONV_FORM);
  fixture.componentRef.setInput('formName', 'Evaluación técnica');
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mockConvocatoriaService, mockFormsService, mockRouter };
}

describe('ConvocatoriaFormCardComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('seeds weight/minScore/categoryWeights from the input on init', () => {
    const { component } = buildComponent();
    expect(component['weight']()).toBe(40);
    expect(component['minScore']()).toBe(50);
    expect(component['categoryWeights']()).toEqual({ 'cat-1': 100 });
  });

  it('loads categories restricted to the ones used by the underlying form', () => {
    const { component, mockFormsService } = buildComponent();
    expect(mockFormsService.getById).toHaveBeenCalledWith('f1');
    expect(component['categories']()).toEqual(MOCK_CATEGORIES);
    expect(component['loadingCategories']()).toBe(false);
  });

  it('populates sectionCount and formStatus from the underlying form', () => {
    const { component } = buildComponent();
    expect(component['sectionCount']()).toBe(1);
    expect(component['formStatus']()).toBe('DRAFT');
  });

  it('sets an empty category list on load failure', () => {
    const { component } = buildComponent({ getByIdImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))) });
    expect(component['categories']()).toEqual([]);
    expect(component['loadingCategories']()).toBe(false);
  });

  describe('onWeightInput', () => {
    it('clamps to [0, 100], emits weightPreview immediately, and debounces the save', () => {
      vi.useFakeTimers();
      const { component, mockConvocatoriaService } = buildComponent();
      let previewed: number | undefined;
      component.weightPreview.subscribe((v) => (previewed = v));

      component['onWeightInput'](150);

      expect(component['weight']()).toBe(100);
      expect(previewed).toBe(100);
      expect(mockConvocatoriaService.updateForm).not.toHaveBeenCalled();

      vi.advanceTimersByTime(600);

      expect(mockConvocatoriaService.updateForm).toHaveBeenCalledWith('c1', 'cf1', {
        weight: 100,
        categoryWeights: [{ categoryId: 'cat-1', weight: 100 }],
        minScore: 50,
      });
    });

    it('clamps negative values up to 0', () => {
      const { component } = buildComponent();
      component['onWeightInput'](-5);
      expect(component['weight']()).toBe(0);
    });

    it('emits the debounced result as formUpdated', () => {
      vi.useFakeTimers();
      const { component } = buildComponent();
      let emitted: ConvocatoriaForm | undefined;
      component.formUpdated.subscribe((f) => (emitted = f));

      component['onWeightInput'](60);
      vi.advanceTimersByTime(600);

      expect(emitted).toEqual({ ...CONV_FORM, weight: 60 });
    });
  });

  describe('onMinScoreInput', () => {
    it('parses a numeric string and clamps to [0, 100]', () => {
      vi.useFakeTimers();
      const { component, mockConvocatoriaService } = buildComponent();
      component['onMinScoreInput']('120');
      vi.advanceTimersByTime(600);
      expect(component['minScore']()).toBe(100);
      expect(mockConvocatoriaService.updateForm).toHaveBeenCalledWith('c1', 'cf1', expect.objectContaining({ minScore: 100 }));
    });

    it('treats an empty string as null (no minimum)', () => {
      const { component } = buildComponent();
      component['onMinScoreInput']('   ');
      expect(component['minScore']()).toBeNull();
    });
  });

  describe('onWeightsChanged', () => {
    it('updates categoryWeights and triggers the debounced save', () => {
      vi.useFakeTimers();
      const { component, mockConvocatoriaService } = buildComponent();

      component['onWeightsChanged']({ 'cat-1': 30, 'cat-2': 0 });
      vi.advanceTimersByTime(600);

      expect(component['categoryWeights']()).toEqual({ 'cat-1': 30, 'cat-2': 0 });
      expect(mockConvocatoriaService.updateForm).toHaveBeenCalledWith('c1', 'cf1', expect.objectContaining({
        categoryWeights: [{ categoryId: 'cat-1', weight: 30 }],
      }));
    });
  });

  it('openForm navigates to the builder with the convocatoriaId query param', () => {
    const { component, mockRouter } = buildComponent();
    component['openForm']();
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['forms', 'f1', 'edit'],
      { queryParams: { convocatoriaId: 'c1' } },
    );
  });

  it('openPreview navigates to the preview route with the convocatoriaId and tab query params', () => {
    const { component, mockRouter } = buildComponent();
    component['openPreview']();
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/', 'forms', 'f1', 'preview'],
      { queryParams: { convocatoriaId: 'c1', tab: 'formularios' } },
    );
  });

  describe('readonly', () => {
    it('defaults to false', () => {
      const { component } = buildComponent();
      expect(component['readonly']()).toBe(false);
    });

    it('reflects the readonly input when set', () => {
      const { fixture, component } = buildComponent();
      fixture.componentRef.setInput('readonly', true);
      expect(component['readonly']()).toBe(true);
    });
  });

  describe('requestRemove / confirmRemove', () => {
    it('opens the confirm dialog on requestRemove', () => {
      const { component } = buildComponent();
      component['requestRemove']();
      expect(component['removeConfirmOpen']()).toBe(true);
    });

    it('cancelRemove closes the dialog without calling the service', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      component['requestRemove']();
      component['cancelRemove']();
      expect(component['removeConfirmOpen']()).toBe(false);
      expect(mockConvocatoriaService.removeForm).not.toHaveBeenCalled();
    });

    it('confirmRemove detaches the form, deletes the underlying Form, and emits formRemoved', () => {
      const { component, mockConvocatoriaService, mockFormsService } = buildComponent();
      let emitted: string | undefined;
      component.formRemoved.subscribe((id) => (emitted = id));

      component['confirmRemove']();

      expect(mockConvocatoriaService.removeForm).toHaveBeenCalledWith('c1', 'cf1');
      expect(mockFormsService.remove).toHaveBeenCalledWith('f1');
      expect(emitted).toBe('cf1');
      expect(component['removing']()).toBe(false);
      expect(component['removeConfirmOpen']()).toBe(false);
    });

    it('resets removing on failure and does not emit formRemoved', () => {
      const { component } = buildComponent({
        removeFormImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
      });
      let emitted: string | undefined;
      component.formRemoved.subscribe((id) => (emitted = id));

      component['confirmRemove']();

      expect(component['removing']()).toBe(false);
      expect(emitted).toBeUndefined();
    });

    it('does nothing when already removing', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      component['removing'].set(true);
      component['confirmRemove']();
      expect(mockConvocatoriaService.removeForm).not.toHaveBeenCalled();
    });
  });
});
