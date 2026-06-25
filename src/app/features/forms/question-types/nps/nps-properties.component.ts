import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BasePropertiesComponent } from '../base-properties.component';

@Component({
  selector: 'app-nps-properties',
  imports: [TranslatePipe],
  templateUrl: './nps-properties.component.html',
  styleUrl: './nps-properties.component.scss',
})
export class NpsPropertiesComponent extends BasePropertiesComponent {
  protected onMinLabelBlur(event: FocusEvent): void {
    const minLabel = (event.target as HTMLInputElement).value.trim();
    this.changed.emit({ config: { ...this.question().config, minLabel } });
  }

  protected onMaxLabelBlur(event: FocusEvent): void {
    const maxLabel = (event.target as HTMLInputElement).value.trim();
    this.changed.emit({ config: { ...this.question().config, maxLabel } });
  }
}
