import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Observable, concatMap, from, of, switchMap, tap, toArray, catchError, map, throwError, forkJoin,
} from 'rxjs';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SuccessCardComponent } from '../../../../shared/components/success-card/success-card.component';
import { FormsService } from '../../../forms/services/forms.service';
import { Form } from '../../../forms/models/form.model';
import { ConvocatoriaService } from '../../services/convocatoria.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { ConvocatoriaDetail, CreateConvocatoriaRequest } from '../../models/convocatoria.model';
import {
  ConvocatoriaDraft, DEFAULT_DRAFT, ManualCandidateDraft, ProcessType, WizardStep,
  deriveCategoryIds,
} from '../../models/convocatoria-wizard.model';
import { StepBasicInfoComponent } from './components/step-basic-info/step-basic-info.component';
import { StepFormSelectorComponent } from './components/step-form-selector/step-form-selector.component';
import { StepCategoryWeightsComponent } from './components/step-category-weights/step-category-weights.component';
import { StepThresholdsComponent } from './components/step-thresholds/step-thresholds.component';
import { StepReviewComponent, CandidateAddFailure } from './components/step-review/step-review.component';

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
  private readonly convocatoriaService = inject(ConvocatoriaService);
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
    this.draft.update((d) => ({ ...d, ...patch }));
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
    this.candidateAddFailures.set([]);

    const existingId = this.createdConvocatoriaId();
    const create$ = existingId
      ? of({ id: existingId } as ConvocatoriaDetail)
      : this.convocatoriaService.create(this.buildCreateRequest());

    create$.pipe(
      tap((c) => this.createdConvocatoriaId.set(c.id)),
      catchError(() => throwError(() => ({ stage: 'create' }))),
      switchMap((c) => this.addOrImportCandidates(c.id).pipe(map(() => c.id))),
      switchMap((id) => this.convocatoriaService.launch(id).pipe(
        catchError(() => throwError(() => ({ stage: 'launch' }))),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (launched) => {
        this.submitting.set(false);
        this.launchResult.set(launched);
      },
      error: (err: { stage?: string }) => {
        this.submitting.set(false);
        this.submitError.set(this.describeSubmitError(err?.stage));
      },
    });
  }

  private buildCreateRequest(): CreateConvocatoriaRequest {
    const d = this.draft();
    const total = this.totalWeight();
    return {
      name: d.name.trim(),
      formId: d.formId!,
      categoryWeights: total === 0
        ? undefined
        : Object.entries(d.weights)
            .filter(([, weight]) => weight > 0)
            .map(([categoryId, weight]) => ({ categoryId, weight })),
      scoringConfig: { aptoMin: d.aptoMin, revisarMin: d.revisarMin },
    };
  }

  private addOrImportCandidates(convocatoriaId: string): Observable<unknown> {
    const d = this.draft();

    if (d.csvFile) {
      return this.convocatoriaService.importCandidates(convocatoriaId, d.csvFile).pipe(
        catchError(() => throwError(() => ({ stage: 'candidates' }))),
      );
    }

    if (d.manualCandidates.length === 0) {
      return of(null);
    }

    return from(d.manualCandidates).pipe(
      concatMap((candidate) =>
        this.convocatoriaService.addCandidate(convocatoriaId, candidate).pipe(
          map(() => ({ ok: true as const, candidate })),
          catchError((err) => of({ ok: false as const, candidate, error: err })),
        ),
      ),
      toArray(),
      switchMap((results) => {
        const failed = results.filter((r) => !r.ok) as CandidateAddFailure[];
        this.candidateAddFailures.set(failed);
        const succeeded = results.length - failed.length;
        return succeeded === 0 ? throwError(() => ({ stage: 'candidates' })) : of(results);
      }),
    );
  }

  private describeSubmitError(stage: string | undefined): string {
    switch (stage) {
      case 'candidates': return 'convocatorias.wizard.review.error_candidates';
      case 'launch': return 'convocatorias.wizard.review.error_launch';
      default: return 'convocatorias.wizard.review.error_create';
    }
  }
}
