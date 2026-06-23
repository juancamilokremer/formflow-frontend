import { Type } from '@angular/core';
import { IconName } from '../../../shared/icons/icon.registry';
import { QuestionType } from '../models/form.model';
import {
  CanvasQuestionComponent,
  PublicQuestionComponent,
  PropertiesQuestionComponent,
} from './question-type.interfaces';

export interface QuestionTypeDefinition {
  type:                QuestionType;
  labelKey:            string;
  icon:                IconName;
  groupKey:            string;
  canvasComponent:     Type<CanvasQuestionComponent>;
  publicComponent:     Type<PublicQuestionComponent>;
  propertiesComponent: Type<PropertiesQuestionComponent>;
  defaultConfig:       () => Record<string, unknown>;
}

export const QUESTION_TYPE_REGISTRY: QuestionTypeDefinition[] = [
  // Implementations added in issue #34
];

export function getQuestionTypeDef(type: QuestionType): QuestionTypeDefinition | undefined {
  return QUESTION_TYPE_REGISTRY.find((d) => d.type === type);
}
