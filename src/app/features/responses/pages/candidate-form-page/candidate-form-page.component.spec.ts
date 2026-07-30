import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { CandidateFormPageComponent } from './candidate-form-page.component';
import { PublicResponseService } from '../../services/public-response.service';
import { ConditionEngineService } from '../../../forms/services/condition-engine.service';
import { CandidateChecklist, PublicCandidateForm, PublicForm } from '../../models/public-form.model';

const mockForm: PublicForm = {
  formId:             'form-123',
  name:               'Evaluación de aspirantes',
  type:               'CANDIDATES',
  timeLimitSeconds:   null,
  tenantName:         'Acme Corp',
  tenantLogoUrl:      null,
  tenantPrimaryColor: null,
  sections: [],
};

const mockCandidateForm: PublicCandidateForm = {
  candidateName:    'María García',
  convocatoriaName: 'Analista RRHH',
  endDate:          null,
  alreadyResponded: false,
  form:             mockForm,
};

const mockChecklist: CandidateChecklist = {
  candidateName:    'María García',
  convocatoriaName: 'Analista RRHH',
  endDate:          null,
  allCompleted:     false,
  forms: [
    { formId: 'form-123', name: 'Evaluación de aspirantes', completed: false },
    { formId: 'form-456', name: 'Test psicotécnico',        completed: true },
  ],
};

function buildSvc(overrides: {
  getCandidateChecklistImpl?: Observable<unknown>;
  getCandidateFormImpl?: Observable<unknown>;
} = {}) {
  return {
    getForm:                 vi.fn(),
    submitResponse:          vi.fn(),
    getCandidateChecklist:   vi.fn().mockReturnValue(overrides.getCandidateChecklistImpl ?? of(mockChecklist)),
    getCandidateForm:        vi.fn().mockReturnValue(overrides.getCandidateFormImpl ?? of(mockCandidateForm)),
    submitCandidateResponse: vi.fn(),
  };
}

async function createPage(token: string | null, svc = buildSvc()) {
  await TestBed.configureTestingModule({
    imports:   [CandidateFormPageComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: PublicResponseService,  useValue: svc },
      { provide: ConditionEngineService, useValue: { isVisible: vi.fn().mockReturnValue(true) } },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => token } } } },
    ],
  }).compileComponents();

  const component = TestBed.createComponent(CandidateFormPageComponent).componentInstance;
  return { component, svc };
}

