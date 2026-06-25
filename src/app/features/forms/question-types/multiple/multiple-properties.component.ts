import { Component, computed, effect, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { QuestionOption } from '../../models/form.model';
import { BasePropertiesComponent } from '../base-properties.component';
import { OptionListEditorComponent } from '../shared/option-list-editor/option-list-editor.component';

@Component({
  selector: 'app-multiple-properties',
  imports: [TranslatePipe, OptionListEditorComponent],
  templateUrl: './multiple-properties.component.html',
  styleUrl: './multiple-properties.component.scss',
})
export class MultiplePropertiesComponent extends BasePropertiesComponent {
  protected readonly scoringType = signal<string>('none');

  protected readonly showScoring = computed(() => {
    const type = this.formType();
    return type === 'CANDIDATES' || type === 'DIAGNOSTIC';
  });

  protected readonly currentOptions = computed<QuestionOption[]>(() =>
    (this.question().config['options'] as QuestionOption[]) ?? [],
  );

  constructor() {
    super();
    effect(() => {
      this.scoringType.set((this.question().config['scoringType'] as string) ?? 'none');
    });
  }

  protected onOptionsChanged(options: QuestionOption[]): void {
    this.changed.emit({ config: { ...this.question().config, options } });
  }

  protected onScoringTypeChange(event: Event): void {
    const scoringType = (event.target as HTMLSelectElement).value as 'manual' | 'none';
    this.scoringType.set(scoringType);
    this.changed.emit({ config: { ...this.question().config, scoringType } });
  }
}
