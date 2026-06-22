import { Component, contentChild, contentChildren, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TableCellDirective } from './table-cell.directive';
import { TableToolbarDirective } from './table-toolbar.directive';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { IconName } from '../../icons/icon.registry';

export interface TableColumn {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

@Component({
  selector: 'app-table',
  imports: [NgTemplateOutlet, LoadingSpinnerComponent, EmptyStateComponent],
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

  protected readonly toolbarDirective = contentChild(TableToolbarDirective);
  protected readonly cellDirectives = contentChildren(TableCellDirective);

  protected getCellTemplate(key: string) {
    return this.cellDirectives().find((d) => d.column() === key)?.template ?? null;
  }

  protected getCellValue(row: unknown, key: string): unknown {
    if (key.startsWith('__')) return null;
    return (row as Record<string, unknown>)[key];
  }
}
