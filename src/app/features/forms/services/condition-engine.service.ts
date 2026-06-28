import { Injectable } from '@angular/core';
import { Condition, ConditionalLogicConfig, FormQuestion } from '../models/form.model';

@Injectable({ providedIn: 'root' })
export class ConditionEngineService {

  isVisible(question: FormQuestion, answers: Map<string, unknown>): boolean {
    const logic: ConditionalLogicConfig | null | undefined = question.conditionalLogic;
    if (!logic?.conditions?.length) return true;

    const results = logic.conditions.map((c) => this.evaluate(c, answers));
    return logic.logicOperator === 'AND'
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  private evaluate(condition: Condition, answers: Map<string, unknown>): boolean {
    const answer = answers.get(condition.sourceQuestionId);
    const val    = condition.value;

    switch (condition.operator) {
      case 'EQUALS':       return this.toStr(answer) === val;
      case 'NOT_EQUALS':   return this.toStr(answer) !== val;
      case 'CONTAINS':     return this.toArr(answer).includes(val ?? '');
      case 'NOT_CONTAINS': return !this.toArr(answer).includes(val ?? '');
      case 'GREATER_THAN': return Number(answer) > Number(val);
      case 'LESS_THAN':    return Number(answer) < Number(val);
      case 'IS_EMPTY':     return this.isEmpty(answer);
      case 'IS_NOT_EMPTY': return !this.isEmpty(answer);
      default:             return true;
    }
  }

  private toStr(val: unknown): string {
    return val == null ? '' : String(val);
  }

  private toArr(val: unknown): string[] {
    return Array.isArray(val) ? val.map(String) : [];
  }

  private isEmpty(val: unknown): boolean {
    if (val == null) return true;
    if (typeof val === 'string') return val.trim() === '';
    if (Array.isArray(val)) return val.length === 0;
    return false;
  }
}
