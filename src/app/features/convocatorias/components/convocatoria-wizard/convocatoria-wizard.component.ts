import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SuccessCardComponent } from '../../../../shared/components/success-card/success-card.component';
import { FormsService } from '../../../forms/services/forms.service';
import { Form } from '../../../forms/models/form.model';
import { ConvocatoriaLaunchService } from '../../services/convocatoria-launch.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { ConvocatoriaDetail } from '../../models/convocatoria.model';
import {
  CandidateAddFailure, ConvocatoriaDraft, DEFAULT_DRAFT, LaunchError, ManualCandidateDraft,
  ProcessType, WizardStep, deriveCategoryIds,
} from '../../models/convocatoria-wizard.model';
import { StepBasicInfoComponent } from './components/step-basic-info/step-basic-info.component';
import { StepFormSelectorComponent } from './components/step-form-selector/step-form-selector.component';
import { StepCategoryWeightsComponent } from './components/step-category-weights/step-category-weights.component';
import { StepThresholdsComponent } from './components/step-thresholds/step-thresholds.component';
import { StepReviewComponent } from './components/step-review/step-review.component';

const STEP_KEYS = [
  'convocatorias.wizard.steps.basic_info',
  'convocatorias.wizard.steps.form_selector',
  'convocatorias.wizard.steps.weights',
  'convocatorias.wizard.steps.thresholds',
  'convocatorias.wizard.steps.review',
];

@Component({
  selector: 'app-convocatoria-wizard',
  imports: [
    TranslatePipe,
    ButtonComponent, CardComponent, PageHeaderComponent, IconComponent, ConfirmDialogComponent,
    SuccessCardComponent, StepBasicInfoComponent, StepFormSelectorComponent, StepCategoryWeightsComponent,
    StepThresholdsComponent, StepReviewComponent,
  ],
  templateUrl: './convocatoria-wizard.component.html',
  styleUrl: './convocatoria-wizard.component.scss',
})
export class ConvocatoriaWizardComponent {
  private readonly launchService = inject(ConvocatoriaLaunchService);
  private readonly categoryService = inject(CategoryService);
  private readonly formsService = inject(FormsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly stepKeys = STEP_KEYS;

  protected readonly currentStep = signal<WizardStep>(1);
  protected readonly draft = signal<ConvocatoriaDraft>(DEFAULT_DRAFT);

  protected readonly forms = signal<Form[]>([]);
  protected readonly formCategories = signal<Category[]>([]);
  protected readonly loadingCategories = signal(false);
  private readonly lastFetchedFormId = signal<string | null>(null);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly candidateAddFailures = signal<CandidateAddFailure[]>([]);
  private readonly createdConvocatoriaId = signal<string | null>(null);
  private readonly succeededCandidateEmails = signal<ReadonlySet<string>>(new Set());
  protected readonly launchResult = signal<ConvocatoriaDetail | null>(null);

  protected readonly discardConfirmOpen = signal(false);

  protected readonly selectedFormName = computed(() => {
    const formId = this.draft().formId;
    return this.forms().find((f) => f.id === formId)?.name ?? '';
  });

  protected readonly step1Valid = computed(() => this.draft().name.trim().length > 0);
  protected readonly step2Valid = computed(() => !!this.draft().formId);
  protected readonly totalWeight = computed(() =>
    Object.values(this.draft().weights).reduce((a, b) => a + b, 0));
  protected readonly step3Valid = computed(() => {
    const total = this.totalWeight();
    return total === 0 || total === 100;
  });
  protected readonly step4Valid = computed(() => this.draft().revisarMin < this.draft().aptoMin);
  protected readonly step5Valid = computed(() =>
    this.draft().manualCandidates.length > 0 || !!this.draft().csvFile);

  protected readonly canGoNext = computed<boolean>(() => {
    switch (this.currentStep()) {
      case 1: return this.step1Valid();
      case 2: return this.step2Valid();
      case 3: return this.step3Valid();
      case 4: return this.step4Valid();
      case 5: return this.step5Valid();
    }
  });

  constructor() {
    this.formsService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((forms) => this.forms.set(forms));
  }

  protected onBasicInfoChanged(patch: { name: string; processType: ProcessType }): void {
    const processTypeChanged = this.draft().processType !== patch.processType;

    this.draft.update((d) => ({
      ...d,
      ...patch,
      formId: processTypeChanged ? null : d.formId,
      weights: processTypeChanged ? {} : d.weights,
    }));

    if (processTypeChanged) {
      this.formCategories.set([]);
      this.lastFetchedFormId.set(null);
    }
  }

  protected onFormSelected(formId: string): void {
    this.draft.update((d) => ({ ...d, formId }));
  }

  protected onWeightsChanged(weights: Record<string, number>): void {
    this.draft.update((d) => ({ ...d, weights }));
  }

  protected onThresholdsChanged(patch: { aptoMin: number; revisarMin: number }): void {
    this.draft.update((d) => ({ ...d, ...patch }));
  }

  protected onManualCandidateAdded(candidate: ManualCandidateDraft): void {
    this.draft.update((d) => ({ ...d, manualCandidates: [...d.manualCandidates, candidate] }));
  }

  protected onManualCandidateRemoved(index: number): void {
    this.draft.update((d) => ({
      ...d,
      manualCandidates: d.manualCandidates.filter((_, i) => i !== index),
    }));
  }

  protected onCsvStaged(payload: { file: File; previewRows: ManualCandidateDraft[] }): void {
    this.draft.update((d) => ({ ...d, csvFile: payload.file, csvPreviewRows: payload.previewRows }));
  }

  protected onCsvCleared(): void {
    this.draft.update((d) => ({ ...d, csvFile: null, csvPreviewRows: [] }));
  }

  protected goNext(): void {
    if (!this.canGoNext()) return;
    if (this.currentStep() === 2) this.loadFormCategories();
    if (this.currentStep() < 5) this.currentStep.update((s) => (s + 1) as WizardStep);
  }

  protected goBack(): void {
    if (this.currentStep() > 1) this.currentStep.update((s) => (s - 1) as WizardStep);
  }

  private loadFormCategories(): void {
    const formId = this.draft().formId;
    if (!formId || formId === this.lastFetchedFormId()) return;

    this.loadingCategories.set(true);
    forkJoin({
      form: this.formsService.getById(formId),
      categories: this.categoryService.getAll(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ form, categories }) => {
        const orderedIds = deriveCategoryIds(form);
        const byId = new Map(categories.map((c) => [c.id, c]));
        const resolved = orderedIds
          .map((id) => byId.get(id))
          .filter((c): c is Category => c !== undefined);

        this.formCategories.set(resolved);
        this.lastFetchedFormId.set(formId);
        this.draft.update((d) => ({
          ...d,
          weights: Object.fromEntries(resolved.map((c) => [c.id, d.weights[c.id] ?? 0])),
        }));
        this.loadingCategories.set(false);
      },
      error: () => {
        this.formCategories.set([]);
        this.loadingCategories.set(false);
      },
    });
  }

