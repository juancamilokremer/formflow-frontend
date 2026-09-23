import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion } from '../../../models/form.model';
import { TimeLimitFieldComponent } from '../time-limit-field/time-limit-field.component';

/**
 * Title / required / description / time limit block shared by every properties panel.
 * It owns the markup and the DOM parsing, and emits plain values; deciding whether a
 * value is worth persisting stays in BasePropertiesComponent, so panels can still
 * override that rule (InfoPropertiesComponent allows clearing the title).
 */
@Component({
  selector: 'app-question-base-fields',
  imports: [TranslatePipe, TimeLimitFieldComponent],
  templateUrl: './question-base-fields.component.html',
  styleUrl: './question-base-fields.component.scss',
})
export class QuestionBaseFieldsComponent {
  readonly question = input.required<FormQuestion>();
  readonly titlePlaceholder = input<string>('');
  readonly showRequired = input<boolean>(true);
  readonly showDescription = input<boolean>(true);
  readonly showTimeLimit = input<boolean>(true);

  readonly titleChange = output<string>();
  readonly requiredChange = output<boolean>();
  readonly descriptionChange = output<string | null>();
  readonly timeLimitChange = output<number | null>();

  protected onTitleBlur(event: FocusEvent): void {
    this.titleChange.emit((event.target as HTMLInputElement).value.trim());
  }

  protected onRequiredInput(event: Event): void {
    this.requiredChange.emit((event.target as HTMLInputElement).checked);
  }

  protected onDescriptionBlur(event: FocusEvent): void {
    this.descriptionChange.emit((event.target as HTMLTextAreaElement).value.trim() || null);
  }
}
