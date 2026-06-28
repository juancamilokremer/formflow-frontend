import { Component, computed, input, output, signal } from '@angular/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-single-answer',
  templateUrl: './single-answer.component.html',
  styleUrl: './single-answer.component.scss',
})
export class SingleAnswerComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected readonly options = computed<QuestionOption[]>(
    () => (this.question().config['options'] as QuestionOption[]) ?? [],
  );

  protected readonly selected = signal<string>('');

  protected select(label: string): void {
    this.selected.set(label);
    this.answered.emit(label);
  }
}
