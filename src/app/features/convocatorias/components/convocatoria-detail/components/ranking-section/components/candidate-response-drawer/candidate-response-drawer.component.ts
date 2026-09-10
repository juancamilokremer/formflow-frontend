import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DrawerComponent } from '../../../../../../../../shared/components/drawer/drawer.component';
import { ButtonComponent } from '../../../../../../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../../../../shared/components/empty-state/empty-state.component';
import { StatCardComponent } from '../../../../../../../../shared/components/stat-card/stat-card.component';
import { IconComponent } from '../../../../../../../../shared/icons/icon.component';
import { FileDownloadService } from '../../../../../../../../core/services/file-download.service';
import { ConvocatoriaService } from '../../../../../../services/convocatoria.service';
import { CandidateConvocatoriaResponseDetail } from '../../../../../../models/convocatoria.model';

@Component({
  selector: 'app-candidate-response-drawer',
  imports: [
    DatePipe, TranslatePipe, DrawerComponent, ButtonComponent, LoadingSpinnerComponent,
    EmptyStateComponent, StatCardComponent, IconComponent,
  ],
  templateUrl: './candidate-response-drawer.component.html',
  styleUrl: './candidate-response-drawer.component.scss',
})
export class CandidateResponseDrawerComponent {
  readonly convocatoriaId = input.required<string>();
  readonly candidateId = input<string | null>(null);
  readonly closed = output<void>();

  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly fileDownload = inject(FileDownloadService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly detail = signal<CandidateConvocatoriaResponseDetail | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadError = signal(false);
  protected readonly downloading = signal(false);
  protected readonly downloadError = signal(false);

  protected readonly isOpen = computed(() => this.candidateId() !== null);

  constructor() {
    effect(() => {
      const candidateId = this.candidateId();
      if (candidateId === null) {
        this.detail.set(null);
        return;
      }
      this.load(candidateId);
    });
  }

  protected downloadPdf(): void {
    const candidateId = this.candidateId();
    if (candidateId === null || this.downloading()) return;

    this.downloading.set(true);
    this.downloadError.set(false);
    this.convocatoriaService.exportCandidatePdf(this.convocatoriaId(), candidateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          this.fileDownload.download(file.blob, file.filename);
          this.downloading.set(false);
        },
        error: () => {
          this.downloadError.set(true);
          this.downloading.set(false);
        },
      });
  }

  private load(candidateId: string): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.downloadError.set(false);
    this.convocatoriaService.getCandidateResponseDetail(this.convocatoriaId(), candidateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.detail.set(detail);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
