import { TestBed } from '@angular/core/testing';
import { SingleAnswerComponent } from './single-answer.component';
import { FormQuestion } from '../../models/form.model';

const QUESTION: FormQuestion = {
  id: 'q1', type: 'single', title: '¿Tienes experiencia?', required: false,
  description: null, position: 0, categoryId: null,
  config: { options: [{ id: 'opt-a', label: 'Sí' }, { id: 'opt-b', label: 'No' }] }, timeLimitSeconds: null,
};

function buildComponent() {
  TestBed.configureTestingModule({ imports: [SingleAnswerComponent] });
  const fixture = TestBed.createComponent(SingleAnswerComponent);
  fixture.componentRef.setInput('question', QUESTION);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('SingleAnswerComponent', () => {
  describe('select', () => {
    it('emits the option id, not its label', () => {
      const { component } = buildComponent();
      let emitted: unknown;
      component.answered.subscribe((v) => (emitted = v));

      component['select']('opt-a');

      expect(emitted).toBe('opt-a');
    });

    it('tracks the selected option by id', () => {
      const { component } = buildComponent();

      component['select']('opt-b');

      expect(component['selected']()).toBe('opt-b');
    });
  });
});
