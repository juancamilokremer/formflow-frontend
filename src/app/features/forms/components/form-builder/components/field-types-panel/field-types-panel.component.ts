import { Component, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { QuestionType } from '../../../../models/form.model';
import { FIELD_TYPE_GROUPS } from '../../../../question-types/field-type-definitions';

@Component({
  selector: 'app-field-types-panel',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './field-types-panel.component.html',
  styleUrl: './field-types-panel.component.scss',
})
export class FieldTypesPanelComponent {
  readonly typeSelected = output<QuestionType>();

  protected readonly groups = FIELD_TYPE_GROUPS;
}
