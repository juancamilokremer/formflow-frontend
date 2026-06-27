import { Type } from '@angular/core';
import { IconName } from '../../../shared/icons/icon.registry';
import { QuestionType } from '../models/form.model';
import {
  CanvasQuestionComponent,
  PublicQuestionComponent,
  PropertiesQuestionComponent,
} from './question-type.interfaces';

import { InfoCanvasComponent }      from './info/info-canvas.component';
import { InfoPropertiesComponent }  from './info/info-properties.component';
import { InfoPublicComponent }      from './info/info-public.component';

import { TextCanvasComponent }      from './text/text-canvas.component';
import { TextPropertiesComponent }  from './text/text-properties.component';
import { TextAnswerComponent }      from './text/text-answer.component';

import { NpsCanvasComponent }      from './nps/nps-canvas.component';
import { NpsPropertiesComponent }  from './nps/nps-properties.component';
import { NpsAnswerComponent }      from './nps/nps-answer.component';

import { MatrixCanvasComponent }      from './matrix/matrix-canvas.component';
import { MatrixPropertiesComponent }  from './matrix/matrix-properties.component';
import { MatrixAnswerComponent }      from './matrix/matrix-answer.component';

import { SingleCanvasComponent }      from './single/single-canvas.component';
import { SinglePropertiesComponent }  from './single/single-properties.component';
import { SingleAnswerComponent }      from './single/single-answer.component';

import { MultipleCanvasComponent }      from './multiple/multiple-canvas.component';
import { MultiplePropertiesComponent }  from './multiple/multiple-properties.component';
import { MultipleAnswerComponent }      from './multiple/multiple-answer.component';

import { ScaleCanvasComponent }      from './scale/scale-canvas.component';
import { ScalePropertiesComponent }  from './scale/scale-properties.component';
import { ScaleAnswerComponent }      from './scale/scale-answer.component';

import { DateCanvasComponent }      from './date/date-canvas.component';
import { DatePropertiesComponent }  from './date/date-properties.component';
import { DateAnswerComponent }      from './date/date-answer.component';

import { FileCanvasComponent }      from './file/file-canvas.component';
import { FilePropertiesComponent }  from './file/file-properties.component';
import { FileAnswerComponent }      from './file/file-answer.component';

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
    type: 'info',
    labelKey: 'builder.type.info',
    icon: 'info',
    groupKey: 'builder.group.text',
    canvasComponent:     InfoCanvasComponent,
    publicComponent:     InfoPublicComponent,
    propertiesComponent: InfoPropertiesComponent,
    defaultConfig: () => ({ content: '' }),
  },
  {
    type: 'text',
    labelKey: 'builder.type.text',
    icon: 'type',
    groupKey: 'builder.group.text',
    canvasComponent:     TextCanvasComponent,
    publicComponent:     TextAnswerComponent,
    propertiesComponent: TextPropertiesComponent,
    defaultConfig: () => ({ placeholder: '' }),
  },
  {
    type: 'single',
    labelKey: 'builder.type.single',
    icon: 'list',
    groupKey: 'builder.group.selection',
    canvasComponent:     SingleCanvasComponent,
    publicComponent:     SingleAnswerComponent,
    propertiesComponent: SinglePropertiesComponent,
    defaultConfig: () => ({ options: [], scoringType: 'none' }),
  },
  {
    type: 'multiple',
    labelKey: 'builder.type.multiple',
    icon: 'check-square',
    groupKey: 'builder.group.selection',
    canvasComponent:     MultipleCanvasComponent,
    publicComponent:     MultipleAnswerComponent,
    propertiesComponent: MultiplePropertiesComponent,
    defaultConfig: () => ({ options: [], scoringType: 'none' }),
  },
  {
    type: 'scale',
    labelKey: 'builder.type.scale',
    icon: 'sliders',
    groupKey: 'builder.group.scales',
    canvasComponent:     ScaleCanvasComponent,
    publicComponent:     ScaleAnswerComponent,
    propertiesComponent: ScalePropertiesComponent,
    defaultConfig: () => ({ min: 1, max: 5, minLabel: '', maxLabel: '', scoringType: 'none' }),
  },
  {
    type: 'date',
    labelKey: 'builder.type.date',
    icon: 'calendar',
    groupKey: 'builder.group.advanced',
    canvasComponent:     DateCanvasComponent,
    publicComponent:     DateAnswerComponent,
    propertiesComponent: DatePropertiesComponent,
    defaultConfig: () => ({}),
  },
  {
    type: 'file',
    labelKey: 'builder.type.file',
    icon: 'paperclip',
    groupKey: 'builder.group.advanced',
    canvasComponent:     FileCanvasComponent,
    publicComponent:     FileAnswerComponent,
    propertiesComponent: FilePropertiesComponent,
    defaultConfig: () => ({ maxSizeMb: 5, allowedTypes: ['pdf', 'jpg', 'png'] }),
  },
  {
    type: 'nps',
    labelKey: 'builder.type.nps',
    icon: 'bar-chart-2',
    groupKey: 'builder.group.scales',
    canvasComponent:     NpsCanvasComponent,
    publicComponent:     NpsAnswerComponent,
    propertiesComponent: NpsPropertiesComponent,
    defaultConfig: () => ({ minLabel: '', maxLabel: '' }),
  },
  {
    type: 'matrix',
    labelKey: 'builder.type.matrix',
    icon: 'grid',
    groupKey: 'builder.group.advanced',
    canvasComponent:     MatrixCanvasComponent,
    publicComponent:     MatrixAnswerComponent,
    propertiesComponent: MatrixPropertiesComponent,
    defaultConfig: () => ({ rows: [], columns: [], scoringType: 'none' }),
  },
];

export function getQuestionTypeDef(type: QuestionType): QuestionTypeDefinition | undefined {
  return QUESTION_TYPE_REGISTRY.find((d) => d.type === type);
}
