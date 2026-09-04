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

  describe('nextStep — untimed (group) blocks', () => {
    const twoSections: Partial<PublicForm> = {
      sections: [
        { id: 's1', title: 'S1', description: null, position: 1, questions: [mockQuestion] },
        { id: 's2', title: 'S2', description: null, position: 2, questions: [] },
      ],
    };

    it('blocks advance when required question unanswered', async () => {
      const { component } = await createFiller({ formOverride: twoSections });
      component['nextStep']();
      expect(component['currentSectionIndex']()).toBe(0);
      expect(component['invalidIds']().has('q1')).toBe(true);
    });

    it('advances when required question is answered', async () => {
      const { component } = await createFiller({ formOverride: twoSections });
      component['onAnswered']('q1', 'nombre');
      component['nextStep']();
      expect(component['currentSectionIndex']()).toBe(1);
      expect(component['currentBlockIndex']()).toBe(0);
    });
  });

  describe('blocks — partitioning timed vs. untimed questions', () => {
    const untimedA:  FormQuestion = { ...mockQuestion, id: 'a', required: false };
    const timedB:     FormQuestion = { ...mockQuestion, id: 'b', required: false, timeLimitSeconds: 10 };
    const untimedC:  FormQuestion = { ...mockQuestion, id: 'c', required: false };
    const timedD:     FormQuestion = { ...mockQuestion, id: 'd', required: false, timeLimitSeconds: 20 };
    const mixedSection: Partial<PublicForm> = {
      sections: [
        { id: 's1', title: 'S1', description: null, position: 1, questions: [untimedA, timedB, untimedC, timedD] },
      ],
    };

    it('groups consecutive untimed questions and isolates each timed one, in position order', async () => {
      const { component } = await createFiller({ formOverride: mixedSection });
      const blocks = component['blocks']();
      expect(blocks).toEqual([
        { kind: 'group', questions: [untimedA] },
        { kind: 'timed', question: timedB },
        { kind: 'group', questions: [untimedC] },
        { kind: 'timed', question: timedD },
      ]);
    });

    it('a form with no timed questions produces a single group block', async () => {
      const { component } = await createFiller();
      expect(component['blocks']()).toEqual([{ kind: 'group', questions: [mockQuestion] }]);
    });

    it('currentBlockQuestions reflects only the current block', async () => {
      const { component } = await createFiller({ formOverride: mixedSection });
      expect(component['currentBlockQuestions']()).toEqual([untimedA]);
      component['currentBlockIndex'].set(1);
      expect(component['currentBlockQuestions']()).toEqual([timedB]);
    });
  });

  describe('timed blocks — manual advance', () => {
    const requiredTimed: FormQuestion = { ...mockQuestion, id: 'q1', required: true, timeLimitSeconds: 10 };
    const timedOnly: Partial<PublicForm> = {
      sections: [{ id: 's1', title: 'S1', description: null, position: 1, questions: [requiredTimed] }],
    };

    it('nextStep blocks advance on an unanswered required timed question', async () => {
      const { component } = await createFiller({ formOverride: timedOnly });
      component['nextStep']();
      expect(component['currentBlockIndex']()).toBe(0);
      expect(component['invalidIds']().has('q1')).toBe(true);
      expect(component['completedTimedBlocks']().has('q1')).toBe(false);
    });

    it('nextStep advances and marks the block as manually completed once answered', async () => {
      const { component } = await createFiller({ formOverride: timedOnly });
      component['onAnswered']('q1', 'resp');
      component['nextStep']();
      expect(component['completedTimedBlocks']().get('q1')).toBe('manual');
    });

    it('answering the question alone does not advance the block', async () => {
      const { component } = await createFiller({ formOverride: timedOnly });
      component['onAnswered']('q1', 'resp');
      expect(component['completedTimedBlocks']().has('q1')).toBe(false);
    });
  });

  describe('onTimedBlockExpired', () => {
    const requiredTimed: FormQuestion = { ...mockQuestion, id: 'q1', required: true, timeLimitSeconds: 10 };
    const untimedNext:    FormQuestion = { ...mockQuestion, id: 'q2', required: false, timeLimitSeconds: null };
    const twoBlockSection: Partial<PublicForm> = {
      sections: [{ id: 's1', title: 'S1', description: null, position: 1, questions: [requiredTimed, untimedNext] }],
    };

    it('force-advances past a required, unanswered timed question, ignoring validation', async () => {
      const { component } = await createFiller({ formOverride: twoBlockSection });
      component['onTimedBlockExpired'](requiredTimed);
      expect(component['completedTimedBlocks']().get('q1')).toBe('timeout');
      expect(component['currentBlockIndex']()).toBe(1);
      expect(component['invalidIds']().has('q1')).toBe(false);
    });

    it('leaves the answer null when the candidate never responded', async () => {
      const { component } = await createFiller({ formOverride: twoBlockSection });
      component['onTimedBlockExpired'](requiredTimed);
      expect(component['answers']().has('q1')).toBe(false);
    });
  });

  describe('prevStep — skipping completed timed blocks', () => {
    const untimedA:  FormQuestion = { ...mockQuestion, id: 'a', required: false, timeLimitSeconds: null };
    const timedB:     FormQuestion = { ...mockQuestion, id: 'b', required: false, timeLimitSeconds: 10 };
    const untimedC:  FormQuestion = { ...mockQuestion, id: 'c', required: false, timeLimitSeconds: null };
    const threeBlocks: Partial<PublicForm> = {
      sections: [{ id: 's1', title: 'S1', description: null, position: 1, questions: [untimedA, timedB, untimedC] }],
    };

    it('is disabled while sitting on a still-running timed block', async () => {
      const { component } = await createFiller({ formOverride: threeBlocks });
      component['currentBlockIndex'].set(1);
      expect(component['canGoBack']()).toBe(false);
      component['prevStep']();
      expect(component['currentBlockIndex']()).toBe(1);
    });

    it('skips back over an already-completed timed block to the previous group', async () => {
      const { component } = await createFiller({ formOverride: threeBlocks });
      component['currentBlockIndex'].set(2);
      component['onTimedBlockExpired'](timedB);
      component['currentBlockIndex'].set(2);
      component['prevStep']();
      expect(component['currentBlockIndex']()).toBe(0);
    });
  });

  describe('submit gating on the last block', () => {
    const requiredTimed: FormQuestion = { ...mockQuestion, id: 'q1', required: true, timeLimitSeconds: 10 };
    const timedOnly: Partial<PublicForm> = {
      sections: [{ id: 's1', title: 'S1', description: null, position: 1, questions: [requiredTimed] }],
    };

    it('isCurrentBlockResolved is false while a timed last block is still running', async () => {
      const { component } = await createFiller({ formOverride: timedOnly });
      expect(component['isCurrentBlockResolved']()).toBe(false);
    });

    it('submit succeeds once the required timed last block has timed out with no answer', async () => {
      const { component, submitFn } = await createFiller({ formOverride: timedOnly });
      component['onTimedBlockExpired'](requiredTimed);
      expect(component['isCurrentBlockResolved']()).toBe(true);
      component['submit']();
      expect(submitFn).toHaveBeenCalled();
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
