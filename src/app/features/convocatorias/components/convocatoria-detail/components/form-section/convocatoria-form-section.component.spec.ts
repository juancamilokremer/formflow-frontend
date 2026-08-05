import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { of, throwError } from 'rxjs';
import { ConvocatoriaFormSectionComponent } from './convocatoria-form-section.component';
import { FormsService } from '../../../../../forms/services/forms.service';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { CategoryService } from '../../../../../../core/services/category.service';
import { Form } from '../../../../../forms/models/form.model';
import { ConvocatoriaForm, FormAddedEvent } from '../../../../models/convocatoria.model';

const ACTIVE_CANDIDATES_FORM: Form = {
  id: 'f1', name: 'Evaluación técnica', description: null, type: 'CANDIDATES', status: 'ACTIVE',
  version: 1, sectionCount: 2, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '',
};
const DRAFT_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f2', status: 'DRAFT' };
const DIAGNOSTIC_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f3', type: 'DIAGNOSTIC' };
const NEW_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f4', name: 'RRHH' };
const DUPLICATED_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f5', name: 'Evaluación técnica (copia)' };

const CONV_FORM_1: ConvocatoriaForm = {
  id: 'cf1', formId: 'f1', weight: 100, categoryWeights: [], minScore: null, position: 0,
};

function buildComponent(overrides: {
  createImpl?: unknown; duplicateImpl?: unknown; addFormImpl?: unknown;
  convocatoriaForms?: ConvocatoriaForm[];
} = {}) {
  const mockFormsService = {
    create: overrides.createImpl ?? vi.fn().mockReturnValue(of(NEW_FORM)),
    duplicate: overrides.duplicateImpl ?? vi.fn().mockReturnValue(of(DUPLICATED_FORM)),
    getById: vi.fn().mockReturnValue(of({ sections: [] })),
    remove: vi.fn().mockReturnValue(of(undefined)),
  };
  const mockConvocatoriaService = {
    addForm: overrides.addFormImpl ?? vi.fn().mockReturnValue(
      of({ id: 'cf5', formId: 'f5', weight: 0, categoryWeights: [], minScore: null, position: 1 })),
    updateForm: vi.fn().mockReturnValue(of(CONV_FORM_1)),
    removeForm: vi.fn().mockReturnValue(of(undefined)),
  };
  const mockCategoryService = { getAll: vi.fn().mockReturnValue(of([])) };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaFormSectionComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: FormsService, useValue: mockFormsService },
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: CategoryService, useValue: mockCategoryService },
      { provide: Router, useValue: mockRouter },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaFormSectionComponent);
  fixture.componentRef.setInput('convocatoriaId', 'c1');
  fixture.componentRef.setInput('convocatoriaName', 'RRHH');
  fixture.componentRef.setInput('processType', 'CANDIDATES');
  fixture.componentRef.setInput('forms', [ACTIVE_CANDIDATES_FORM, DRAFT_FORM, DIAGNOSTIC_FORM]);
  fixture.componentRef.setInput('convocatoriaForms', overrides.convocatoriaForms ?? []);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mockFormsService, mockConvocatoriaService, mockRouter };
}

