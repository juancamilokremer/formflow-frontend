import { Component } from '@angular/core';
import { BasePropertiesComponent } from '../base-properties.component';
import { QuestionBaseFieldsComponent } from '../shared/question-base-fields/question-base-fields.component';

@Component({
  selector: 'app-file-properties',
  imports: [QuestionBaseFieldsComponent],
  templateUrl: './file-properties.component.html',
  styleUrl: './file-properties.component.scss',
})
export class FilePropertiesComponent extends BasePropertiesComponent {}
