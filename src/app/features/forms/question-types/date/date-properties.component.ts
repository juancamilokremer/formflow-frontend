import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BasePropertiesComponent } from '../base-properties.component';

@Component({
  selector: 'app-date-properties',
  imports: [TranslatePipe],
  templateUrl: './date-properties.component.html',
  styleUrl: './date-properties.component.scss',
})
export class DatePropertiesComponent extends BasePropertiesComponent {}
