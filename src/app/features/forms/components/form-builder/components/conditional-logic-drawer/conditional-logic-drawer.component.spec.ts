import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ConditionalLogicDrawerComponent } from './conditional-logic-drawer.component';
import { FormQuestion, FormSection } from '../../../../models/form.model';

const Q_SINGLE: FormQuestion = {
  id: 'q1', type: 'single', title: '¿Tienes experiencia?', required: false,
  description: null, position: 0, categoryId: null,
  config: { options: [{ id: 'o1', label: 'Sí' }, { id: 'o2', label: 'No' }] },
};

const Q_TEXT: FormQuestion = {
  id: 'q2', type: 'text', title: '¿Cuántos años?', required: false,
  description: null, position: 1, categoryId: null, config: {},
};

const Q_TARGET: FormQuestion = {
  id: 'q3', type: 'text', title: 'Detalles', required: false,
  description: null, position: 2, categoryId: null, config: {},
};

const SECTIONS: FormSection[] = [
  { id: 's1', title: 'Sección 1', position: 0, questions: [Q_SINGLE, Q_TEXT, Q_TARGET] },
];

describe('ConditionalLogicDrawerComponent', () => {
  function create(question: FormQuestion, sections = SECTIONS) {
    TestBed.configureTestingModule({
      imports: [ConditionalLogicDrawerComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    const fixture = TestBed.createComponent(ConditionalLogicDrawerComponent);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('formSections', sections);
    return fixture.componentInstance;
  }

  it('previousQuestions returns only questions before current', () => {
    const c = create(Q_TARGET);
    const prev = c['previousQuestions']();
    expect(prev.map((q) => q.id)).toEqual(['q1', 'q2']);
  });

  it('previousQuestions excludes info type', () => {
    const INFO: FormQuestion = {
      id: 'qi', type: 'info', title: 'Info', required: false,
      description: null, position: 0, categoryId: null, config: {},
    };
    const sections: FormSection[] = [
      { id: 's1', title: 'S1', position: 0, questions: [INFO, Q_TARGET] },
    ];
    const c = create(Q_TARGET, sections);
    expect(c['previousQuestions']().length).toBe(0);
  });

  it('isValid returns true when no conditions', () => {
    const c = create(Q_TARGET);
    expect(c['isValid']()).toBe(true);
  });

  it('isValid returns false when condition has no questionId', () => {
    const c = create(Q_TARGET);
    c['conditions'].set([{ id: '1', questionId: '', operator: 'EQUALS', value: 'Sí' }]);
    expect(c['isValid']()).toBe(false);
  });

  it('isValid returns false when condition needs value but value is empty', () => {
    const c = create(Q_TARGET);
    c['conditions'].set([{ id: '1', questionId: 'q1', operator: 'EQUALS', value: '' }]);
    expect(c['isValid']()).toBe(false);
  });

  it('isValid returns true when IS_EMPTY operator (no value needed)', () => {
    const c = create(Q_TARGET);
    c['conditions'].set([{ id: '1', questionId: 'q1', operator: 'IS_EMPTY', value: '' }]);
    expect(c['isValid']()).toBe(true);
  });

  it('getOperatorsForQuestion returns EQUALS for single type', () => {
    const c = create(Q_TARGET);
    const ops = c['getOperatorsForQuestion']('q1');
    expect(ops).toContain('EQUALS');
    expect(ops).toContain('IS_EMPTY');
  });

  it('getValueInputType returns options for single question with EQUALS', () => {
    const c = create(Q_TARGET);
    expect(c['getValueInputType']('q1', 'EQUALS')).toBe('options');
  });

  it('getValueInputType returns none for IS_EMPTY', () => {
    const c = create(Q_TARGET);
    expect(c['getValueInputType']('q1', 'IS_EMPTY')).toBe('none');
  });

  it('naturalLanguageText returns empty when no filled conditions', () => {
    const c = create(Q_TARGET);
    expect(c['naturalLanguageText']()).toBe('');
  });

  it('onSave emits null when conditions are empty', () => {
    const c = create(Q_TARGET);
    const emitted: unknown[] = [];
    c.saved.subscribe((v) => emitted.push(v));
    c['onSave']();
    expect(emitted).toEqual([null]);
  });

  it('onSave emits config when conditions are valid', () => {
    const c = create(Q_TARGET);
    c['conditions'].set([{ id: '1', questionId: 'q1', operator: 'EQUALS', value: 'Sí' }]);
    const emitted: unknown[] = [];
    c.saved.subscribe((v) => emitted.push(v));
    c['onSave']();
    expect(emitted.length).toBe(1);
    const config = emitted[0] as { logicOperator: string; conditions: unknown[] };
    expect(config.logicOperator).toBe('AND');
    expect(config.conditions.length).toBe(1);
  });
});
