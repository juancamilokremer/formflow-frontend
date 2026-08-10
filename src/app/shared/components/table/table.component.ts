import { Component, computed, contentChild, contentChildren, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { TableCellDirective } from './table-cell.directive';
import { TableToolbarDirective } from './table-toolbar.directive';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../../icons/icon.component';
import { IconName } from '../../icons/icon.registry';

export interface TableColumn {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

@Component({
  selector: 'app-table',
  imports: [NgTemplateOutlet, TranslatePipe, LoadingSpinnerComponent, EmptyStateComponent, ButtonComponent, IconComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class AppTableComponent {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<unknown[]>();
  readonly loading = input(false);
  readonly loadError = input(false);
  readonly loadingMessage = input<string | null>(null);
  readonly errorTitle = input('Error al cargar');
  readonly errorSubtitle = input<string | null>(null);
  readonly emptyIcon = input<IconName>('inbox');
  readonly emptyTitle = input('Sin resultados');
  readonly emptySubtitle = input<string | null>(null);

  /** Server-side pagination — omit totalElements to keep this table unpaginated (default). */
  readonly totalElements = input<number | null>(null);
  readonly pageIndex = input(0);
  readonly pageSize = input(20);
  readonly pageChange = output<number>();

  readonly clickableRows = input(false);
  readonly rowClick = output<unknown>();

  protected readonly toolbarDirective = contentChild(TableToolbarDirective);
  protected readonly cellDirectives = contentChildren(TableCellDirective);

  protected readonly totalPages = computed(() => {
    const total = this.totalElements();
    return total === null ? 0 : Math.max(1, Math.ceil(total / this.pageSize()));
  });

  protected readonly rangeStart = computed(() =>
    this.rows().length === 0 ? 0 : this.pageIndex() * this.pageSize() + 1);

  protected readonly rangeEnd = computed(() =>
    this.pageIndex() * this.pageSize() + this.rows().length);

  protected getCellTemplate(key: string) {
    return this.cellDirectives().find((d) => d.column() === key)?.template ?? null;
  }

  protected getCellValue(row: unknown, key: string): unknown {
    if (key.startsWith('__')) return null;
    return (row as Record<string, unknown>)[key];
  }

  protected onRowClick(row: unknown): void {
    if (this.clickableRows()) this.rowClick.emit(row);
  }

  protected goToPreviousPage(): void {
    if (this.pageIndex() > 0) this.pageChange.emit(this.pageIndex() - 1);
  }

  protected goToNextPage(): void {
    if (this.pageIndex() < this.totalPages() - 1) this.pageChange.emit(this.pageIndex() + 1);
  }
}
