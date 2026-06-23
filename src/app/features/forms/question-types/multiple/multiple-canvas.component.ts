import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-multiple-canvas',
  imports: [TranslatePipe],
  templateUrl: './multiple-canvas.component.html',
  styleUrl: './multiple-canvas.component.scss',
})
export class MultipleCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected  = input<boolean>(false);

  protected readonly options = computed<QuestionOption[]>(
    () => (this.question().config['options'] as QuestionOption[]) ?? [],
  );
}
