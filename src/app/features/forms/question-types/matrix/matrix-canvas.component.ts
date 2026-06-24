import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-matrix-canvas',
  imports: [TranslatePipe],
  templateUrl: './matrix-canvas.component.html',
  styleUrl: './matrix-canvas.component.scss',
})
export class MatrixCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected = input<boolean>(false);

  protected readonly rows = computed<QuestionOption[]>(
    () => (this.question().config['rows'] as QuestionOption[]) ?? [],
  );

  protected readonly columns = computed<QuestionOption[]>(
    () => (this.question().config['columns'] as QuestionOption[]) ?? [],
  );
}
