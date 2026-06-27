import { Component, input, output } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-date-answer',
  templateUrl: './date-answer.component.html',
  styleUrl: './date-answer.component.scss',
})
export class DateAnswerComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected onChange(event: Event): void {
    this.answered.emit((event.target as HTMLInputElement).value);
  }
}
