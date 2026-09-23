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
  readonly locked = input<boolean>(false);
  readonly categoryCreated = output<Category>();

  protected onTimeLimitChanged(timeLimitSeconds: number | null): void {
    this.changed.emit({ timeLimitSeconds });
  }

  // QuestionBaseFieldsComponent owns the markup and hands these already-parsed values over;
  // what stays here is the rule about which of them are worth persisting.
  protected onTitleChange(title: string): void {
    if (title && title !== this.question().title) this.changed.emit({ title });
  }

  protected onRequiredChange(required: boolean): void {
    this.changed.emit({ required });
  }

  protected onDescriptionChange(description: string | null): void {
    if (description !== this.question().description) this.changed.emit({ description });
  }

  protected onCategoryChange(categoryId: string | null): void {
    this.changed.emit({ categoryId });
  }

  protected onCategoryCreated(category: Category): void {
    this.categoryCreated.emit(category);
  }
}
