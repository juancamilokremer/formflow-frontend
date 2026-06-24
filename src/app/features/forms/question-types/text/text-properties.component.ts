import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, FormType } from '../../models/form.model';
import { PropertiesQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-text-properties',
  imports: [TranslatePipe],
  templateUrl: './text-properties.component.html',
  styleUrl: './text-properties.component.scss',
})
export class TextPropertiesComponent implements PropertiesQuestionComponent {
  readonly question  = input.required<FormQuestion>();
  readonly changed   = output<Partial<FormQuestion>>();
  readonly formType  = input<FormType | undefined>(undefined);

  protected onTitleBlur(event: FocusEvent): void {
    const title = (event.target as HTMLInputElement).value.trim();
    if (title && title !== this.question().title) {
      this.changed.emit({ title });
    }
  }

  protected onRequiredChange(event: Event): void {
    const required = (event.target as HTMLInputElement).checked;
    this.changed.emit({ required });
  }

  protected onDescriptionBlur(event: FocusEvent): void {
    const description = (event.target as HTMLTextAreaElement).value.trim() || null;
    if (description !== this.question().description) {
      this.changed.emit({ description });
    }
  }

  protected onPlaceholderBlur(event: FocusEvent): void {
    const placeholder = (event.target as HTMLInputElement).value;
    const current = (this.question().config['placeholder'] as string) ?? '';
    if (placeholder !== current) {
      this.changed.emit({ config: { ...this.question().config, placeholder } });
    }
  }
}
