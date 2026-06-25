import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { FormQuestion } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-info-public',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './info-canvas.component.html',
  styleUrl: './info-canvas.component.scss',
})
export class InfoPublicComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected readonly content = computed<string>(
    () => (this.question().config['content'] as string) ?? '',
  );
}
