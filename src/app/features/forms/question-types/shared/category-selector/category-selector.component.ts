import { Component, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryFormDialogComponent } from '../../../../categories/components/category-form-dialog/category-form-dialog.component';
import { Category } from '../../../../categories/models/category.model';
import { CategoryService } from '../../../../categories/services/category.service';

const CREATE_NEW_VALUE = '__new__';

@Component({
  selector: 'app-category-selector',
  imports: [TranslatePipe, CategoryFormDialogComponent],
  templateUrl: './category-selector.component.html',
  styleUrl: './category-selector.component.scss',
})
export class CategorySelectorComponent {
  private readonly categoryService = inject(CategoryService);

  readonly selectedCategoryId = input<string | null>(null);
  readonly categoryChange = output<string | null>();

  protected readonly categories = signal<Category[]>([]);
  protected readonly dialogOpen = signal(false);

  constructor() {
    this.categoryService.getAll().subscribe((categories) => this.categories.set(categories));
  }

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === CREATE_NEW_VALUE) {
      this.dialogOpen.set(true);
      return;
    }
    this.categoryChange.emit(value || null);
  }

  protected onCategoryCreated(category: Category): void {
    this.categories.update((categories) => [...categories, category]);
    this.dialogOpen.set(false);
    this.categoryChange.emit(category.id);
  }

  protected onDialogCancelled(): void {
    this.dialogOpen.set(false);
  }
}
