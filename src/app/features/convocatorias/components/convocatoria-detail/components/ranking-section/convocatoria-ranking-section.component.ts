import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { CheckboxComponent } from '../../../../../../shared/components/checkbox/checkbox.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { FileDownloadService } from '../../../../../../core/services/file-download.service';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { IconName } from '../../../../../../shared/icons/icon.registry';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { RankingEntry } from '../../../../models/convocatoria.model';
import { CandidateResponseDrawerComponent } from './components/candidate-response-drawer/candidate-response-drawer.component';

interface RankingFormColumn {
  formId: string;
  formName: string;
  weight: number;
}

const CLASSIFICATION_ICONS: Record<string, IconName> = {
  APTO: 'check-circle',
  REVISAR: 'alert-triangle',
  NO_APTO: 'x-circle',
};

@Component({
  selector: 'app-convocatoria-ranking-section',
  imports: [
    TranslatePipe, DecimalPipe, LoadingSpinnerComponent, EmptyStateComponent, CheckboxComponent,
    ButtonComponent, CandidateResponseDrawerComponent, IconComponent,
  ],
  templateUrl: './convocatoria-ranking-section.component.html',
  styleUrl: './convocatoria-ranking-section.component.scss',
})
export class ConvocatoriaRankingSectionComponent implements OnInit {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly fileDownload = inject(FileDownloadService);
  private readonly destroyRef = inject(DestroyRef);

  readonly convocatoriaId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly entries = signal<RankingEntry[]>([]);
  protected readonly selectedCandidateId = signal<string | null>(null);
  protected readonly selectedCandidateIds = signal<ReadonlySet<string>>(new Set());
  protected readonly exporting = signal(false);
  protected readonly exportError = signal(false);

  protected readonly formColumns = computed<RankingFormColumn[]>(() =>
    (this.entries()[0]?.formScores ?? []).map((formScore) => ({
      formId: formScore.formId,
      formName: formScore.formName,
      weight: formScore.weight,
    })));

  protected readonly allSelected = computed(() =>
    this.entries().length > 0 && this.entries().every((entry) => this.selectedCandidateIds().has(entry.candidateId)));

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

  protected isMedalRank(rank: number | null): boolean {
    return rank === 1 || rank === 2;
  }

  protected classificationIcon(classification: string | null): IconName | null {
    return classification ? (CLASSIFICATION_ICONS[classification] ?? null) : null;
  }

  protected openCandidate(candidateId: string): void {
    this.selectedCandidateId.set(candidateId);
  }

  protected closeCandidateDrawer(): void {
    this.selectedCandidateId.set(null);
  }

  protected toggleCandidate(candidateId: string): void {
    const next = new Set(this.selectedCandidateIds());
    if (next.has(candidateId)) {
      next.delete(candidateId);
    } else {
      next.add(candidateId);
    }
    this.selectedCandidateIds.set(next);
  }

  protected toggleAll(): void {
    this.selectedCandidateIds.set(
      this.allSelected() ? new Set() : new Set(this.entries().map((entry) => entry.candidateId)));
  }

  protected exportExcel(): void {
    if (this.exporting()) return;

    const candidateIds = this.selectedCandidateIds();
    this.exporting.set(true);
    this.exportError.set(false);
    this.convocatoriaService.exportRankingExcel(
      this.convocatoriaId(), candidateIds.size > 0 ? [...candidateIds] : undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          this.fileDownload.download(file.blob, file.filename);
          this.exporting.set(false);
        },
        error: () => {
          this.exportError.set(true);
          this.exporting.set(false);
        },
      });
  }
}
