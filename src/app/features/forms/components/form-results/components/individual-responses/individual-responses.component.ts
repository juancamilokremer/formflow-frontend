import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AppTableComponent, TableColumn } from '../../../../../../shared/components/table/table.component';
import { TableCellDirective } from '../../../../../../shared/components/table/table-cell.directive';
import { FormsService } from '../../../../services/forms.service';
import { ResponseSummary } from '../../../../models/form-response.model';
import { formatDurationSeconds } from '../results-summary/results-summary.component';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-individual-responses',
  imports: [DatePipe, TranslatePipe, AppTableComponent, TableCellDirective],
  templateUrl: './individual-responses.component.html',
  styleUrl: './individual-responses.component.scss',
})
export class IndividualResponsesComponent implements OnInit {
  readonly formId = input.required<string>();
  readonly responseSelected = output<string>();

  private readonly formsService = inject(FormsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly responses = signal<ResponseSummary[]>([]);
  protected readonly totalElements = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly pageSize = PAGE_SIZE;

  protected readonly tableColumns: TableColumn[] = [
    { key: 'submittedAt', header: 'results.responses.column_submitted' },
    { key: 'duration', header: 'results.responses.column_duration' },
    { key: 'totalScore', header: 'results.responses.column_score', align: 'right' },
  ];

  ngOnInit(): void {
    this.load(0);
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

  private load(page: number): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.formsService.getResponses(this.formId(), page, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.responses.set(result.items);
          this.totalElements.set(result.totalElements);
          this.pageIndex.set(result.page);
          this.loading.set(false);
        },
        error: () => {
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
