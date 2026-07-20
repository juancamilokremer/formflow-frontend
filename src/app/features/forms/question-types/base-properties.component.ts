import { Directive, input, output } from '@angular/core';
import { Category } from '../../../core/models/category.model';
import { FormQuestion, FormType } from '../models/form.model';
import { PropertiesQuestionComponent } from './question-type.interfaces';

@Directive()
export abstract class BasePropertiesComponent implements PropertiesQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly changed  = output<Partial<FormQuestion>>();
  readonly formType = input<FormType | undefined>(undefined);
  readonly categories = input<Category[]>([]);
  readonly categoryCreated = output<Category>();

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
