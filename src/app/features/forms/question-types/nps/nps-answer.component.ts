import { Component, computed, input, output, signal } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-nps-answer',
  templateUrl: './nps-answer.component.html',
  styleUrl: './nps-answer.component.scss',
})
export class NpsAnswerComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected readonly ticks = Array.from({ length: 11 }, (_, i) => i);

  protected readonly minLabel = computed<string>(
    () => (this.question().config['minLabel'] as string) ?? '',
  );

  protected readonly maxLabel = computed<string>(
    () => (this.question().config['maxLabel'] as string) ?? '',
  );

  protected readonly selected = signal<number | null>(null);

  protected select(value: number): void {
    this.selected.set(value);
    this.answered.emit(value);
  }
}
