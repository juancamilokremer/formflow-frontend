import { Component } from '@angular/core';
import { BasePropertiesComponent } from '../base-properties.component';
import { QuestionBaseFieldsComponent } from '../shared/question-base-fields/question-base-fields.component';

@Component({
  selector: 'app-date-properties',
  imports: [QuestionBaseFieldsComponent],
  templateUrl: './date-properties.component.html',
  styleUrl: './date-properties.component.scss',
})
export class DatePropertiesComponent extends BasePropertiesComponent {}