describe('ConvocatoriaFormSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('matchingForms filters by ACTIVE status and matching processType', () => {
    const { component } = buildComponent();
    expect(component['matchingForms']().map((f) => f.id)).toEqual(['f1']);
  });

  it('formName resolves the form name from the forms list by formId', () => {
    const { component } = buildComponent();
    expect(component['formName'](CONV_FORM_1)).toBe('Evaluación técnica');
  });

  describe('totalWeight / sumValid', () => {
    it('sums the weights of all attached forms', () => {
      const { component } = buildComponent({
        convocatoriaForms: [CONV_FORM_1, { ...CONV_FORM_1, id: 'cf2', weight: 0 }],
      });
      expect(component['totalWeight']()).toBe(100);
      expect(component['sumValid']()).toBe(true);
    });

    it('reflects live (unsaved) weight previews immediately, without waiting for a save', () => {
      const { component } = buildComponent({ convocatoriaForms: [CONV_FORM_1] });
      component['onWeightPreview']('cf1', 60);
      expect(component['totalWeight']()).toBe(60);
      expect(component['sumValid']()).toBe(false);
    });
  });

  describe('createNew', () => {
    it('creates a form named after the convocatoria and navigates to the builder with convocatoriaId', () => {
      const { component, mockFormsService, mockRouter } = buildComponent();

      component['createNew']();

      expect(mockFormsService.create).toHaveBeenCalledWith({ name: 'RRHH', type: 'CANDIDATES' });
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['forms', 'f4', 'edit'],
        { queryParams: { convocatoriaId: 'c1' } },
      );
    });

    it('sets error when creation fails', () => {
      const { component } = buildComponent({ createImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))) });
      component['createNew']();
      expect(component['error']()).toBe(true);
      expect(component['creating']()).toBe(false);
    });
  });

  describe('duplicateSelected', () => {
    it('does nothing without a selected form', () => {
      const { component, mockFormsService } = buildComponent();
      component['duplicateSelected']();
      expect(mockFormsService.duplicate).not.toHaveBeenCalled();
    });

    it('duplicates the selected form, defaults weight to 100 when it is the first form, and emits formAdded', () => {
      const { component, mockFormsService, mockConvocatoriaService } = buildComponent();
      component['selectedFormId'].set('f1');
      let emitted: FormAddedEvent | undefined;
      component.formAdded.subscribe((e) => (emitted = e));

      component['duplicateSelected']();

      expect(mockFormsService.duplicate).toHaveBeenCalledWith('f1');
      expect(mockConvocatoriaService.addForm).toHaveBeenCalledWith('c1', {
        formId: 'f5', weight: 100, categoryWeights: [], minScore: null,
      });
      expect(emitted?.form).toEqual(DUPLICATED_FORM);
      expect(component['selectedFormId']()).toBe('');
    });

    it('defaults weight to 0 when a form is already attached', () => {
      const { component, mockConvocatoriaService } = buildComponent({ convocatoriaForms: [CONV_FORM_1] });
      component['selectedFormId'].set('f1');

      component['duplicateSelected']();

      expect(mockConvocatoriaService.addForm).toHaveBeenCalledWith('c1', {
        formId: 'f5', weight: 0, categoryWeights: [], minScore: null,
      });
    });

    it('sets error when the attach step fails', () => {
      const { component } = buildComponent({
        addFormImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
      });
      component['selectedFormId'].set('f1');

      component['duplicateSelected']();

      expect(component['error']()).toBe(true);
      expect(component['duplicating']()).toBe(false);
    });
  });

  describe('onDrop', () => {
    it('reorders and emits the new id order', () => {
      const cf2: ConvocatoriaForm = { ...CONV_FORM_1, id: 'cf2' };
      const { component } = buildComponent({ convocatoriaForms: [CONV_FORM_1, cf2] });
      let emitted: string[] | undefined;
      component.formsReordered.subscribe((ids) => (emitted = ids));

      component['onDrop']({ previousIndex: 0, currentIndex: 1 } as CdkDragDrop<ConvocatoriaForm[]>);

      expect(emitted).toEqual(['cf2', 'cf1']);
    });
  });

  describe('onCardRemoved', () => {
    it('clears the live weight preview and emits formRemoved', () => {
      const { component } = buildComponent({ convocatoriaForms: [CONV_FORM_1] });
      component['onWeightPreview']('cf1', 40);
      let emitted: string | undefined;
      component.formRemoved.subscribe((id) => (emitted = id));

      component['onCardRemoved']('cf1');

      expect(emitted).toBe('cf1');
      expect(component['liveWeights']()).toEqual({});
    });
  });

  describe('onCardUpdated', () => {
    it('re-emits the updated form as formUpdated', () => {
      const { component } = buildComponent({ convocatoriaForms: [CONV_FORM_1] });
      const updated: ConvocatoriaForm = { ...CONV_FORM_1, weight: 70 };
      let emitted: ConvocatoriaForm | undefined;
      component.formUpdated.subscribe((f) => (emitted = f));

      component['onCardUpdated'](updated);

      expect(emitted).toEqual(updated);
    });
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
});
