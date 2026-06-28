import { Component, computed, input, output, signal } from '@angular/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-matrix-answer',
  templateUrl: './matrix-answer.component.html',
  styleUrl: './matrix-answer.component.scss',
})
export class MatrixAnswerComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected readonly rows = computed<QuestionOption[]>(
    () => (this.question().config['rows'] as QuestionOption[]) ?? [],
  );

  protected readonly columns = computed<QuestionOption[]>(
    () => (this.question().config['columns'] as QuestionOption[]) ?? [],
  );

  protected readonly selections = signal<Record<string, string>>({});

  protected select(rowId: string, columnLabel: string): void {
    const next = { ...this.selections(), [rowId]: columnLabel };
    this.selections.set(next);
    this.answered.emit(next);
  }

  protected isSelected(rowId: string, columnLabel: string): boolean {
    return this.selections()[rowId] === columnLabel;
  }
}
