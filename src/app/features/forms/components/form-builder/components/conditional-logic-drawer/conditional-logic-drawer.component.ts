import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import {
  Condition, ConditionOperator, ConditionalLogicConfig,
  FormQuestion, FormSection, LogicOperator, QuestionOption,
} from '../../../../models/form.model';
import {
  OPERATOR_LABEL_KEYS, OPERATORS_BY_TYPE, operatorNeedsValue,
} from '../../../../question-types/conditional-logic/operators';

interface EditableCondition {
  id:         string;
  questionId: string;
  operator:   ConditionOperator | '';
  value:      string;
}

@Component({
  selector: 'app-conditional-logic-drawer',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './conditional-logic-drawer.component.html',
  styleUrl: './conditional-logic-drawer.component.scss',
})
export class ConditionalLogicDrawerComponent {
  private readonly translateSvc = inject(TranslateService);

  readonly question     = input<FormQuestion | null>(null);
  readonly formSections = input<FormSection[]>([]);
  readonly saved        = output<ConditionalLogicConfig | null>();
  readonly closed       = output<void>();

  protected readonly logicOperator = signal<LogicOperator>('AND');
  protected readonly conditions    = signal<EditableCondition[]>([]);

  protected readonly operatorLabelKeys = OPERATOR_LABEL_KEYS;

  protected readonly previousQuestions = computed(() => {
    const q       = this.question();
    const sections = this.formSections();
    if (!q) return [];
    const result: (FormQuestion & { sectionTitle: string })[] = [];
    for (const section of sections) {
      for (const sq of section.questions) {
        if (sq.id === q.id) return result;
        if (sq.type !== 'info') result.push({ ...sq, sectionTitle: section.title });
      }
    }
    return result;
  });

  protected readonly naturalLanguageText = computed(() => {
    const conds = this.conditions();
    const prev  = this.previousQuestions();
    const filled = conds.filter((c) => c.questionId && c.operator);
    if (!filled.length) return '';

    const t = (key: string) => this.translateSvc.instant(key);
    const parts = filled.map((c) => {
      const refQ = prev.find((q) => q.id === c.questionId);
      if (!refQ) return null;
      const opLabel  = t(OPERATOR_LABEL_KEYS[c.operator as ConditionOperator]);
      const needsVal = operatorNeedsValue(c.operator as ConditionOperator);
      const valueStr = needsVal && c.value ? ` "${c.value}"` : '';
      return `"${refQ.title}" ${opLabel}${valueStr}`;
    }).filter((p): p is string => p !== null);

    if (!parts.length) return '';
    const connector = this.logicOperator() === 'AND' ? t('logic.and_connector') : t('logic.or_connector');
    const joined    = parts.length === 1 ? parts[0] : parts.join(` ${connector} `);
    return `${t('logic.preview_show_if')} ${joined}`;
  });

  protected readonly isValid = computed(() => {
    const conds = this.conditions();
    if (!conds.length) return true;
    return conds.every((c) => {
      if (!c.questionId || !c.operator) return false;
      return !operatorNeedsValue(c.operator as ConditionOperator) || !!c.value.trim();
    });
  });

  constructor() {
    effect(() => {
      const config = this.question()?.conditionalLogic;
      if (config?.conditions?.length) {
        this.logicOperator.set(config.logicOperator);
        this.conditions.set(
          config.conditions.map((c: Condition, i: number) => ({
            id:         String(i),
            questionId: c.sourceQuestionId,
            operator:   c.operator,
            value:      c.value ?? '',
          })),
        );
      } else {
        this.logicOperator.set('AND');
        this.conditions.set([]);
      }
    });
  }

  protected getOperatorsForQuestion(questionId: string): ConditionOperator[] {
    const refQ = this.previousQuestions().find((q) => q.id === questionId);
    return refQ ? (OPERATORS_BY_TYPE[refQ.type] ?? []) : [];
  }

  protected getOptionsForQuestion(questionId: string): QuestionOption[] {
    const refQ = this.previousQuestions().find((q) => q.id === questionId);
    return refQ ? ((refQ.config['options'] as QuestionOption[]) ?? []) : [];
  }

  protected getValueInputType(
    questionId: string,
    operator: ConditionOperator | '',
  ): 'text' | 'number' | 'options' | 'none' {
    if (!operator || !operatorNeedsValue(operator as ConditionOperator)) return 'none';
    const refQ = this.previousQuestions().find((q) => q.id === questionId);
    if (!refQ) return 'text';
    if (refQ.type === 'single' || refQ.type === 'multiple') return 'options';
    if (refQ.type === 'scale'  || refQ.type === 'nps')      return 'number';
    return 'text';
  }

  protected addCondition(): void {
    this.conditions.update((c) => [
      ...c,
      { id: Date.now().toString(), questionId: '', operator: '', value: '' },
    ]);
  }

  protected removeCondition(id: string): void {
    this.conditions.update((c) => c.filter((cond) => cond.id !== id));
  }

  protected onQuestionSelected(id: string, questionId: string): void {
    this.conditions.update((c) =>
      c.map((cond) => cond.id === id ? { ...cond, questionId, operator: '', value: '' } : cond),
    );
  }

  protected onOperatorSelected(id: string, operator: ConditionOperator): void {
    this.conditions.update((c) =>
      c.map((cond) => cond.id === id ? { ...cond, operator, value: '' } : cond),
    );
  }

  protected onValueChanged(id: string, value: string): void {
    this.conditions.update((c) =>
      c.map((cond) => cond.id === id ? { ...cond, value } : cond),
    );
  }

  protected onLogicOperatorChange(event: Event): void {
    this.logicOperator.set((event.target as HTMLSelectElement).value as LogicOperator);
  }

  protected onSave(): void {
    const conds = this.conditions();
    if (!conds.length) {
      this.saved.emit(null);
      return;
    }
    this.saved.emit({
      logicOperator: this.logicOperator(),
      conditions: conds.map((c) => ({
        sourceQuestionId: c.questionId,
        operator:         c.operator as ConditionOperator,
        value:            operatorNeedsValue(c.operator as ConditionOperator) ? (c.value || null) : null,
      })),
    });
  }
}
