import { IconName } from '../../../shared/icons/icon.registry';
import { QuestionType } from '../models/form.model';

export interface FieldTypeEntry {
  type: QuestionType;
  labelKey: string;
  icon: IconName;
}

export interface FieldTypeGroup {
  labelKey: string;
  types: FieldTypeEntry[];
}

export const FIELD_TYPE_GROUPS: FieldTypeGroup[] = [
  {
    labelKey: 'builder.group.text',
    types: [
      { type: 'text', labelKey: 'builder.type.text', icon: 'type' },
    ],
  },
  {
    labelKey: 'builder.group.selection',
    types: [
      { type: 'single',   labelKey: 'builder.type.single',   icon: 'list' },
      { type: 'multiple', labelKey: 'builder.type.multiple', icon: 'check-square' },
    ],
  },
  {
    labelKey: 'builder.group.scales',
    types: [
      { type: 'scale', labelKey: 'builder.type.scale', icon: 'sliders' },
      { type: 'nps',   labelKey: 'builder.type.nps',   icon: 'bar-chart-2' },
    ],
  },
  {
    labelKey: 'builder.group.advanced',
    types: [
      { type: 'date',   labelKey: 'builder.type.date',   icon: 'calendar' },
      { type: 'file',   labelKey: 'builder.type.file',   icon: 'paperclip' },
      { type: 'matrix', labelKey: 'builder.type.matrix', icon: 'grid' },
    ],
  },
];
