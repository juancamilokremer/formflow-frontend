import { Component, computed, input } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-scale-canvas',
  imports: [],
  templateUrl: './scale-canvas.component.html',
  styleUrl: './scale-canvas.component.scss',
})
export class ScaleCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected  = input<boolean>(false);

  protected readonly ticks = computed<number[]>(() => {
    const cfg = this.question().config;
    const min = (cfg['min'] as number) ?? 1;
    const max = (cfg['max'] as number) ?? 5;
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  });

  protected readonly minLabel = computed(
    () => (this.question().config['minLabel'] as string) ?? '',
  );

  protected readonly maxLabel = computed(
    () => (this.question().config['maxLabel'] as string) ?? '',
  );
}
