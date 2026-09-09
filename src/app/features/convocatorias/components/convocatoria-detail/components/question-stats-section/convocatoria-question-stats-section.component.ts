import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { SelectComponent, SelectOption } from '../../../../../../shared/components/select/select.component';
import { QuestionStatsCardComponent } from '../../../../../forms/components/form-results/components/question-stats-card/question-stats-card.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { ConvocatoriaQuestionStats } from '../../../../models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-question-stats-section',
  imports: [TranslatePipe, LoadingSpinnerComponent, EmptyStateComponent, SelectComponent, QuestionStatsCardComponent],
  templateUrl: './convocatoria-question-stats-section.component.html',
  styleUrl: './convocatoria-question-stats-section.component.scss',
})
export class ConvocatoriaQuestionStatsSectionComponent implements OnInit {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly convocatoriaId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly data = signal<ConvocatoriaQuestionStats | null>(null);
  protected readonly selectedFormId = signal<string | null>(null);

  protected readonly formOptions = computed<SelectOption[]>(() =>
    (this.data()?.forms ?? []).map((form) => ({ value: form.formId, label: form.formName })));

  protected readonly selectedForm = computed(() =>
    this.data()?.forms.find((form) => form.formId === this.selectedFormId()) ?? null);

  // INFO blocks are display-only content, never actual questions — they never
  // collect answers (answeredCount is always 0), so showing them in the
  // per-question grid would be misleading rather than just empty.
  protected readonly chartableQuestions = computed(() =>
    this.selectedForm()?.questions.filter((q) => q.type !== 'info') ?? []);

  ngOnInit(): void {
    this.convocatoriaService.getQuestionStats(this.convocatoriaId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.selectedFormId.set(data.forms[0]?.formId ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  protected onFormSelected(formId: string): void {
    this.selectedFormId.set(formId);
  }
}
