import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AppTableComponent, TableColumn } from '../../../../../../shared/components/table/table.component';
import { TableCellDirective } from '../../../../../../shared/components/table/table-cell.directive';
import { FormsService } from '../../../../services/forms.service';
import { ResponseSummary } from '../../../../models/form-response.model';
import { formatDurationSeconds } from '../results-summary/results-summary.component';

@Component({
  selector: 'app-individual-responses',
  imports: [DatePipe, TranslatePipe, AppTableComponent, TableCellDirective],
  templateUrl: './individual-responses.component.html',
  styleUrl: './individual-responses.component.scss',
})
export class IndividualResponsesComponent {
  readonly formId = input.required<string>();
  readonly from = input<string | undefined>(undefined);
  readonly to = input<string | undefined>(undefined);
  readonly responseSelected = output<string>();

  private readonly formsService = inject(FormsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly responses = signal<ResponseSummary[]>([]);
  protected readonly totalElements = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  // Placeholder for the very first render only — overwritten by the backend's
  // own default (echoed back as result.size) as soon as the first page loads.
  protected readonly pageSize = signal(20);
  private loadRequestId = 0;

  protected readonly tableColumns: TableColumn[] = [
    { key: 'submittedAt', header: 'results.responses.column_submitted' },
    { key: 'duration', header: 'results.responses.column_duration' },
    { key: 'totalScore', header: 'results.responses.column_score', align: 'right' },
  ];

  constructor() {
    // Reads from()/to() to establish the reactive dependency, and also runs
    // once on init (both start undefined) — this is what triggers the first load.
    effect(() => {
      this.from();
      this.to();
      this.load(0);
    });
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected onRowClick(row: unknown): void {
    this.responseSelected.emit((row as ResponseSummary).id);
  }

  protected duration(row: ResponseSummary): string {
    return responseDurationLabel(row);
  }

  // A range edit and a page click can both be in flight at once — without this
  // guard, whichever response arrives last wins, even if it's stale.
  private load(page: number): void {
    const requestId = ++this.loadRequestId;
    this.loading.set(true);
    this.loadError.set(false);
    this.formsService.getResponses(this.formId(), page, undefined, this.from(), this.to())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (requestId !== this.loadRequestId) return;
          this.responses.set(result.items);
          this.totalElements.set(result.totalElements);
          this.pageIndex.set(result.page);
          this.pageSize.set(result.size);
          this.loading.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) return;
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}

export function responseDurationLabel(row: ResponseSummary): string {
  if (!row.startedAt) return '—';
  const seconds = Math.round(
    (new Date(row.submittedAt).getTime() - new Date(row.startedAt).getTime()) / 1000);
  return seconds < 0 ? '—' : formatDurationSeconds(seconds);
}
