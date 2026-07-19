import { Component, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../../../../core/models/category.model';
import { CategoryFormDialogComponent } from '../../../../../shared/components/category-form-dialog/category-form-dialog.component';

const CREATE_NEW_VALUE = '__new__';

@Component({
  selector: 'app-category-selector',
  imports: [TranslatePipe, CategoryFormDialogComponent],
  templateUrl: './category-selector.component.html',
  styleUrl: './category-selector.component.scss',
})
export class CategorySelectorComponent {
  readonly categories = input<Category[]>([]);
  readonly selectedCategoryId = input<string | null>(null);

  readonly categoryChange = output<string | null>();
  readonly categoryCreated = output<Category>();

  protected readonly dialogOpen = signal(false);

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === CREATE_NEW_VALUE) {
      this.dialogOpen.set(true);
      return;
    }
    this.categoryChange.emit(value || null);
  }

  protected onCategoryCreated(category: Category): void {
    this.dialogOpen.set(false);
    this.categoryCreated.emit(category);
    this.categoryChange.emit(category.id);
  }

  protected onDialogCancelled(): void {
    this.dialogOpen.set(false);
  }
}
