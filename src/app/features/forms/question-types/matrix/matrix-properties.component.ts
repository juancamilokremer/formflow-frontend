import { Component, computed, effect, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { QuestionOption } from '../../models/form.model';
import { BasePropertiesComponent } from '../base-properties.component';
import { OptionListEditorComponent } from '../shared/option-list-editor/option-list-editor.component';

@Component({
  selector: 'app-matrix-properties',
  imports: [TranslatePipe, OptionListEditorComponent],
  templateUrl: './matrix-properties.component.html',
  styleUrl: './matrix-properties.component.scss',
})
export class MatrixPropertiesComponent extends BasePropertiesComponent {
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
    super();
    effect(() => {
      this.scoringType.set((this.question().config['scoringType'] as string) ?? 'none');
    });
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
