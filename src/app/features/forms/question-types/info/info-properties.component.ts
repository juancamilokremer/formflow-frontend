import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BasePropertiesComponent } from '../base-properties.component';
import { QuestionBaseFieldsComponent } from '../shared/question-base-fields/question-base-fields.component';

@Component({
  selector: 'app-info-properties',
  imports: [TranslatePipe, QuestionBaseFieldsComponent],
  templateUrl: './info-properties.component.html',
  styleUrl: './info-properties.component.scss',
})
export class InfoPropertiesComponent extends BasePropertiesComponent {
  // Unlike the other types, an info block may have no title at all, so an empty value is
  // a legitimate change rather than something to ignore.
  protected override onTitleChange(title: string): void {
    if (title !== this.question().title) this.changed.emit({ title });
  }

  protected onContentBlur(event: FocusEvent): void {
    const content = (event.target as HTMLTextAreaElement).value;
    if (content !== (this.question().config['content'] ?? '')) {
      this.changed.emit({ config: { ...this.question().config, content } });
    }
  }
}
