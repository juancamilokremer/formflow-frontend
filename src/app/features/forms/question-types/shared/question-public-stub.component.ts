import { Component, input, output } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

/** Placeholder satisfying PublicQuestionComponent — replaced with real implementations in M3. */
@Component({
  selector: 'app-question-public-stub',
  template: '',
})
export class QuestionPublicStubComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();
}
