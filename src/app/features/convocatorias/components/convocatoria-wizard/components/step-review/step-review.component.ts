import { Component, computed, input, output, signal } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { Category } from '../../../../models/category.model';
import {
  CandidateAddFailure, ConvocatoriaDraft, ManualCandidateDraft, PROCESS_TYPE_LABEL_KEYS,
  parseCsvPreview,
} from '../../../../models/convocatoria-wizard.model';
import { CandidateImportModalComponent } from '../candidate-import-modal/candidate-import-modal.component';

@Component({
  selector: 'app-step-review',
  imports: [TranslatePipe, ButtonComponent, IconComponent, CandidateImportModalComponent],
  templateUrl: './step-review.component.html',
  styleUrl: './step-review.component.scss',
})
export class StepReviewComponent {
  readonly draft = input.required<ConvocatoriaDraft>();
  readonly selectedFormName = input.required<string>();
  readonly categories = input.required<Category[]>();
  readonly submitting = input(false);
  readonly submitError = input<string | null>(null);
  readonly candidateAddFailures = input<CandidateAddFailure[]>([]);

  readonly manualCandidateAdded = output<ManualCandidateDraft>();
  readonly manualCandidateRemoved = output<number>();
  readonly csvStaged = output<{ file: File; previewRows: ManualCandidateDraft[] }>();
  readonly csvCleared = output<void>();
  readonly launchRequested = output<void>();

  protected readonly manualName = signal('');
  protected readonly manualEmail = signal('');

  protected readonly pendingFile = signal<File | null>(null);
  protected readonly pendingPreviewRows = signal<ManualCandidateDraft[]>([]);
  protected readonly importModalOpen = signal(false);
  protected readonly csvReadError = signal(false);

  protected readonly resolvedWeights = computed(() => {
    const byId = new Map(this.categories().map((c) => [c.id, c]));
    return Object.entries(this.draft().weights)
      .filter(([, weight]) => weight > 0)
      .map(([categoryId, weight]) => ({ name: byId.get(categoryId)?.name ?? categoryId, weight }));
  });

  protected readonly processTypeLabelKey = computed(() => PROCESS_TYPE_LABEL_KEYS[this.draft().processType]);

  protected readonly canAddManual = computed(() => {
    const email = this.manualEmail().trim();
    return this.manualName().trim().length > 0
      && email.length > 0
      && !Validators.email({ value: email } as AbstractControl);
  });

  protected readonly hasCandidates = computed(() =>
    this.draft().manualCandidates.length > 0 || !!this.draft().csvFile);

  protected readonly canLaunch = computed(() => this.hasCandidates() && !this.submitting());

  protected addManualCandidate(): void {
    if (!this.canAddManual()) return;
    this.manualCandidateAdded.emit({ name: this.manualName().trim(), email: this.manualEmail().trim() });
    this.manualName.set('');
    this.manualEmail.set('');
  }

  protected removeManualCandidate(index: number): void {
    this.manualCandidateRemoved.emit(index);
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.csvReadError.set(false);
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsvPreview(String(reader.result ?? ''));
      this.pendingFile.set(file);
      this.pendingPreviewRows.set(rows);
      this.importModalOpen.set(true);
    };
    reader.onerror = () => {
      this.csvReadError.set(true);
    };
    reader.readAsText(file);
  }

  protected confirmCsvImport(): void {
    const file = this.pendingFile();
    if (!file) return;
    this.csvStaged.emit({ file, previewRows: this.pendingPreviewRows() });
    this.importModalOpen.set(false);
    this.pendingFile.set(null);
    this.pendingPreviewRows.set([]);
  }

  protected cancelCsvImport(): void {
    this.importModalOpen.set(false);
    this.pendingFile.set(null);
    this.pendingPreviewRows.set([]);
  }

  protected clearCsv(): void {
    this.csvCleared.emit();
  }

  protected requestLaunch(): void {
    this.launchRequested.emit();
  }
}
