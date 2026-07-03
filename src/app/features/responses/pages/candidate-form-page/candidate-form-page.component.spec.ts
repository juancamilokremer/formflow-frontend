import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { CandidateFormPageComponent } from './candidate-form-page.component';
import { PublicResponseService } from '../../services/public-response.service';
import { ConditionEngineService } from '../../../forms/services/condition-engine.service';
import { PublicCandidateForm, PublicForm } from '../../models/public-form.model';

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

const mockCandidateData: PublicCandidateForm = {
  candidateName:    'María García',
  convocatoriaName: 'Analista RRHH',
  endDate:          null,
  alreadyResponded: false,
  form:             mockForm,
};

function buildSvc(result: Observable<unknown>) {
  return {
    getForm:                 vi.fn(),
    submitResponse:          vi.fn(),
    getCandidateForm:        vi.fn().mockReturnValue(result),
    submitCandidateResponse: vi.fn(),
  };
}

async function createPage(token: string | null, svc = buildSvc(of(mockCandidateData))) {
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

  it('sets view to ready and stores candidate info on success', async () => {
    const { component } = await createPage('cand-token-1');
    component.ngOnInit();
    expect(component['view']()).toBe('ready');
    expect(component['candidateName']()).toBe('María García');
    expect(component['convocatoriaName']()).toBe('Analista RRHH');
    expect(component['form']()?.formId).toBe('form-123');
  });

  it('sets view to already_responded when candidate already responded', async () => {
    const { component } = await createPage(
      'cand-token-1',
      buildSvc(of({ ...mockCandidateData, alreadyResponded: true })),
    );
    component.ngOnInit();
    expect(component['view']()).toBe('already_responded');
    expect(component['convocatoriaName']()).toBe('Analista RRHH');
  });

  it('sets view to not_found on 404', async () => {
    const { component } = await createPage('bad-token', buildSvc(throwError(() => ({ status: 404 }))));
    component.ngOnInit();
    expect(component['view']()).toBe('not_found');
  });

  it('sets view to closed on 409', async () => {
    const { component } = await createPage('cand-token-1', buildSvc(throwError(() => ({ status: 409 }))));
    component.ngOnInit();
    expect(component['view']()).toBe('closed');
  });

  it('sets view to not_found when token param is missing', async () => {
    const { component } = await createPage(null);
    component.ngOnInit();
    expect(component['view']()).toBe('not_found');
  });
});
