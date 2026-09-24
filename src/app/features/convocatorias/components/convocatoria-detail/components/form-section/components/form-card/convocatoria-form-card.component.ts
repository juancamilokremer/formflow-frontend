import { Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, debounceTime, forkJoin, switchMap } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../../../../shared/components/button/button.component';
import { CheckboxComponent } from '../../../../../../../../shared/components/checkbox/checkbox.component';
import { IconComponent } from '../../../../../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ContainerKind, RouteConstants, formBuilderPath, formPreviewPath } from '../../../../../../../../core/constants/route.constants';
import { CategoryService } from '../../../../../../../../core/services/category.service';
import { Category } from '../../../../../../../../core/models/category.model';
import { FormsService } from '../../../../../../../forms/services/forms.service';
import { FormStatus } from '../../../../../../../forms/models/form.model';
import { ConvocatoriaService } from '../../../../../../services/convocatoria.service';
import { ConvocatoriaForm, ProcessType } from '../../../../../../models/convocatoria.model';
import { deriveCategoryIds } from '../../../../../../utils/convocatoria.utils';
import { ConvocatoriaWeightsSectionComponent } from '../../../weights-section/convocatoria-weights-section.component';

@Component({
  selector: 'app-convocatoria-form-card',
  imports: [TranslatePipe, LowerCasePipe, ButtonComponent, CheckboxComponent, IconComponent, ConfirmDialogComponent, ConvocatoriaWeightsSectionComponent],
  templateUrl: './convocatoria-form-card.component.html',
  styleUrl: './convocatoria-form-card.component.scss',
  host: { '[class.cfc--readonly]': 'readonly()' },
})
export class ConvocatoriaFormCardComponent implements OnInit {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly formsService = inject(FormsService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly convocatoriaId = input.required<string>();
  readonly convocatoriaForm = input.required<ConvocatoriaForm>();
  readonly formName = input.required<string>();
  readonly processType = input.required<ProcessType>();
  readonly readonly = input(false);
  readonly isDraft = input(true);

  protected readonly isSimpleMode = computed(() => this.processType() === 'REGISTRATION');

  /**
   * Same rule the domain applies in Form.isLocked(): a published CANDIDATES/DIAGNOSTIC form
   * can no longer be edited structurally, and generating a new version is the way out.
   * Surveys are never locked, so they never need it.
   */
  protected readonly canGenerateVersion = computed(() => {
    const status = this.formStatus();
    return status !== null && status !== 'DRAFT' && !this.isSimpleMode();
  });

  readonly formUpdated = output<ConvocatoriaForm>();
  readonly formRemoved = output<string>();
  readonly weightPreview = output<number>();

  protected readonly categories = signal<Category[]>([]);
  protected readonly loadingCategories = signal(true);
  protected readonly sectionCount = signal(0);
  protected readonly formStatus = signal<FormStatus | null>(null);
  protected readonly generatingVersion = signal(false);
  protected readonly versionError = signal(false);
  protected readonly weight = signal(0);
  protected readonly categoryWeights = signal<Record<string, number>>({});
  protected readonly minScore = signal<number | null>(null);
  protected readonly readyToLaunch = signal(false);
  protected readonly removeConfirmOpen = signal(false);
  protected readonly removing = signal(false);

  private readonly change$ = new Subject<void>();

  ngOnInit(): void {
    const currentForm = this.convocatoriaForm();
    this.weight.set(currentForm.weight);
    this.minScore.set(currentForm.minScore);
    this.readyToLaunch.set(currentForm.readyToLaunch);
    this.categoryWeights.set(
      Object.fromEntries(currentForm.categoryWeights.map((categoryWeight) => [categoryWeight.categoryId, categoryWeight.weight])),
    );

    forkJoin({
      form: this.formsService.getById(currentForm.formId),
      categories: this.categoryService.getAll(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ form, categories }) => {
        const orderedIds = deriveCategoryIds(form);
        const byId = new Map(categories.map((category) => [category.id, category]));
        const resolved = orderedIds.map((categoryId) => byId.get(categoryId)).filter((category): category is Category => category !== undefined);
        this.categories.set(resolved);
        this.sectionCount.set(form.sections.length);
        this.formStatus.set(form.status);
        this.loadingCategories.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.loadingCategories.set(false);
      },
    });

    this.change$.pipe(
      debounceTime(600),
      switchMap(() => this.convocatoriaService.updateForm(this.convocatoriaId(), this.convocatoriaForm().id, {
        weight: this.weight(),
        categoryWeights: Object.entries(this.categoryWeights())
          .filter(([, weight]) => weight > 0)
          .map(([categoryId, weight]) => ({ categoryId, weight })),
        minScore: this.minScore(),
        readyToLaunch: this.readyToLaunch(),
      })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((updated) => {
      // The backend is the source of truth for auto-unsetting readyToLaunch when the config
      // changed underneath it — reflect whatever it actually persisted.
      this.readyToLaunch.set(updated.readyToLaunch);
      this.formUpdated.emit(updated);
    });
  }

  protected onWeightInput(value: number): void {
    const clamped = Math.max(0, Math.min(100, value || 0));
    this.weight.set(clamped);
    this.weightPreview.emit(clamped);
    this.readyToLaunch.set(false);
    this.change$.next();
  }

  protected onWeightsChanged(weights: Record<string, number>): void {
    this.categoryWeights.set(weights);
    this.readyToLaunch.set(false);
    this.change$.next();
  }

  protected onMinScoreInput(rawValue: string): void {
    const trimmed = rawValue.trim();
    this.minScore.set(trimmed === '' ? null : Math.max(0, Math.min(100, Number(trimmed))));
    this.readyToLaunch.set(false);
    this.change$.next();
  }

  protected onReadyToLaunchChange(checked: boolean): void {
    this.readyToLaunch.set(checked);
    this.change$.next();
  }

  private get containerKind(): ContainerKind {
    return this.isSimpleMode() ? 'encuestas' : 'convocatorias';
  }

  protected openForm(): void {
    this.router.navigate(
      formBuilderPath(this.containerKind, this.convocatoriaId(), this.convocatoriaForm().formId));
  }

  protected openPreview(): void {
    this.router.navigate(
      formPreviewPath(this.containerKind, this.convocatoriaId(), this.convocatoriaForm().formId),
      { queryParams: { [RouteConstants.QUERY_TAB]: 'formularios' } });
  }

  protected generateVersion(): void {
    if (this.generatingVersion()) return;
    this.generatingVersion.set(true);
    this.versionError.set(false);

    this.formsService.generateVersion(this.convocatoriaForm().formId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // The backend repoints this convocatoria to the new version, so the builder we land
        // in is the one the convocatoria now uses.
        next: (newForm) => this.router.navigate(
          formBuilderPath(this.containerKind, this.convocatoriaId(), newForm.id)),
        error: () => {
          this.generatingVersion.set(false);
          this.versionError.set(true);
        },
      });
  }

  protected requestRemove(): void {
    this.removeConfirmOpen.set(true);
  }

  protected cancelRemove(): void {
    this.removeConfirmOpen.set(false);
  }

  protected confirmRemove(): void {
    if (this.removing()) return;
    this.removing.set(true);
    const currentForm = this.convocatoriaForm();

    this.convocatoriaService.removeForm(this.convocatoriaId(), currentForm.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.formsService.remove(currentForm.formId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
          this.removing.set(false);
          this.removeConfirmOpen.set(false);
          this.formRemoved.emit(currentForm.id);
        },
        error: () => this.removing.set(false),
      });
  }
}
