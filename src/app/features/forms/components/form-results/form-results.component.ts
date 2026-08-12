import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { formPreviewPath } from '../../../../core/constants/route.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TabItem, TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { FormsService } from '../../services/forms.service';
import { FormStats } from '../../models/form-stats.model';
import { ExportFormat } from '../../models/form-response.model';
import { FileDownloadService } from '../../../../core/services/file-download.service';
import { ResultsSummaryComponent } from './components/results-summary/results-summary.component';
import { QuestionStatsCardComponent } from './components/question-stats-card/question-stats-card.component';
import { IndividualResponsesComponent } from './components/individual-responses/individual-responses.component';
import { ResponseDetailDrawerComponent } from './components/response-detail-drawer/response-detail-drawer.component';

type ResultsTab = 'summary' | 'per-question' | 'responses';

@Component({
  selector: 'app-form-results',
  imports: [
    TranslatePipe,
    ButtonComponent, CardComponent, PageHeaderComponent, LoadingSpinnerComponent,
    EmptyStateComponent, TabsComponent, ResultsSummaryComponent, QuestionStatsCardComponent,
    IndividualResponsesComponent, ResponseDetailDrawerComponent,
  ],
  templateUrl: './form-results.component.html',
  styleUrl: './form-results.component.scss',
})
export class FormResultsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formsService = inject(FormsService);
  private readonly fileDownload = inject(FileDownloadService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formId = this.route.snapshot.paramMap.get('id')!;

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly stats = signal<FormStats | null>(null);
  protected readonly activeTab = signal<ResultsTab>('summary');
  protected readonly selectedResponseId = signal<string | null>(null);
  protected readonly exportingExcel = signal(false);
  protected readonly exportingCsv = signal(false);
  protected readonly exportError = signal(false);

  protected readonly tabs: TabItem[] = [
    { id: 'summary', label: 'results.tabs.summary' },
    { id: 'per-question', label: 'results.tabs.per_question' },
    { id: 'responses', label: 'results.tabs.responses' },
  ];

  // INFO blocks are display-only content, never actual questions — they never
  // collect answers (answeredCount is always 0), so showing them in the
  // per-question grid would be misleading rather than just empty.
  protected readonly chartableQuestions = computed(() =>
    this.stats()?.questions.filter((q) => q.type !== 'info') ?? []);

  ngOnInit(): void {
    this.formsService.getStats(this.formId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  protected setActiveTab(tabId: string): void {
    this.activeTab.set(tabId as ResultsTab);
  }

  protected openResponse(responseId: string): void {
    this.selectedResponseId.set(responseId);
  }

  protected closeResponseDrawer(): void {
    this.selectedResponseId.set(null);
  }

  protected goToPreview(): void {
    this.router.navigate(formPreviewPath(this.formId));
  }

  protected exportResponses(format: ExportFormat): void {
    const exporting = format === 'excel' ? this.exportingExcel : this.exportingCsv;
    exporting.set(true);
    this.exportError.set(false);
    this.formsService.exportResponses(this.formId, format)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          this.fileDownload.download(file.blob, file.filename);
          exporting.set(false);
        },
        error: () => {
          this.exportError.set(true);
          exporting.set(false);
        },
      });
  }
}
