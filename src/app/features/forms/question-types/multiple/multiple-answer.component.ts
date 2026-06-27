import { Component, computed, input, output, signal } from '@angular/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-multiple-answer',
  templateUrl: './multiple-answer.component.html',
  styleUrl: './multiple-answer.component.scss',
})
export class MultipleAnswerComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected readonly options = computed<QuestionOption[]>(
    () => (this.question().config['options'] as QuestionOption[]) ?? [],
  );

  protected readonly selected = signal<Set<string>>(new Set());

  protected toggle(label: string): void {
    const next = new Set(this.selected());
    if (next.has(label)) { next.delete(label); } else { next.add(label); }
    this.selected.set(next);
    this.answered.emit([...next]);
  }

  protected isChecked(label: string): boolean {
    return this.selected().has(label);
  }
}
