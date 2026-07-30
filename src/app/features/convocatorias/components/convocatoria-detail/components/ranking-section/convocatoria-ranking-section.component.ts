import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { RankingEntry } from '../../../../models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-ranking-section',
  imports: [TranslatePipe, DecimalPipe, IconComponent, LoadingSpinnerComponent, EmptyStateComponent],
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
  protected readonly expandedCandidateId = signal<string | null>(null);

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

  protected toggleExpanded(candidateId: string): void {
    this.expandedCandidateId.set(this.expandedCandidateId() === candidateId ? null : candidateId);
  }

  protected isExpanded(candidateId: string): boolean {
    return this.expandedCandidateId() === candidateId;
  }
}
