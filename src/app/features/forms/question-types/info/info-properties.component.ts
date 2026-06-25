import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BasePropertiesComponent } from '../base-properties.component';

@Component({
  selector: 'app-info-properties',
  imports: [TranslatePipe],
  templateUrl: './info-properties.component.html',
  styleUrl: './info-properties.component.scss',
})
export class InfoPropertiesComponent extends BasePropertiesComponent {
  protected override onTitleBlur(event: FocusEvent): void {
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
