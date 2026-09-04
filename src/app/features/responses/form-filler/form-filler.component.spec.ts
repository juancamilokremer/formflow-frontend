import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { FormFillerComponent } from './form-filler.component';
import { ConditionEngineService } from '../../forms/services/condition-engine.service';
import { PublicForm, SubmitPublicResponseResult } from '../models/public-form.model';
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
  timeLimitSeconds: null,
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

const mockSubmitResult: SubmitPublicResponseResult = { respondentToken: 'tok-abc' };

async function createFiller(options: {
  formOverride?: Partial<PublicForm>;
  submitResult?: Observable<unknown>;
  candidateName?: string | null;
  convocatoriaName?: string | null;
} = {}) {
  const submitFn = vi.fn().mockReturnValue(options.submitResult ?? of(mockSubmitResult));

  await TestBed.configureTestingModule({
    imports:   [FormFillerComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConditionEngineService, useValue: { isVisible: vi.fn().mockReturnValue(true) } },
    ],
  }).compileComponents();

  const fixture   = TestBed.createComponent(FormFillerComponent);
  const component = fixture.componentInstance;

  fixture.componentRef.setInput('form', { ...mockForm, ...options.formOverride });
  fixture.componentRef.setInput('submitFn', submitFn);
  if (options.candidateName !== undefined) fixture.componentRef.setInput('candidateName', options.candidateName);
  if (options.convocatoriaName !== undefined) fixture.componentRef.setInput('convocatoriaName', options.convocatoriaName);

  return { fixture, component, submitFn };
}

describe('FormFillerComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('initial state', () => {
    it('starts in form view', async () => {
      const { component } = await createFiller();
      expect(component['view']()).toBe('form');
    });

    it('exposes form sections as computed', async () => {
      const { component } = await createFiller();
      expect(component['sections']().length).toBe(1);
    });
  });

  describe('onAnswered', () => {
    it('stores answer in map', async () => {
      const { component } = await createFiller();
      component['onAnswered']('q1', 'respuesta');
      expect(component['answers']().get('q1')).toBe('respuesta');
    });

    it('clears invalid flag after answering', async () => {
      const { component } = await createFiller();
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

    it('blocks advance when required question unanswered', async () => {
      const { component } = await createFiller({ formOverride: twoSections });
      component['nextSection']();
      expect(component['currentSectionIndex']()).toBe(0);
      expect(component['invalidIds']().has('q1')).toBe(true);
    });

    it('advances when required question is answered', async () => {
      const { component } = await createFiller({ formOverride: twoSections });
      component['onAnswered']('q1', 'nombre');
      component['nextSection']();
      expect(component['currentSectionIndex']()).toBe(1);
    });
  });

  describe('submit', () => {
    it('calls submitFn with answers and sets view to confirmation', async () => {
      const { component, submitFn } = await createFiller();
      component['onAnswered']('q1', 'respuesta');
      component['submit']();
      expect(submitFn).toHaveBeenCalledWith(
        expect.objectContaining({ answers: [{ questionId: 'q1', value: 'respuesta' }] }),
      );
      expect(component['view']()).toBe('confirmation');
    });

    it('sets submitError on failure and keeps form view', async () => {
      const { component } = await createFiller({
        submitResult: throwError(() => new Error('fail')),
      });
      component['onAnswered']('q1', 'resp');
      component['submit']();
      expect(component['view']()).toBe('form');
      expect(component['submitError']()).toBe(true);
    });

    it('blocks submit when required question unanswered', async () => {
      const { component, submitFn } = await createFiller();
      component['submit']();
      expect(submitFn).not.toHaveBeenCalled();
      expect(component['invalidIds']().has('q1')).toBe(true);
    });

    it('payload contains startedAt', async () => {
      const { component, submitFn } = await createFiller();
      component['onAnswered']('q1', 'resp');
      component['submit']();
      const payload = submitFn.mock.calls[0][0];
      expect(payload.startedAt).toBeTruthy();
    });
  });

  describe('computed state', () => {
    it('progress is 0 when no answers', async () => {
      const { component } = await createFiller();
      expect(component['progress']()).toBe(0);
    });

    it('progress is 100 when all answered', async () => {
      const { component } = await createFiller();
      component['onAnswered']('q1', 'algo');
      expect(component['progress']()).toBe(100);
    });

    it('isLastSection is true for single-section form', async () => {
      const { component } = await createFiller();
      expect(component['isLastSection']()).toBe(true);
    });

    it('isFirstSection is true at index 0', async () => {
      const { component } = await createFiller();
      expect(component['isFirstSection']()).toBe(true);
    });

    it('candidateName input is null by default', async () => {
      const { component } = await createFiller();
      expect(component['candidateName']()).toBeNull();
    });

    it('candidateName input is exposed when provided', async () => {
      const { component } = await createFiller({ candidateName: 'María' });
      expect(component['candidateName']()).toBe('María');
    });

    it('showBackToChecklist input is false by default', async () => {
      const { component } = await createFiller();
      expect(component['showBackToChecklist']()).toBe(false);
    });
  });

  describe('backToChecklist output', () => {
    it('can be emitted independently of submit (candidate flow re-entry point)', async () => {
      const { component } = await createFiller();
      let emitted = false;
      component.backToChecklist.subscribe(() => (emitted = true));

      component.backToChecklist.emit();

      expect(emitted).toBe(true);
    });
  });
});
