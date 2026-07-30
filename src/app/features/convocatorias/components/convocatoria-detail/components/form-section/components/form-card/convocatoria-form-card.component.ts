import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, debounceTime, forkJoin, switchMap } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RouteConstants, formBuilderPath } from '../../../../../../../../core/constants/route.constants';
import { CategoryService } from '../../../../../../../../core/services/category.service';
import { Category } from '../../../../../../../../core/models/category.model';
import { FormsService } from '../../../../../../../forms/services/forms.service';
import { ConvocatoriaService } from '../../../../../../services/convocatoria.service';
import { ConvocatoriaForm } from '../../../../../../models/convocatoria.model';
import { deriveCategoryIds } from '../../../../../../utils/convocatoria.utils';
import { ConvocatoriaWeightsSectionComponent } from '../../../weights-section/convocatoria-weights-section.component';

@Component({
  selector: 'app-convocatoria-form-card',
  imports: [TranslatePipe, ButtonComponent, IconComponent, ConfirmDialogComponent, ConvocatoriaWeightsSectionComponent],
  templateUrl: './convocatoria-form-card.component.html',
  styleUrl: './convocatoria-form-card.component.scss',
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

  readonly formUpdated = output<ConvocatoriaForm>();
  readonly formRemoved = output<string>();
  readonly weightPreview = output<number>();

  protected readonly categories = signal<Category[]>([]);
  protected readonly loadingCategories = signal(true);
  protected readonly weight = signal(0);
  protected readonly categoryWeights = signal<Record<string, number>>({});
  protected readonly minScore = signal<number | null>(null);
  protected readonly removeConfirmOpen = signal(false);
  protected readonly removing = signal(false);

  private readonly change$ = new Subject<void>();

  ngOnInit(): void {
    const cf = this.convocatoriaForm();
    this.weight.set(cf.weight);
    this.minScore.set(cf.minScore);
    this.categoryWeights.set(Object.fromEntries(cf.categoryWeights.map((w) => [w.categoryId, w.weight])));

    forkJoin({
      form: this.formsService.getById(cf.formId),
      categories: this.categoryService.getAll(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ form, categories }) => {
        const orderedIds = deriveCategoryIds(form);
        const byId = new Map(categories.map((c) => [c.id, c]));
        const resolved = orderedIds.map((catId) => byId.get(catId)).filter((c): c is Category => c !== undefined);
        this.categories.set(resolved);
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
          .filter(([, w]) => w > 0)
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

  protected requestRemove(): void {
    this.removeConfirmOpen.set(true);
  }

  protected cancelRemove(): void {
    this.removeConfirmOpen.set(false);
  }

  protected confirmRemove(): void {
    if (this.removing()) return;
    this.removing.set(true);
    const cf = this.convocatoriaForm();

    this.convocatoriaService.removeForm(this.convocatoriaId(), cf.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.formsService.remove(cf.formId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
          this.removing.set(false);
          this.removeConfirmOpen.set(false);
          this.formRemoved.emit(cf.id);
        },
        error: () => this.removing.set(false),
      });
  }
}
