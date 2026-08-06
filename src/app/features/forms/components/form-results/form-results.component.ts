import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
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
import { ResultsSummaryComponent } from './components/results-summary/results-summary.component';

type ResultsTab = 'summary' | 'per-question' | 'responses';

@Component({
  selector: 'app-form-results',
  imports: [
    TranslatePipe,
    ButtonComponent, CardComponent, PageHeaderComponent, LoadingSpinnerComponent,
    EmptyStateComponent, TabsComponent, ResultsSummaryComponent,
  ],
  templateUrl: './form-results.component.html',
  styleUrl: './form-results.component.scss',
})
export class FormResultsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formsService = inject(FormsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly formId = this.route.snapshot.paramMap.get('id')!;

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly stats = signal<FormStats | null>(null);
  protected readonly activeTab = signal<ResultsTab>('summary');

  protected readonly tabs: TabItem[] = [
    { id: 'summary', label: 'results.tabs.summary' },
    { id: 'per-question', label: 'results.tabs.per_question' },
    { id: 'responses', label: 'results.tabs.responses' },
  ];

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

  protected goToPreview(): void {
    this.router.navigate(formPreviewPath(this.formId));
  }
}
