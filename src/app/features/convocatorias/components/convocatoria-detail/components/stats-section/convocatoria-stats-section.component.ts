import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { StatCardComponent } from '../../../../../../shared/components/stat-card/stat-card.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { ConvocatoriaStats } from '../../../../models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-stats-section',
  imports: [TranslatePipe, LoadingSpinnerComponent, EmptyStateComponent, StatCardComponent],
  templateUrl: './convocatoria-stats-section.component.html',
  styleUrl: './convocatoria-stats-section.component.scss',
})
export class ConvocatoriaStatsSectionComponent implements OnInit {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly convocatoriaId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly stats = signal<ConvocatoriaStats | null>(null);

  ngOnInit(): void {
    this.convocatoriaService.getStats(this.convocatoriaId())
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
}
