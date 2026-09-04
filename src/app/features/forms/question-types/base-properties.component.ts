import { Directive, effect, input, output, signal } from '@angular/core';
import { Category } from '../../../core/models/category.model';
import { FormQuestion, FormType } from '../models/form.model';
import { PropertiesQuestionComponent } from './question-type.interfaces';

@Directive()
export abstract class BasePropertiesComponent implements PropertiesQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly changed  = output<Partial<FormQuestion>>();
  readonly formType = input<FormType | undefined>(undefined);
  readonly categories = input<Category[]>([]);
  readonly locked = input<boolean>(false);
  readonly categoryCreated = output<Category>();

  protected readonly timeLimitUnit = signal<'seconds' | 'minutes'>('seconds');

  constructor() {
    effect(() => {
      const secs = this.question().timeLimitSeconds;
      this.timeLimitUnit.set(secs != null && secs >= 60 && secs % 60 === 0 ? 'minutes' : 'seconds');
    });
  }

  protected get timeLimitDisplayValue(): number | null {
    const secs = this.question().timeLimitSeconds;
    if (secs == null) return null;
    return this.timeLimitUnit() === 'minutes' ? Math.round(secs / 60) : secs;
  }

  protected onTimeLimitBlur(event: FocusEvent): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const num = raw === '' ? null : Number(raw);
    const timeLimitSeconds = num == null || Number.isNaN(num) || num <= 0
      ? null
      : (this.timeLimitUnit() === 'minutes' ? num * 60 : num);
    if (timeLimitSeconds !== this.question().timeLimitSeconds) {
      this.changed.emit({ timeLimitSeconds });
    }
  }

  protected onTimeLimitUnitChange(event: Event): void {
    this.timeLimitUnit.set((event.target as HTMLSelectElement).value as 'seconds' | 'minutes');
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

  protected onCategoryChange(categoryId: string | null): void {
    this.changed.emit({ categoryId });
  }

  protected onCategoryCreated(category: Category): void {
    this.categoryCreated.emit(category);
  }
}
