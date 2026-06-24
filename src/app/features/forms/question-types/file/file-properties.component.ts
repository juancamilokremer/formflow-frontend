import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, FormType } from '../../models/form.model';
import { PropertiesQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-file-properties',
  imports: [TranslatePipe],
  templateUrl: './file-properties.component.html',
  styleUrl: './file-properties.component.scss',
})
export class FilePropertiesComponent implements PropertiesQuestionComponent {
  readonly question  = input.required<FormQuestion>();
  readonly changed   = output<Partial<FormQuestion>>();
  readonly formType  = input<FormType | undefined>(undefined);

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
}
