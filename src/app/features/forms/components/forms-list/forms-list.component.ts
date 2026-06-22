import { Component, computed, inject, input, output, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { AppTableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { TableCellDirective } from '../../../../shared/components/table/table-cell.directive';
import { TableToolbarDirective } from '../../../../shared/components/table/table-toolbar.directive';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormsService } from '../../services/forms.service';
import { Form } from '../../models/form.model';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'ALL',      label: 'forms.filter.all' },
  { value: 'ACTIVE',   label: 'forms.filter.active' },
  { value: 'DRAFT',    label: 'forms.filter.draft' },
  { value: 'ARCHIVED', label: 'forms.filter.archived' },
];

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'name',           header: 'forms.table.name' },
  { key: 'status',         header: 'forms.table.status' },
  { key: 'responseCount',  header: 'forms.table.responses', align: 'center' },
  { key: 'lastResponseAt', header: 'forms.table.last_response' },
  { key: '__actions',      header: '', align: 'right' },
];

@Component({
  selector: 'app-forms-list',
  imports: [
    TranslatePipe, LowerCasePipe,
    ButtonComponent, IconComponent,
    SearchInputComponent, SelectComponent,
    AppTableComponent, TableCellDirective, TableToolbarDirective,
    ConfirmDialogComponent,
  ],
  templateUrl: './forms-list.component.html',
  styleUrl: './forms-list.component.scss',
})
export class FormsListComponent {
  private readonly formsService  = inject(FormsService);
  private readonly translateSvc  = inject(TranslateService);

  readonly forms     = input.required<Form[]>();
  readonly loading   = input.required<boolean>();
  readonly loadError = input.required<boolean>();

  readonly editRequested        = output<string>();
  readonly viewResultsRequested = output<string>();
  readonly deleted              = output<string>();

  protected readonly searchQuery    = signal('');
  protected readonly statusFilter   = signal<string>('ALL');
  protected readonly pendingDeleteId = signal<string | null>(null);

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

  protected confirmDelete(id: string): void {
    this.pendingDeleteId.set(id);
  }

  protected cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  protected deleteForm(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.formsService.remove(id).subscribe({
      next: () => {
        this.deleted.emit(id);
        this.pendingDeleteId.set(null);
      },
    });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  protected formatRelative(iso: string | null): string {
    if (!iso) return this.translateSvc.instant('common.never');
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return this.translateSvc.instant('common.ago_minutes', { n: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return this.translateSvc.instant('common.ago_hours', { n: hrs });
    return this.translateSvc.instant('common.ago_days', { n: Math.floor(hrs / 24) });
  }
}
