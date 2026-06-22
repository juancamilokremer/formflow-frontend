import { Component, computed, input, output, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { AppTableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { TableCellDirective } from '../../../../shared/components/table/table-cell.directive';
import { TableToolbarDirective } from '../../../../shared/components/table/table-toolbar.directive';
import { Form } from '../../models/form.model';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'ALL',      label: 'Todos los estados' },
  { value: 'ACTIVE',   label: 'Activos' },
  { value: 'DRAFT',    label: 'Borradores' },
  { value: 'ARCHIVED', label: 'Archivados' },
];

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'name',           header: 'FORMULARIO' },
  { key: 'status',         header: 'ESTADO' },
  { key: 'responseCount',  header: 'RESPUESTAS', align: 'center' },
  { key: 'lastResponseAt', header: 'ÚLTIMA RESP.' },
  { key: '__actions',      header: '', align: 'right' },
];

@Component({
  selector: 'app-forms-list',
  imports: [
    TranslatePipe, LowerCasePipe,
    ButtonComponent, IconComponent,
    SearchInputComponent, SelectComponent,
    AppTableComponent, TableCellDirective, TableToolbarDirective,
  ],
  templateUrl: './forms-list.component.html',
  styleUrl: './forms-list.component.scss',
})
export class FormsListComponent {
  readonly forms    = input.required<Form[]>();
  readonly loading  = input.required<boolean>();
  readonly loadError = input.required<boolean>();

  readonly editRequested        = output<string>();
  readonly viewResultsRequested = output<string>();
  readonly deleteRequested      = output<string>();

  protected readonly searchQuery  = signal('');
  protected readonly statusFilter = signal<string>('ALL');

  protected readonly statusFilterOptions = STATUS_FILTER_OPTIONS;
  protected readonly tableColumns        = TABLE_COLUMNS;

  protected readonly filteredForms = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const s = this.statusFilter();
    return this.forms().filter(
      (f) =>
        (s === 'ALL' || f.status === s) &&
        (!q || f.name.toLowerCase().includes(q)),
    );
  });

  protected onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  protected onStatusFilter(value: string): void {
    this.statusFilter.set(value);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  protected formatRelative(iso: string | null): string {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
  }
}
