import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-single-canvas',
  imports: [TranslatePipe],
  templateUrl: './single-canvas.component.html',
  styleUrl: './single-canvas.component.scss',
})
export class SingleCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected  = input<boolean>(false);

  protected readonly options = computed<QuestionOption[]>(
    () => (this.question().config['options'] as QuestionOption[]) ?? [],
  );
}
