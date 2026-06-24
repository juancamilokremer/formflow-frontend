import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { CanvasEditService } from '../../services/canvas-edit.service';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-multiple-canvas',
  imports: [TranslatePipe],
  templateUrl: './multiple-canvas.component.html',
  styleUrl: './multiple-canvas.component.scss',
})
export class MultipleCanvasComponent implements CanvasQuestionComponent {
  private readonly canvasEditSvc = inject(CanvasEditService, { optional: true });

  readonly question = input.required<FormQuestion>();
  readonly selected = input<boolean>(false);

  protected readonly options = computed<QuestionOption[]>(
    () => (this.question().config['options'] as QuestionOption[]) ?? [],
  );

  protected readonly scoringType = computed<string>(
    () => (this.question().config['scoringType'] as string) ?? 'none',
  );

  protected readonly maxScore = computed<number>(() =>
    this.options().reduce((max, option) => Math.max(max, option.score ?? 0), 0),
  );

  protected onScoreBlur(optionId: string, event: FocusEvent): void {
    const score = Number((event.target as HTMLInputElement).value) || 0;
    const updatedOptions = this.options().map((option) =>
      option.id === optionId ? { ...option, score } : option,
    );
    this.canvasEditSvc?.emit(this.question().id, {
      config: { ...this.question().config, options: updatedOptions },
    });
  }
}
