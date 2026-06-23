import { Component, computed, input } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-text-canvas',
  imports: [],
  templateUrl: './text-canvas.component.html',
  styleUrl: './text-canvas.component.scss',
})
export class TextCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected  = input<boolean>(false);

  protected readonly placeholder = computed(
    () => (this.question().config['placeholder'] as string) ?? '',
  );
}
