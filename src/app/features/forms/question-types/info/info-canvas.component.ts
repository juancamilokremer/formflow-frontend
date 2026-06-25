import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { FormQuestion } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-info-canvas',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './info-canvas.component.html',
  styleUrl: './info-canvas.component.scss',
})
export class InfoCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected = input<boolean>(false);

  protected readonly content = computed<string>(
    () => (this.question().config['content'] as string) ?? '',
  );
}
