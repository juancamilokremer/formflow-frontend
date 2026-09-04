import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BasePropertiesComponent } from '../base-properties.component';
import { TimeLimitFieldComponent } from '../shared/time-limit-field/time-limit-field.component';

@Component({
  selector: 'app-text-properties',
  imports: [TranslatePipe, TimeLimitFieldComponent],
  templateUrl: './text-properties.component.html',
  styleUrl: './text-properties.component.scss',
})
export class TextPropertiesComponent extends BasePropertiesComponent {
  protected onPlaceholderBlur(event: FocusEvent): void {
    const placeholder = (event.target as HTMLInputElement).value;
    const current = (this.question().config['placeholder'] as string) ?? '';
    if (placeholder !== current) {
      this.changed.emit({ config: { ...this.question().config, placeholder } });
    }
  }
}
