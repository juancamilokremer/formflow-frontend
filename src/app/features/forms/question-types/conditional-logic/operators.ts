import { ConditionOperator, QuestionType } from '../../models/form.model';

export const OPERATORS_BY_TYPE: Partial<Record<QuestionType, ConditionOperator[]>> = {
  text:     ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
  single:   ['EQUALS', 'NOT_EQUALS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
  multiple: ['CONTAINS', 'NOT_CONTAINS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
  scale:    ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN'],
  nps:      ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN'],
  date:     ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN'],
  file:     ['IS_EMPTY', 'IS_NOT_EMPTY'],
  matrix:   ['IS_EMPTY', 'IS_NOT_EMPTY'],
  info:     [],
};

export const OPERATOR_LABEL_KEYS: Record<ConditionOperator, string> = {
  EQUALS:        'logic.op.equals',
  NOT_EQUALS:    'logic.op.not_equals',
  CONTAINS:      'logic.op.contains',
  NOT_CONTAINS:  'logic.op.not_contains',
  GREATER_THAN:  'logic.op.greater_than',
  LESS_THAN:     'logic.op.less_than',
  IS_EMPTY:      'logic.op.is_empty',
  IS_NOT_EMPTY:  'logic.op.is_not_empty',
};

export function operatorNeedsValue(op: ConditionOperator): boolean {
  return op !== 'IS_EMPTY' && op !== 'IS_NOT_EMPTY';
}
