import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { AppTableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { TableCellDirective } from '../../../../shared/components/table/table-cell.directive';
import { TableToolbarDirective } from '../../../../shared/components/table/table-toolbar.directive';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'name',        header: 'categories.table.name' },
  { key: 'description', header: 'categories.table.description' },
  { key: '__actions',   header: '', align: 'right' },
];

@Component({
  selector: 'app-categories-list',
  imports: [
    TranslatePipe,
    ButtonComponent, IconComponent,
    SearchInputComponent,
    AppTableComponent, TableCellDirective, TableToolbarDirective,
    ConfirmDialogComponent,
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
})
export class CategoriesListComponent {
  private readonly categoryService = inject(CategoryService);

  readonly categories = input.required<Category[]>();
  readonly loading    = input.required<boolean>();
  readonly loadError  = input.required<boolean>();

  readonly editRequested = output<Category>();
  readonly deleted       = output<string>();

  protected readonly searchQuery     = signal('');
  protected readonly pendingDeleteId = signal<string | null>(null);
  protected readonly deleteError     = signal<string | null>(null);

  protected readonly tableColumns = TABLE_COLUMNS;

  protected readonly filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.categories().filter((c) => !q || c.name.toLowerCase().includes(q));
  });

  protected onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  protected confirmDelete(id: string): void {
    this.deleteError.set(null);
    this.pendingDeleteId.set(id);
  }

  protected cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  protected deleteCategory(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.categoryService.remove(id).subscribe({
      next: () => {
        this.deleted.emit(id);
        this.pendingDeleteId.set(null);
      },
      error: (err: { status?: number }) => {
        this.pendingDeleteId.set(null);
        this.deleteError.set(
          err?.status === 409 ? 'categories.actions.delete_conflict' : 'categories.actions.delete_error',
        );
      },
    });
  }
}
