import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { AnonymousFormPageComponent } from './anonymous-form-page.component';
import { PublicResponseService } from '../../services/public-response.service';
import { ConditionEngineService } from '../../../forms/services/condition-engine.service';
import { PublicForm } from '../../models/public-form.model';

const mockForm: PublicForm = {
  formId:             'form-123',
  name:               'Encuesta de prueba',
  type:               'REGISTRATION',
  timeLimitSeconds:   null,
  tenantName:         'Acme Corp',
  tenantLogoUrl:      null,
  tenantPrimaryColor: null,
  sections: [],
};

function buildSvc(formResult: Observable<unknown>) {
  return {
    getForm:                 vi.fn().mockReturnValue(formResult),
    submitResponse:          vi.fn(),
    getCandidateForm:        vi.fn(),
    submitCandidateResponse: vi.fn(),
  };
}

async function createPage(formId: string | null, svc = buildSvc(of(mockForm))) {
  await TestBed.configureTestingModule({
    imports:   [AnonymousFormPageComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: PublicResponseService,  useValue: svc },
      { provide: ConditionEngineService, useValue: { isVisible: vi.fn().mockReturnValue(true) } },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => formId } } } },
    ],
  }).compileComponents();

  const component = TestBed.createComponent(AnonymousFormPageComponent).componentInstance;
  return { component, svc };
}

describe('AnonymousFormPageComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('sets view to ready and stores form on success', async () => {
    const { component } = await createPage('form-123');
    component.ngOnInit();
    expect(component['view']()).toBe('ready');
    expect(component['form']()?.name).toBe('Encuesta de prueba');
  });

  it('sets view to not_found on 404', async () => {
    const { component } = await createPage('bad-id', buildSvc(throwError(() => ({ status: 404 }))));
    component.ngOnInit();
    expect(component['view']()).toBe('not_found');
  });

  it('sets view to error on server error', async () => {
    const { component } = await createPage('form-123', buildSvc(throwError(() => ({ status: 500 }))));
    component.ngOnInit();
    expect(component['view']()).toBe('error');
  });

  it('sets view to not_found when formId param is missing', async () => {
    const { component } = await createPage(null);
    component.ngOnInit();
    expect(component['view']()).toBe('not_found');
  });
});
