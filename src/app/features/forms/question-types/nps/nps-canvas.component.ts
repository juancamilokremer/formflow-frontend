import { Component, computed, input } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-nps-canvas',
  imports: [],
  templateUrl: './nps-canvas.component.html',
  styleUrl: './nps-canvas.component.scss',
})
export class NpsCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected = input<boolean>(false);

  protected readonly minLabel = computed<string>(() => (this.question().config['minLabel'] as string) ?? '');
  protected readonly maxLabel = computed<string>(() => (this.question().config['maxLabel'] as string) ?? '');

  protected readonly scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  protected zoneClass(score: number): string {
    if (score <= 6) return 'nps-btn--detractor';
    if (score <= 8) return 'nps-btn--passive';
    return 'nps-btn--promoter';
  }
}
