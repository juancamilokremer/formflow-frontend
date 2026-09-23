import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { of, throwError } from 'rxjs';
import { ConvocatoriaFormSectionComponent } from './convocatoria-form-section.component';
import { FormsService } from '../../../../../forms/services/forms.service';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { CategoryService } from '../../../../../../core/services/category.service';
import { Form, FormDetail } from '../../../../../forms/models/form.model';
import { ConvocatoriaForm, FormAddedEvent } from '../../../../models/convocatoria.model';

const ACTIVE_CANDIDATES_FORM: Form = {
  id: 'f1', name: 'Evaluación técnica', description: null, type: 'CANDIDATES', status: 'ACTIVE',
  version: 1, sectionCount: 2, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '',
};
const DRAFT_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f2', status: 'DRAFT' };
const DIAGNOSTIC_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f3', type: 'DIAGNOSTIC' };
const DUPLICATED_FORM: FormDetail = {
  ...ACTIVE_CANDIDATES_FORM, id: 'f5', name: 'Evaluación técnica (copia)',
  sections: [], timeLimitSeconds: null,
};

const CONV_FORM_1: ConvocatoriaForm = {
  id: 'cf1', formId: 'f1', weight: 100, categoryWeights: [], minScore: null, position: 0, readyToLaunch: false,
};

function buildComponent(overrides: {
  createFormImpl?: unknown; containerKind?: 'convocatorias' | 'encuestas';
  convocatoriaForms?: ConvocatoriaForm[]; processType?: 'CANDIDATES' | 'DIAGNOSTIC' | 'REGISTRATION';
} = {}) {
  const mockFormsService = {
    getById: vi.fn().mockReturnValue(of(DUPLICATED_FORM)),
    remove: vi.fn().mockReturnValue(of(undefined)),
  };
  const mockConvocatoriaService = {
    createForm: overrides.createFormImpl ?? vi.fn().mockReturnValue(
      of({ id: 'cf5', formId: 'f5', weight: 0, categoryWeights: [], minScore: null, position: 1, readyToLaunch: false })),
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
  fixture.componentRef.setInput('processType', overrides.processType ?? 'CANDIDATES');
  fixture.componentRef.setInput('forms', [ACTIVE_CANDIDATES_FORM, DRAFT_FORM, DIAGNOSTIC_FORM]);
  fixture.componentRef.setInput('convocatoriaForms', overrides.convocatoriaForms ?? []);
  fixture.componentRef.setInput('containerKind', overrides.containerKind ?? 'convocatorias');
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
    it('creates the form already attached, in a single call, and goes to the builder', () => {
      const { component, mockConvocatoriaService, mockRouter } = buildComponent();

      component['createNew']();

      // One call, not create-then-attach: there is no moment where the form is an orphan.
      expect(mockConvocatoriaService.createForm).toHaveBeenCalledWith('c1', {
        name: 'RRHH', type: 'CANDIDATES', weight: 100, categoryWeights: [], minScore: null,
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/', 'convocatorias', 'c1', 'formularios', 'f5'],
      );
    });

    it('routes under encuestas when the container is one', () => {
      const { component, mockRouter } = buildComponent({
        processType: 'REGISTRATION', containerKind: 'encuestas',
      });

      component['createNew']();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/', 'encuestas', 'c1', 'formularios', 'f5'],
      );
    });

    it('sets error when creation fails', () => {
      const { component } = buildComponent({
        createFormImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
      });
      component['createNew']();
      expect(component['error']()).toBe(true);
      expect(component['creating']()).toBe(false);
    });
  });

  describe('duplicateSelected', () => {
    it('does nothing without a selected form', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      component['duplicateSelected']();
      expect(mockConvocatoriaService.createForm).not.toHaveBeenCalled();
    });

    it('duplicates into the convocatoria, defaults weight to 100 when first, and emits formAdded', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      component['selectedFormId'].set('f1');
      let emitted: FormAddedEvent | undefined;
      component.formAdded.subscribe((e) => (emitted = e));

      component['duplicateSelected']();

      expect(mockConvocatoriaService.createForm).toHaveBeenCalledWith('c1', {
        duplicateFromId: 'f1', weight: 100, categoryWeights: [], minScore: null,
      });
      expect(emitted?.form).toEqual(DUPLICATED_FORM);
      expect(component['selectedFormId']()).toBe('');
    });

    it('defaults weight to 0 when a form is already attached', () => {
      const { component, mockConvocatoriaService } = buildComponent({ convocatoriaForms: [CONV_FORM_1] });
      component['selectedFormId'].set('f1');

      component['duplicateSelected']();

      expect(mockConvocatoriaService.createForm).toHaveBeenCalledWith('c1', {
        duplicateFromId: 'f1', weight: 0, categoryWeights: [], minScore: null,
      });
    });

    it('sets error when the duplicate fails', () => {
      const { component } = buildComponent({
        createFormImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
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

  describe('isSimpleMode (REGISTRATION surveys)', () => {
    it('hides the create/duplicate cards once a form is already attached', () => {
      const { fixture } = buildComponent({ processType: 'REGISTRATION', convocatoriaForms: [CONV_FORM_1] });
      expect(fixture.nativeElement.querySelector('.cfs__cards')).toBeNull();
    });

    it('still shows the create/duplicate cards when no form is attached yet', () => {
      const { fixture } = buildComponent({ processType: 'REGISTRATION', convocatoriaForms: [] });
      expect(fixture.nativeElement.querySelector('.cfs__cards')).not.toBeNull();
    });

    it('does not hide the create/duplicate cards for CANDIDATES even with a form already attached', () => {
      const { fixture } = buildComponent({ processType: 'CANDIDATES', convocatoriaForms: [CONV_FORM_1] });
      expect(fixture.nativeElement.querySelector('.cfs__cards')).not.toBeNull();
    });
  });
});