  protected requestDiscard(): void {
    this.discardConfirmOpen.set(true);
  }

  protected cancelDiscard(): void {
    this.discardConfirmOpen.set(false);
  }

  protected confirmDiscard(): void {
    this.router.navigate(['/', RouteConstants.CONVOCATORIAS]);
  }

  protected onLaunchRequested(): void {
    if (!this.step5Valid() || this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set(null);

    this.launchService
      .launch(this.draft(), this.createdConvocatoriaId(), this.succeededCandidateEmails())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ launched, convocatoriaId, failures }) => {
          this.createdConvocatoriaId.set(convocatoriaId);
          this.candidateAddFailures.set(failures);
          this.markCandidatesSucceeded(failures);
          this.submitting.set(false);
          this.launchResult.set(launched);
        },
        error: (err: LaunchError) => {
          if (err.convocatoriaId) this.createdConvocatoriaId.set(err.convocatoriaId);
          if (err.failures) {
            this.candidateAddFailures.set(err.failures);
            this.markCandidatesSucceeded(err.failures);
          }
          this.submitting.set(false);
          this.submitError.set(this.describeSubmitError(err.stage));
        },
      });
  }

  /** Remembers which manual candidates are already persisted, so a retry doesn't resend them. */
  private markCandidatesSucceeded(failuresThisRound: CandidateAddFailure[]): void {
    const alreadySucceeded = this.succeededCandidateEmails();
    const attempted = this.draft().manualCandidates.filter((c) => !alreadySucceeded.has(c.email));
    if (attempted.length === 0) return;

    const failedEmails = new Set(failuresThisRound.map((f) => f.candidate.email));
    const newlySucceeded = attempted.filter((c) => !failedEmails.has(c.email)).map((c) => c.email);
    if (newlySucceeded.length > 0) {
      this.succeededCandidateEmails.set(new Set([...alreadySucceeded, ...newlySucceeded]));
    }
  }

  private describeSubmitError(stage: string | undefined): string {
    switch (stage) {
      case 'candidates': return 'convocatorias.wizard.review.error_candidates';
      case 'launch': return 'convocatorias.wizard.review.error_launch';
      default: return 'convocatorias.wizard.review.error_create';
    }
  }
}
