import { IconName } from '../../../shared/icons/icon.registry';
import { QuestionType } from '../models/form.model';

export interface FieldTypeEntry {
  type: QuestionType;
  labelKey: string;
  descriptionKey: string;
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
      { type: 'text', labelKey: 'builder.type.text', descriptionKey: 'builder.type_desc.text', icon: 'type' },
      { type: 'info', labelKey: 'builder.type.info', descriptionKey: 'builder.type_desc.info', icon: 'info' },
    ],
  },
  {
    labelKey: 'builder.group.selection',
    types: [
      { type: 'single',   labelKey: 'builder.type.single',   descriptionKey: 'builder.type_desc.single',   icon: 'list' },
      { type: 'multiple', labelKey: 'builder.type.multiple', descriptionKey: 'builder.type_desc.multiple', icon: 'check-square' },
    ],
  },
  {
    labelKey: 'builder.group.scales',
    types: [
      { type: 'scale', labelKey: 'builder.type.scale', descriptionKey: 'builder.type_desc.scale', icon: 'sliders' },
      { type: 'nps',   labelKey: 'builder.type.nps',   descriptionKey: 'builder.type_desc.nps',   icon: 'bar-chart-2' },
    ],
  },
  {
    labelKey: 'builder.group.advanced',
    types: [
      { type: 'date',   labelKey: 'builder.type.date',   descriptionKey: 'builder.type_desc.date',   icon: 'calendar' },
      { type: 'file',   labelKey: 'builder.type.file',   descriptionKey: 'builder.type_desc.file',   icon: 'paperclip' },
      { type: 'matrix', labelKey: 'builder.type.matrix', descriptionKey: 'builder.type_desc.matrix', icon: 'grid' },
    ],
  },
];
