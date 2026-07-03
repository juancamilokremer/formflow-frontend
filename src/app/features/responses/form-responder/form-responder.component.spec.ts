import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { FormResponderComponent } from './form-responder.component';
import { PublicResponseService } from '../services/public-response.service';
import { ConditionEngineService } from '../../forms/services/condition-engine.service';
import { PublicForm } from '../models/public-form.model';
import { FormQuestion } from '../../forms/models/form.model';

const mockQuestion: FormQuestion = {
  id:               'q1',
  type:             'text',
  title:            '¿Cómo te llamas?',
  description:      null,
  position:         1,
  required:         true,
  categoryId:       null,
  config:           {},
  conditionalLogic: null,
};

const mockForm: PublicForm = {
  formId:             'form-123',
  name:               'Encuesta de prueba',
  type:               'REGISTRATION',
  timeLimitSeconds:   null,
  tenantName:         'Acme Corp',
  tenantLogoUrl:      null,
  tenantPrimaryColor: null,
  sections: [
    { id: 's1', title: 'Sección 1', description: null, position: 1, questions: [mockQuestion] },
  ],
};

function buildProviders(formId: string | null, formOverride?: Partial<PublicForm>, submitResult = of({ respondentToken: 'tok-abc' })) {
  const publicResponseSvc = {
    getForm:        vi.fn().mockReturnValue(of({ ...mockForm, ...formOverride })),
    submitResponse: vi.fn().mockReturnValue(submitResult),
  };
  const condEngine = { isVisible: vi.fn().mockReturnValue(true) };

  return {
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: PublicResponseService,  useValue: publicResponseSvc },
      { provide: ConditionEngineService, useValue: condEngine },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => formId } } } },
    ],
    publicResponseSvc,
    condEngine,
  };
}

async function createComponent(formId: string | null, formOverride?: Partial<PublicForm>, submitResult = of({ respondentToken: 'tok-abc' })) {
  const { providers, publicResponseSvc, condEngine } = buildProviders(formId, formOverride, submitResult);

  await TestBed.configureTestingModule({
    imports:   [FormResponderComponent],
    providers,
  }).compileComponents();

  const fixture   = TestBed.createComponent(FormResponderComponent);
  const component = fixture.componentInstance;
  return { fixture, component, publicResponseSvc, condEngine };
}

describe('FormResponderComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('ngOnInit', () => {
    it('loads form and sets view to form', async () => {
      const { component } = await createComponent('form-123');
      component.ngOnInit();
      expect(component['view']()).toBe('form');
      expect(component['form']()?.name).toBe('Encuesta de prueba');
    });

    it('sets view to not_found on 404', async () => {
      const svc = {
        getForm:        vi.fn().mockReturnValue(throwError(() => ({ status: 404 }))),
        submitResponse: vi.fn(),
      };
      await TestBed.configureTestingModule({
        imports:   [FormResponderComponent],
        providers: [
          provideTranslateService({ lang: 'es' }),
          { provide: PublicResponseService,  useValue: svc },
          { provide: ConditionEngineService, useValue: { isVisible: vi.fn().mockReturnValue(true) } },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'bad-id' } } } },
        ],
      }).compileComponents();
      const component = TestBed.createComponent(FormResponderComponent).componentInstance;
      component.ngOnInit();
      expect(component['view']()).toBe('not_found');
    });

    it('sets view to not_found when formId is null', async () => {
      const { component } = await createComponent(null);
      component.ngOnInit();
      expect(component['view']()).toBe('not_found');
    });
  });

  describe('onAnswered', () => {
    it('stores answer in map', async () => {
      const { component } = await createComponent('form-123');
      component.ngOnInit();
      component['onAnswered']('q1', 'respuesta');
      expect(component['answers']().get('q1')).toBe('respuesta');
    });

    it('clears invalid flag after answering', async () => {
      const { component } = await createComponent('form-123');
      component.ngOnInit();
      component['invalidIds'].set(new Set(['q1']));
      component['onAnswered']('q1', 'algo');
      expect(component['invalidIds']().has('q1')).toBe(false);
    });
  });

  describe('nextSection', () => {
    const twoSections: Partial<PublicForm> = {
      sections: [
        { id: 's1', title: 'S1', description: null, position: 1, questions: [mockQuestion] },
        { id: 's2', title: 'S2', description: null, position: 2, questions: [] },
      ],
    };

    it('does not advance when required visible question has no answer', async () => {
      const { component } = await createComponent('form-123', twoSections);
      component.ngOnInit();
      component['nextSection']();
      expect(component['currentSectionIndex']()).toBe(0);
      expect(component['invalidIds']().has('q1')).toBe(true);
    });

    it('advances when required question is answered', async () => {
      const { component } = await createComponent('form-123', twoSections);
      component.ngOnInit();
      component['onAnswered']('q1', 'mi nombre');
      component['nextSection']();
      expect(component['currentSectionIndex']()).toBe(1);
    });
  });

  describe('submit', () => {
    it('sets view to confirmation on success', async () => {
      const { component, publicResponseSvc } = await createComponent('form-123');
      component.ngOnInit();
      component['onAnswered']('q1', 'respuesta');
      component['submit']();
      expect(component['view']()).toBe('confirmation');
      expect(publicResponseSvc.submitResponse).toHaveBeenCalledWith(
        'form-123',
        expect.objectContaining({ answers: [{ questionId: 'q1', value: 'respuesta' }] }),
      );
    });

    it('sets submitError on failure', async () => {
      const svc = {
        getForm:        vi.fn().mockReturnValue(of(mockForm)),
        submitResponse: vi.fn().mockReturnValue(throwError(() => new Error('fail'))),
      };
      await TestBed.configureTestingModule({
        imports:   [FormResponderComponent],
        providers: [
          provideTranslateService({ lang: 'es' }),
          { provide: PublicResponseService,  useValue: svc },
          { provide: ConditionEngineService, useValue: { isVisible: vi.fn().mockReturnValue(true) } },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'form-123' } } } },
        ],
      }).compileComponents();
      const component = TestBed.createComponent(FormResponderComponent).componentInstance;
      component.ngOnInit();
      component['onAnswered']('q1', 'resp');
      component['submit']();
      expect(component['view']()).toBe('form');
      expect(component['submitError']()).toBe(true);
    });

    it('does not submit when required question unanswered', async () => {
      const { component, publicResponseSvc } = await createComponent('form-123');
      component.ngOnInit();
      component['submit']();
      expect(publicResponseSvc.submitResponse).not.toHaveBeenCalled();
      expect(component['invalidIds']().has('q1')).toBe(true);
    });
  });

  describe('computed state', () => {
    it('progress is 0 when no answers', async () => {
      const { component } = await createComponent('form-123');
      component.ngOnInit();
      expect(component['progress']()).toBe(0);
    });

    it('progress is 100 when all answered', async () => {
      const { component } = await createComponent('form-123');
      component.ngOnInit();
      component['onAnswered']('q1', 'algo');
      expect(component['progress']()).toBe(100);
    });

    it('isLastSection is true for single-section form', async () => {
      const { component } = await createComponent('form-123');
      component.ngOnInit();
      expect(component['isLastSection']()).toBe(true);
    });
  });
});
