import { TestBed } from '@angular/core/testing';
import { MultipleAnswerComponent } from './multiple-answer.component';
import { FormQuestion } from '../../models/form.model';

const QUESTION: FormQuestion = {
  id: 'q1', type: 'multiple', title: '¿Qué idiomas hablas?', required: false,
  description: null, position: 0, categoryId: null,
  config: { options: [{ id: 'opt-a', label: 'Español' }, { id: 'opt-b', label: 'Inglés' }] },
};

function buildComponent() {
  TestBed.configureTestingModule({ imports: [MultipleAnswerComponent] });
  const fixture = TestBed.createComponent(MultipleAnswerComponent);
  fixture.componentRef.setInput('question', QUESTION);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('MultipleAnswerComponent', () => {
  describe('toggle', () => {
    it('emits the selected option ids, not their labels', () => {
      const { component } = buildComponent();
      let emitted: unknown;
      component.answered.subscribe((v) => (emitted = v));

      component['toggle']('opt-a');

      expect(emitted).toEqual(['opt-a']);
    });

    it('removes an id when toggled again', () => {
      const { component } = buildComponent();
      component['toggle']('opt-a');

      component['toggle']('opt-a');

      expect(component['isChecked']('opt-a')).toBe(false);
    });

    it('supports multiple selected ids at once', () => {
      const { component } = buildComponent();
      component['toggle']('opt-a');

      component['toggle']('opt-b');

      expect(component['isChecked']('opt-a')).toBe(true);
      expect(component['isChecked']('opt-b')).toBe(true);
    });
  });

  describe('isChecked', () => {
    it('compares against id, not label', () => {
      const { component } = buildComponent();
      component['toggle']('opt-a');

      expect(component['isChecked']('opt-a')).toBe(true);
      expect(component['isChecked']('Español')).toBe(false);
    });
  });
});
