import { Component, computed, input, output } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-text-answer',
  imports: [],
  templateUrl: './text-answer.component.html',
  styleUrl: './text-answer.component.scss',
})
export class TextAnswerComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected readonly placeholder = computed<string>(
    () => (this.question().config['placeholder'] as string) ?? '',
  );

  protected onInput(event: Event): void {
    this.answered.emit((event.target as HTMLTextAreaElement).value);
  }
}
