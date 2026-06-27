import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { FormQuestion } from '../../models/form.model';
import { PublicQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-file-answer',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './file-answer.component.html',
  styleUrl: './file-answer.component.scss',
})
export class FileAnswerComponent implements PublicQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  protected readonly allowedTypes = computed<string[]>(
    () => (this.question().config['allowedTypes'] as string[]) ?? [],
  );

  protected readonly accept = computed<string>(
    () => this.allowedTypes().map((t) => `.${t}`).join(','),
  );

  protected onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.answered.emit(file);
  }
}
