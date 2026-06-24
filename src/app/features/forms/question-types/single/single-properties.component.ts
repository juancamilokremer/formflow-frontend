import { Component, computed, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, FormType, QuestionOption } from '../../models/form.model';
import { PropertiesQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-single-properties',
  imports: [TranslatePipe],
  templateUrl: './single-properties.component.html',
  styleUrl: './single-properties.component.scss',
})
export class SinglePropertiesComponent implements PropertiesQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly changed  = output<Partial<FormQuestion>>();
  readonly formType = input<FormType | undefined>(undefined);

  protected readonly localOptions = signal<QuestionOption[]>([]);
  protected readonly scoringType  = signal<string>('none');

  protected readonly showScoring = computed(() => {
    const t = this.formType();
    return t === 'CANDIDATES' || t === 'DIAGNOSTIC';
  });

  constructor() {
    effect(() => {
      const cfg = this.question().config;
      const opts = (cfg['options'] as QuestionOption[]) ?? [];
      this.localOptions.set(opts.map((o) => ({ ...o })));
      this.scoringType.set((cfg['scoringType'] as string) ?? 'none');
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

  protected onOptionLabelBlur(id: string, event: FocusEvent): void {
    const label = (event.target as HTMLInputElement).value.trim();
    if (!label) return;
    this.localOptions.update((opts) => opts.map((o) => (o.id === id ? { ...o, label } : o)));
    this.emitOptions();
  }

  protected addOption(): void {
    this.localOptions.update((opts) => [
      ...opts,
      { id: crypto.randomUUID(), label: '' },
    ]);
  }

  protected removeOption(id: string): void {
    this.localOptions.update((opts) => opts.filter((o) => o.id !== id));
    this.emitOptions();
  }

  protected onScoringTypeChange(event: Event): void {
    const scoringType = (event.target as HTMLSelectElement).value as 'manual' | 'none';
    this.scoringType.set(scoringType);
    this.changed.emit({ config: { ...this.question().config, scoringType } });
  }

  private emitOptions(): void {
    this.changed.emit({ config: { ...this.question().config, options: this.localOptions() } });
  }
}