describe('CandidateFormPageComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('ngOnInit', () => {
    it('sets view to checklist and stores the checklist on success', async () => {
      const { component } = await createPage('cand-token-1');
      component.ngOnInit();
      expect(component['view']()).toBe('checklist');
      expect(component['checklist']()).toEqual(mockChecklist);
    });

    it('keeps allCompleted:true from the initial fetch inside the checklist view', async () => {
      const allDone: CandidateChecklist = { ...mockChecklist, allCompleted: true };
      const { component } = await createPage('cand-token-1', buildSvc({ getCandidateChecklistImpl: of(allDone) }));
      component.ngOnInit();
      expect(component['view']()).toBe('checklist');
      expect(component['checklist']()!.allCompleted).toBe(true);
    });

    it('sets view to not_found on 404', async () => {
      const { component } = await createPage('bad-token', buildSvc({ getCandidateChecklistImpl: throwError(() => ({ status: 404 })) }));
      component.ngOnInit();
      expect(component['view']()).toBe('not_found');
    });

    it('sets view to closed on other errors', async () => {
      const { component } = await createPage('cand-token-1', buildSvc({ getCandidateChecklistImpl: throwError(() => ({ status: 409 })) }));
      component.ngOnInit();
      expect(component['view']()).toBe('closed');
    });

    it('sets view to not_found when token param is missing, without calling the service', async () => {
      const { component, svc } = await createPage(null);
      component.ngOnInit();
      expect(component['view']()).toBe('not_found');
      expect(svc.getCandidateChecklist).not.toHaveBeenCalled();
    });
  });

  describe('selectForm', () => {
    it('fetches the form and moves to form_ready for a pending item', async () => {
      const { component, svc } = await createPage('cand-token-1');
      component.ngOnInit();

      component['selectForm'](mockChecklist.forms[0]);

      expect(svc.getCandidateForm).toHaveBeenCalledWith('cand-token-1', 'form-123');
      expect(component['pendingFormId']()).toBeNull();
      expect(component['view']()).toBe('form_ready');
      expect(component['form']()?.formId).toBe('form-123');
    });

    it('marks the item completed and moves to form_already_done when the fetch reveals staleness', async () => {
      const { component } = await createPage(
        'cand-token-1',
        buildSvc({ getCandidateFormImpl: of({ ...mockCandidateForm, alreadyResponded: true }) }),
      );
      component.ngOnInit();

      component['selectForm'](mockChecklist.forms[0]);

      expect(component['view']()).toBe('form_already_done');
      expect(component['checklist']()!.forms.find((formItem) => formItem.formId === 'form-123')?.completed).toBe(true);
    });

    it('goes straight to form_already_done for a completed item, without calling the service', async () => {
      const { component, svc } = await createPage('cand-token-1');
      component.ngOnInit();

      component['selectForm'](mockChecklist.forms[1]);

      expect(svc.getCandidateForm).not.toHaveBeenCalled();
      expect(component['view']()).toBe('form_already_done');
      expect(component['selectedFormName']()).toBe('Test psicotécnico');
    });

    it('ignores a second selection while one is already pending', async () => {
      const { component, svc } = await createPage('cand-token-1', buildSvc({ getCandidateFormImpl: new Observable() }));
      component.ngOnInit();

      component['selectForm'](mockChecklist.forms[0]);
      component['selectForm'](mockChecklist.forms[0]);

      expect(svc.getCandidateForm).toHaveBeenCalledTimes(1);
    });

    it('sets view to not_found/closed on fetch error', async () => {
      const { component } = await createPage('cand-token-1', buildSvc({ getCandidateFormImpl: throwError(() => ({ status: 404 })) }));
      component.ngOnInit();

      component['selectForm'](mockChecklist.forms[0]);

      expect(component['view']()).toBe('not_found');
      expect(component['pendingFormId']()).toBeNull();
    });
  });

  describe('doSubmit', () => {
    it('calls submitCandidateResponse with the token and the currently selected formId', async () => {
      const { component, svc } = await createPage('cand-token-1');
      component.ngOnInit();
      component['selectForm'](mockChecklist.forms[0]);

      const payload = { answers: [], startedAt: null };
      component.doSubmit(payload);

      expect(svc.submitCandidateResponse).toHaveBeenCalledWith('cand-token-1', 'form-123', payload);
    });
  });

  describe('onBackToChecklist', () => {
    it('marks the just-filled form completed, clears selection, and returns to checklist', async () => {
      const { component } = await createPage('cand-token-1');
      component.ngOnInit();
      component['selectForm'](mockChecklist.forms[0]);

      component['onBackToChecklist']();

      expect(component['view']()).toBe('checklist');
      expect(component['selectedFormId']()).toBeNull();
      expect(component['form']()).toBeNull();
      expect(component['checklist']()!.forms.every((formItem) => formItem.completed)).toBe(true);
      expect(component['checklist']()!.allCompleted).toBe(true);
    });

    it('is idempotent when returning from form_already_done', async () => {
      const { component } = await createPage('cand-token-1');
      component.ngOnInit();
      component['selectForm'](mockChecklist.forms[1]);

      component['onBackToChecklist']();

      expect(component['view']()).toBe('checklist');
      expect(component['checklist']()!.forms.find((formItem) => formItem.formId === 'form-456')?.completed).toBe(true);
    });
  });
});
