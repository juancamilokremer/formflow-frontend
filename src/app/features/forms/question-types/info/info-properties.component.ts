import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, FormType } from '../../models/form.model';
import { PropertiesQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-info-properties',
  imports: [TranslatePipe],
  templateUrl: './info-properties.component.html',
  styleUrl: './info-properties.component.scss',
})
export class InfoPropertiesComponent implements PropertiesQuestionComponent {
  readonly question  = input.required<FormQuestion>();
  readonly changed   = output<Partial<FormQuestion>>();
  readonly formType  = input<FormType | undefined>(undefined);

  protected onTitleBlur(event: FocusEvent): void {
    const title = (event.target as HTMLInputElement).value.trim();
    if (title !== this.question().title) this.changed.emit({ title });
  }

  protected onContentBlur(event: FocusEvent): void {
    const content = (event.target as HTMLTextAreaElement).value;
    if (content !== (this.question().config['content'] ?? '')) {
      this.changed.emit({ config: { ...this.question().config, content } });
    }
  }
}
