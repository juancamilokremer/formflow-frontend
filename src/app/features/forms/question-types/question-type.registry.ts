import { Type } from '@angular/core';
import { IconName } from '../../../shared/icons/icon.registry';
import { QuestionType } from '../models/form.model';
import {
  CanvasQuestionComponent,
  PublicQuestionComponent,
  PropertiesQuestionComponent,
} from './question-type.interfaces';

import { QuestionPublicStubComponent } from './shared/question-public-stub.component';

import { TextCanvasComponent }      from './text/text-canvas.component';
import { TextPropertiesComponent }  from './text/text-properties.component';

import { SingleCanvasComponent }      from './single/single-canvas.component';
import { SinglePropertiesComponent }  from './single/single-properties.component';

import { MultipleCanvasComponent }      from './multiple/multiple-canvas.component';
import { MultiplePropertiesComponent }  from './multiple/multiple-properties.component';

import { ScaleCanvasComponent }      from './scale/scale-canvas.component';
import { ScalePropertiesComponent }  from './scale/scale-properties.component';

import { DateCanvasComponent }      from './date/date-canvas.component';
import { DatePropertiesComponent }  from './date/date-properties.component';

import { FileCanvasComponent }      from './file/file-canvas.component';
import { FilePropertiesComponent }  from './file/file-properties.component';

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
  {
    type: 'text',
    labelKey: 'builder.type.text',
    icon: 'type',
    groupKey: 'builder.group.text',
    canvasComponent:     TextCanvasComponent,
    publicComponent:     QuestionPublicStubComponent,
    propertiesComponent: TextPropertiesComponent,
    defaultConfig: () => ({ placeholder: '' }),
  },
  {
    type: 'single',
    labelKey: 'builder.type.single',
    icon: 'list',
    groupKey: 'builder.group.selection',
    canvasComponent:     SingleCanvasComponent,
    publicComponent:     QuestionPublicStubComponent,
    propertiesComponent: SinglePropertiesComponent,
    defaultConfig: () => ({ options: [], scoringType: 'none' }),
  },
  {
    type: 'multiple',
    labelKey: 'builder.type.multiple',
    icon: 'check-square',
    groupKey: 'builder.group.selection',
    canvasComponent:     MultipleCanvasComponent,
    publicComponent:     QuestionPublicStubComponent,
    propertiesComponent: MultiplePropertiesComponent,
    defaultConfig: () => ({ options: [], scoringType: 'none' }),
  },
  {
    type: 'scale',
    labelKey: 'builder.type.scale',
    icon: 'sliders',
    groupKey: 'builder.group.scales',
    canvasComponent:     ScaleCanvasComponent,
    publicComponent:     QuestionPublicStubComponent,
    propertiesComponent: ScalePropertiesComponent,
    defaultConfig: () => ({ min: 1, max: 5, minLabel: '', maxLabel: '', scoringType: 'none' }),
  },
  {
    type: 'date',
    labelKey: 'builder.type.date',
    icon: 'calendar',
    groupKey: 'builder.group.advanced',
    canvasComponent:     DateCanvasComponent,
    publicComponent:     QuestionPublicStubComponent,
    propertiesComponent: DatePropertiesComponent,
    defaultConfig: () => ({}),
  },
  {
    type: 'file',
    labelKey: 'builder.type.file',
    icon: 'paperclip',
    groupKey: 'builder.group.advanced',
    canvasComponent:     FileCanvasComponent,
    publicComponent:     QuestionPublicStubComponent,
    propertiesComponent: FilePropertiesComponent,
    defaultConfig: () => ({}),
  },
];

export function getQuestionTypeDef(type: QuestionType): QuestionTypeDefinition | undefined {
  return QUESTION_TYPE_REGISTRY.find((d) => d.type === type);
}
