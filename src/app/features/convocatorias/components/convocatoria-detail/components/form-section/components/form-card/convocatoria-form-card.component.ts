import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, debounceTime, forkJoin, switchMap } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RouteConstants, formBuilderPath, formPreviewPath } from '../../../../../../../../core/constants/route.constants';
import { CategoryService } from '../../../../../../../../core/services/category.service';
import { Category } from '../../../../../../../../core/models/category.model';
import { FormsService } from '../../../../../../../forms/services/forms.service';
import { FormStatus } from '../../../../../../../forms/models/form.model';
import { ConvocatoriaService } from '../../../../../../services/convocatoria.service';
import { ConvocatoriaForm } from '../../../../../../models/convocatoria.model';
import { deriveCategoryIds } from '../../../../../../utils/convocatoria.utils';
import { ConvocatoriaWeightsSectionComponent } from '../../../weights-section/convocatoria-weights-section.component';

@Component({
  selector: 'app-convocatoria-form-card',
  imports: [TranslatePipe, LowerCasePipe, ButtonComponent, IconComponent, ConfirmDialogComponent, ConvocatoriaWeightsSectionComponent],
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
  readonly readonly = input(false);

  readonly formUpdated = output<ConvocatoriaForm>();
  readonly formRemoved = output<string>();
  readonly weightPreview = output<number>();

  protected readonly categories = signal<Category[]>([]);
  protected readonly loadingCategories = signal(true);
  protected readonly sectionCount = signal(0);
  protected readonly formStatus = signal<FormStatus | null>(null);
  protected readonly weight = signal(0);
  protected readonly categoryWeights = signal<Record<string, number>>({});
  protected readonly minScore = signal<number | null>(null);
  protected readonly removeConfirmOpen = signal(false);
  protected readonly removing = signal(false);

  private readonly change$ = new Subject<void>();

  ngOnInit(): void {
    const currentForm = this.convocatoriaForm();
    this.weight.set(currentForm.weight);
    this.minScore.set(currentForm.minScore);
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
      })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((updated) => this.formUpdated.emit(updated));
  }

  protected onWeightInput(value: number): void {
    const clamped = Math.max(0, Math.min(100, value || 0));
    this.weight.set(clamped);
    this.weightPreview.emit(clamped);
    this.change$.next();
  }

  protected onWeightsChanged(weights: Record<string, number>): void {
    this.categoryWeights.set(weights);
    this.change$.next();
  }

  protected onMinScoreInput(rawValue: string): void {
    const trimmed = rawValue.trim();
    this.minScore.set(trimmed === '' ? null : Math.max(0, Math.min(100, Number(trimmed))));
    this.change$.next();
  }

  protected openForm(): void {
    this.router.navigate(formBuilderPath(this.convocatoriaForm().formId), {
      queryParams: { [RouteConstants.QUERY_CONVOCATORIA_ID]: this.convocatoriaId() },
    });
  }

  protected openPreview(): void {
    this.router.navigate(formPreviewPath(this.convocatoriaForm().formId), {
      queryParams: { [RouteConstants.QUERY_CONVOCATORIA_ID]: this.convocatoriaId() },
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
