import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/icons/icon.component';

@Component({
  selector: 'app-properties-panel',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.scss',
})
export class PropertiesPanelComponent {}
