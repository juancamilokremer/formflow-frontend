import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { RankingEntry } from '../../../../models/convocatoria.model';

interface RankingFormColumn {
  formId: string;
  formName: string;
  weight: number;
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈' };

@Component({
  selector: 'app-convocatoria-ranking-section',
  imports: [TranslatePipe, DecimalPipe, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './convocatoria-ranking-section.component.html',
  styleUrl: './convocatoria-ranking-section.component.scss',
})
export class ConvocatoriaRankingSectionComponent implements OnInit {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly convocatoriaId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly entries = signal<RankingEntry[]>([]);

  protected readonly formColumns = computed<RankingFormColumn[]>(() =>
    (this.entries()[0]?.formScores ?? []).map((formScore) => ({
      formId: formScore.formId,
      formName: formScore.formName,
      weight: formScore.weight,
    })));

  ngOnInit(): void {
    this.convocatoriaService.getRanking(this.convocatoriaId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.entries.set(entries);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  protected scoreFor(entry: RankingEntry, formId: string): number | null {
    return entry.formScores.find((formScore) => formScore.formId === formId)?.score ?? null;
  }

  protected completedCount(entry: RankingEntry): number {
    return entry.formScores.filter((formScore) => formScore.completed).length;
  }

  protected medal(rank: number | null): string | null {
    return rank !== null ? (RANK_MEDALS[rank] ?? null) : null;
  }
}
