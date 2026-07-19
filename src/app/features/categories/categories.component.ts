import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CategoryFormDialogComponent } from '../../shared/components/category-form-dialog/category-form-dialog.component';
import { CategoriesListComponent } from './components/categories-list/categories-list.component';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  imports: [
    TranslatePipe,
    ButtonComponent, IconComponent,
    PageHeaderComponent, EmptyStateComponent,
    CategoryFormDialogComponent, CategoriesListComponent,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  private readonly categoryService = inject(CategoryService);

  protected readonly categories  = signal<Category[]>([]);
  protected readonly loading     = signal(true);
  protected readonly loadError   = signal(false);
  protected readonly dialogOpen  = signal(false);
  protected readonly editingCategory = signal<Category | null>(null);

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => { this.categories.set(categories); this.loading.set(false); },
      error: ()           => { this.loadError.set(true); this.loading.set(false); },
    });
  }

  protected openCreateDialog(): void {
    this.editingCategory.set(null);
    this.dialogOpen.set(true);
  }

  protected openEditDialog(category: Category): void {
    this.editingCategory.set(category);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
  }

  protected onSaved(category: Category): void {
    const wasEditing = this.editingCategory();
    this.categories.update((list) =>
      wasEditing
        ? list.map((c) => (c.id === category.id ? category : c))
        : [category, ...list],
    );
    this.dialogOpen.set(false);
  }

  protected onDeleted(id: string): void {
    this.categories.update((list) => list.filter((c) => c.id !== id));
  }
}
