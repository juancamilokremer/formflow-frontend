import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { PropertiesQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-nps-properties',
  imports: [TranslatePipe],
  templateUrl: './nps-properties.component.html',
  styleUrl: './nps-properties.component.scss',
})
export class NpsPropertiesComponent implements PropertiesQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly changed  = output<Partial<FormQuestion>>();

  protected onTitleBlur(event: FocusEvent): void {
    const title = (event.target as HTMLInputElement).value.trim();
    if (title && title !== this.question().title) this.changed.emit({ title });
  }

  protected onRequiredChange(event: Event): void {
    this.changed.emit({ required: (event.target as HTMLInputElement).checked });
  }

  protected onDescriptionBlur(event: FocusEvent): void {
    const description = (event.target as HTMLTextAreaElement).value.trim() || null;
    if (description !== this.question().description) this.changed.emit({ description });
  }

  protected onMinLabelBlur(event: FocusEvent): void {
    const minLabel = (event.target as HTMLInputElement).value.trim();
    this.changed.emit({ config: { ...this.question().config, minLabel } });
  }

  protected onMaxLabelBlur(event: FocusEvent): void {
    const maxLabel = (event.target as HTMLInputElement).value.trim();
    this.changed.emit({ config: { ...this.question().config, maxLabel } });
  }
}
