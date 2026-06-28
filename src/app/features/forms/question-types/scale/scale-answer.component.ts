import { Component, computed, input, output, signal } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-scale-answer',
  templateUrl: './scale-answer.component.html',
  styleUrl: './scale-answer.component.scss',
})
export class ScaleAnswerComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected readonly ticks = computed<number[]>(() => {
    const cfg = this.question().config;
    const min = (cfg['min'] as number) ?? 1;
    const max = (cfg['max'] as number) ?? 5;
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  });

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
