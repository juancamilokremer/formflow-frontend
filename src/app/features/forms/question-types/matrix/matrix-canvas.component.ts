import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { CanvasEditService } from '../../services/canvas-edit.service';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-matrix-canvas',
  imports: [TranslatePipe],
  templateUrl: './matrix-canvas.component.html',
  styleUrl: './matrix-canvas.component.scss',
})
export class MatrixCanvasComponent implements CanvasQuestionComponent {
  private readonly canvasEditSvc = inject(CanvasEditService, { optional: true });

  readonly question = input.required<FormQuestion>();
  readonly selected = input<boolean>(false);

  protected readonly rows = computed<QuestionOption[]>(
    () => (this.question().config['rows'] as QuestionOption[]) ?? [],
  );

  protected readonly columns = computed<QuestionOption[]>(
    () => (this.question().config['columns'] as QuestionOption[]) ?? [],
  );

  protected readonly scoringType = computed<string>(
    () => (this.question().config['scoringType'] as string) ?? 'none',
  );

  protected readonly maxScore = computed<number>(() => {
    const maxCol = this.columns().reduce((max, col) => Math.max(max, col.score ?? 0), 0);
    return maxCol * this.rows().length;
  });

  protected onColumnScoreBlur(colId: string, event: FocusEvent): void {
    const score = Number((event.target as HTMLInputElement).value) || 0;
    const updatedCols = this.columns().map((col) => col.id === colId ? { ...col, score } : col);
    this.canvasEditSvc?.emit(this.question().id, {
      config: { ...this.question().config, columns: updatedCols },
    });
  }
}
