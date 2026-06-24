import { Component, computed, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, FormType, QuestionOption } from '../../models/form.model';
import { PropertiesQuestionComponent } from '../question-type.interfaces';
import { OptionListEditorComponent } from '../shared/option-list-editor/option-list-editor.component';

@Component({
  selector: 'app-matrix-properties',
  imports: [TranslatePipe, OptionListEditorComponent],
  templateUrl: './matrix-properties.component.html',
  styleUrl: './matrix-properties.component.scss',
})
export class MatrixPropertiesComponent implements PropertiesQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly changed  = output<Partial<FormQuestion>>();
  readonly formType = input<FormType | undefined>(undefined);

  protected readonly scoringType = signal<string>('none');

  protected readonly showScoring = computed(() => {
    const type = this.formType();
    return type === 'CANDIDATES' || type === 'DIAGNOSTIC';
  });

  protected readonly currentRows = computed<QuestionOption[]>(() =>
    (this.question().config['rows'] as QuestionOption[]) ?? [],
  );

  protected readonly currentColumns = computed<QuestionOption[]>(() =>
    (this.question().config['columns'] as QuestionOption[]) ?? [],
  );

  constructor() {
    effect(() => {
      this.scoringType.set((this.question().config['scoringType'] as string) ?? 'none');
    });
  }

  protected onTitleBlur(event: FocusEvent): void {
    const title = (event.target as HTMLInputElement).value.trim();
    if (title && title !== this.question().title) this.changed.emit({ title });
  }

  protected onRequiredChange(event: Event): void {
    this.changed.emit({ required: (event.target as HTMLInputElement).checked });
  }

  protected onDescriptionBlur(event: FocusEvent): void {
    const description = (event.target as HTMLTextAreaElement).value.trim() || null;
    if (description !== this.question().description) this.changed.emit({ description });
  }

  protected onRowsChanged(rows: QuestionOption[]): void {
    this.changed.emit({ config: { ...this.question().config, rows } });
  }

  protected onColumnsChanged(columns: QuestionOption[]): void {
    this.changed.emit({ config: { ...this.question().config, columns } });
  }

  protected onScoringTypeChange(event: Event): void {
    const scoringType = (event.target as HTMLSelectElement).value as 'manual' | 'none';
    this.scoringType.set(scoringType);
    this.changed.emit({ config: { ...this.question().config, scoringType } });
  }
}
