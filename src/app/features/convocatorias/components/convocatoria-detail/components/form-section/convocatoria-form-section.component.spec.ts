import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConvocatoriaFormSectionComponent } from './convocatoria-form-section.component';
import { FormsService } from '../../../../../forms/services/forms.service';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { Form } from '../../../../../forms/models/form.model';

const ACTIVE_CANDIDATES_FORM: Form = {
  id: 'f1', name: 'Evaluación técnica', description: null, type: 'CANDIDATES', status: 'ACTIVE',
  version: 1, sectionCount: 2, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '',
};
const DRAFT_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f2', status: 'DRAFT' };
const DIAGNOSTIC_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f3', type: 'DIAGNOSTIC' };
const NEW_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f4', name: 'RRHH' };
const DUPLICATED_FORM: Form = { ...ACTIVE_CANDIDATES_FORM, id: 'f5', name: 'Evaluación técnica (copia)' };

function buildComponent(overrides: {
  createImpl?: unknown; duplicateImpl?: unknown; updateImpl?: unknown;
} = {}) {
  const mockFormsService = {
    create: overrides.createImpl ?? vi.fn().mockReturnValue(of(NEW_FORM)),
    duplicate: overrides.duplicateImpl ?? vi.fn().mockReturnValue(of(DUPLICATED_FORM)),
  };
  const mockConvocatoriaService = {
    update: overrides.updateImpl ?? vi.fn().mockReturnValue(of({})),
  };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaFormSectionComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: FormsService, useValue: mockFormsService },
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: Router, useValue: mockRouter },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaFormSectionComponent);
  fixture.componentRef.setInput('convocatoriaId', 'c1');
  fixture.componentRef.setInput('convocatoriaName', 'RRHH');
  fixture.componentRef.setInput('processType', 'CANDIDATES');
  fixture.componentRef.setInput('forms', [ACTIVE_CANDIDATES_FORM, DRAFT_FORM, DIAGNOSTIC_FORM]);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockFormsService, mockConvocatoriaService, mockRouter };
}

describe('ConvocatoriaFormSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('matchingForms filters by ACTIVE status and matching processType', () => {
    const { component } = buildComponent();
    expect(component['matchingForms']().map((f) => f.id)).toEqual(['f1']);
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

    it('duplicates the selected form and attaches it to the convocatoria', () => {
      const { component, mockFormsService, mockConvocatoriaService } = buildComponent();
      component['selectedFormId'].set('f1');
      let emitted: Form | undefined;
      component.formAttached.subscribe((f) => (emitted = f));

      component['duplicateSelected']();

      expect(mockFormsService.duplicate).toHaveBeenCalledWith('f1');
      expect(mockConvocatoriaService.update).toHaveBeenCalledWith('c1', { name: 'RRHH', formId: 'f5' });
      expect(emitted).toEqual(DUPLICATED_FORM);
      expect(component['selectedFormId']()).toBe('');
    });

    it('sets error when the attach step fails', () => {
      const { component } = buildComponent({
        updateImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
      });
      component['selectedFormId'].set('f1');

      component['duplicateSelected']();

      expect(component['error']()).toBe(true);
      expect(component['duplicating']()).toBe(false);
    });
  });
});
