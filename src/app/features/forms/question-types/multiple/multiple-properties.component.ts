import { Component, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { PropertiesQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-multiple-properties',
  imports: [TranslatePipe],
  templateUrl: './multiple-properties.component.html',
  styleUrl: './multiple-properties.component.scss',
})
export class MultiplePropertiesComponent implements PropertiesQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly changed  = output<Partial<FormQuestion>>();

  protected readonly localOptions = signal<QuestionOption[]>([]);

  constructor() {
    effect(() => {
      const opts = (this.question().config['options'] as QuestionOption[]) ?? [];
      this.localOptions.set(opts.map((o) => ({ ...o })));
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

  private emitOptions(): void {
    this.changed.emit({ config: { ...this.question().config, options: this.localOptions() } });
  }
}
